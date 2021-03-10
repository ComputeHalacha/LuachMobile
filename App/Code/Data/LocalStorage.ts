import AsyncStorage from "@react-native-async-storage/async-storage";
import { log, error, GLOBALS } from "../GeneralUtils";

const AllKeys = [
    "REQUIRE_PIN",
    "PIN",
    "REMOTE_USERNAME",
    "REMOTE_PASSWORD",
    "DATABASE_PATH",
];

/**
 * @type {{requirePin:boolean, PIN:String, remoteUserName:String, remotePassword:String, databasePath:String }}
 */
export default class LocalStorage {
    _requirePin: boolean;
    _PIN: string | null;
    _remoteUserName: string | null;
    _remotePassword: string | null;
    _databasePath: string;
    constructor() {
        this._requirePin = false;
        this._PIN = null;
        this._remoteUserName = null;
        this._remotePassword = null;
        this._databasePath = GLOBALS.DB_TEMPLATE_PATH;
    }

    get requirePin() {
        return !!this._requirePin;
    }
    set requirePin(val: boolean) {
        LocalStorage.setLocalStorageValue("REQUIRE_PIN", JSON.stringify(!!val));
        this._requirePin = val;
    }

    get PIN(): string | null {
        return this._PIN;
    }
    set PIN(val: string | null) {
        LocalStorage.setLocalStorageValue("PIN", val as string);
        this._PIN = val;
    }

    get remoteUserName() {
        return this._remoteUserName;
    }
    set remoteUserName(val: string | null) {
        LocalStorage.setLocalStorageValue("REMOTE_USERNAME", val as string);
        this._remoteUserName = val;
    }

    get remotePassword() {
        return this._remotePassword;
    }
    set remotePassword(val) {
        LocalStorage.setLocalStorageValue("REMOTE_PASSWORD", val || "");
        this._remotePassword = val;
    }

    get databasePath() {
        return this._databasePath || GLOBALS.DB_TEMPLATE_PATH;
    }
    set databasePath(val) {
        LocalStorage.setLocalStorageValue("DATABASE_PATH", val || "");
        this._databasePath = val;
    }

    /**
     * Loads the current objects properties from the actual device using AsyncStorage
     */
    static async loadAll(): Promise<LocalStorage> {
        return new Promise((resolve, reject) => {
            try {
                AsyncStorage.multiGet(AllKeys, (err, stores) => {
                    if (err) {
                        error(
                            "Error during AsyncStorage.multiGet for settings",
                            err
                        );
                        reject(err);
                    } else {
                        const ls = new LocalStorage();
                        if (stores) {
                            stores.map((result, i, store) => {
                                const key = store[i][0],
                                    value = store[i][1];
                                switch (key) {
                                    case "REQUIRE_PIN":
                                        ls._requirePin =
                                            !!value &&
                                            Boolean(JSON.parse(value));
                                        break;
                                    case "PIN":
                                        ls._PIN = JSON.parse(value as string);
                                        break;
                                    case "REMOTE_USERNAME":
                                        ls._remoteUserName = JSON.parse(
                                            value as string
                                        );
                                        break;
                                    case "REMOTE_PASSWORD":
                                        ls._remotePassword = JSON.parse(
                                            value as string
                                        );
                                        break;
                                    case "DATABASE_PATH":
                                        ls._databasePath = JSON.parse(
                                            value as string
                                        );
                                        break;
                                }
                            });
                        }
                        resolve(ls);
                    }
                });
            } catch (er) {
                reject(er);
            }
        });
    }

    async clear() {
        await AsyncStorage.multiRemove(AllKeys);
    }

    static async setLocalStorageValue(name: string, value: string) {
        try {
            if (value !== null && typeof value !== "undefined") {
                await AsyncStorage.setItem(name, JSON.stringify(value));
                log("Set " + name + " to " + value + " in storage data");
            } else {
                //Undefined or null value - if we find it in the storage, it will be removed
                const allKeys = await AsyncStorage.getAllKeys();
                if (allKeys.includes(name)) {
                    await AsyncStorage.removeItem(name);
                    log("Removed " + name + " from in storage data");
                }
            }
        } catch (e) {
            error(
                "Failed to set " + name + " to " + value + " in storage data:",
                e
            );
        }
    }

    static async wasInitialized() {
        return new Promise((resolve, reject) => {
            try {
                AsyncStorage.getAllKeys((err, keys) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            keys && keys.length && keys.includes("REQUIRE_PIN")
                        );
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static async wasDatabasepathInitialized(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                AsyncStorage.getAllKeys((err, keys) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            !!keys &&
                            keys.length > 0 &&
                            keys.includes("DATABASE_PATH")
                        );
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    static async initialize(requirePin: boolean, PIN: string) {
        if (!(await this.wasInitialized())) {
            LocalStorage.setLocalStorageValue(
                "REQUIRE_PIN",
                JSON.stringify(!!requirePin)
            );
            LocalStorage.setLocalStorageValue("PIN", PIN);
        }
        if (!(await this.wasDatabasepathInitialized())) {
            //This is the inbuilt original database
            LocalStorage.setLocalStorageValue(
                "DATABASE_PATH",
                GLOBALS.DB_TEMPLATE_PATH
            );
        }
    }
}
