import {
    PixelRatio,
    Dimensions,
    Platform,
    ToastAndroid,
    Alert,
} from "react-native";
import fs from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import {uses24HourClock} from "react-native-localize";
import { NavigationActions, StackActions } from 'react-navigation';
import { tryToGuessLocation } from "./JCal/Locations";
import DataUtils from "./Data/DataUtils";
import RemoteBackup from "./RemoteBackup";
import AppData from './Data/AppData';
import { StackNavigationProp } from "react-navigation-stack/lib/typescript/src/vendor/types";

export const GLOBALS = Object.freeze({
    VERSION_NAME: DeviceInfo.getReadableVersion().replace(/(.+)\..+/, "$1"),
    IS_IOS: Platform.OS === "ios",
    IS_ANDROID: Platform.OS === "android",
    BUTTON_COLOR: Platform.OS === "android" ? "#99b" : null,
    VALID_PIN: /^\d{4,}$/,
    DB_TEMPLATE_PATH: "data/luachDatabaseTemplate.sqlite",
    DB_WORKING_PATH: fs.DocumentDirectoryPath as string,
    IS_24_HOUR_FORMAT: uses24HourClock(),
});

export function popUpMessage(message: string, optionalTitle: string) {
    if (GLOBALS.IS_ANDROID) {
        ToastAndroid.showWithGravity(
            message,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER
        );
    } else {
        Alert.alert(optionalTitle, message);
    }
}

export async function confirm(message: string, title: string) {
    return new Promise((resolve, reject) => {
        Alert.alert(title, message, [
            {
                text: "No",
                onPress: () => reject(false),
                style: "cancel",
            },
            {
                text: "Yes",
                onPress: () => resolve(true),
            },
        ]);
    });
}
export async function inform(message: string, title: string) {
    return new Promise((resolve, reject) => {
        try {
            Alert.alert(title, message, [
                {
                    text: "OK",
                    onPress: () => resolve(true),
                },
            ]);
        } catch (e) {
            reject(e.message);
        }
    });
}

/**
 * Clears the navigation stack and goes to today on the home screen.
 * @param {Navigator} dispatcher
 * @param {AppData} appData
 */
export function goHomeToday(navigator:StackNavigationProp, appData:AppData) {
    const resetAction = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({
                routeName: "Home",
                params: {
                    appData: appData,
                },
            }),
        ],
    });
    navigator.dispatch(resetAction);
}

/**Gets the current window width in points */
export function getScreenWidth() {
    return Dimensions.get("window").width;
}

/** Gets the current window height in points */
export function getScreenHeight() {
    return Dimensions.get("window").height;
}

/** Is the current screen width less than 650 pixels? */
export function isSmallScreen() {
    return getScreenWidth() * PixelRatio.get() < 650;
}

/** Is the current screen width more than 1390 pixels? */
export function isLargeScreen() {
    return getScreenWidth() * PixelRatio.get() > 1390;
}

/**
 * Returns true only if the given value is null, undefined or NaN.
 * @param {*} val
 */
export function isNullish(val: unknown) {
    return typeof val === "undefined" || val === null || Number.isNaN(val);
}
/**
 * Returns true if "thing" is either a string primitive or String object.
 * @param {unknown} thing
 */
export function isString(thing: unknown) {
    return typeof thing === "string" || thing instanceof String;
}
/**
 * Returns true if "thing" is either a number primitive or a Number object.
 * @param {unknown} thing
 */
export function isNumber(thing: unknown) {
    return typeof thing === "number" || thing instanceof Number;
}
/**
 * Returns true if "thing" is a Date object containing a valid date.
 * @param {unknown} thing
 */
export function isValidDate(thing: unknown) {
    return thing && thing instanceof Date && !Number.isNaN(thing.valueOf());
}
/** Returns whether or not the given, array, string, or argument list contains the given item or substring.
 *
 * This function is awfully similar to Array.includes, but has the added plus of accepting any number or type of arguments. */
export function has(o: unknown, ...arr: Array<unknown>) {
    if (arr.length === 1 && (Array.isArray(arr[0]) || isString(arr[0]))) {
        return (arr[0] as Array<unknown>).includes(o);
    }
    return arr.includes(o);
}

/** Returns the first value unless it is undefined, null or NaN.
 *
 * This is very useful for boolean, string and integer parameters
 * where we want to keep false, "" and 0 if they were supplied.
 *
 * Similar purpose to default parameters with the difference being that this function will return
 * the second value if the first is NaN or null, while default params will give give you the NaN or the null.
 */
export function setDefault(paramValue: unknown, defValue: unknown) {
    return isNullish(paramValue) ? defValue : paramValue;
}

/**
 * Returns true only if the given value is false, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrFalse(val: unknown) {
    return isNullish(val) || val === false;
}
/**
 * Returns true only if the given value is an empty string, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrEmpty(val: unknown) {
    return isNullish(val) || val === "";
}
/**
 * Returns true only if the given value is a string with no non-whitespace characters,
 * null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrWhitespace(val: unknown) {
    return isNullish(val) || (isString(val) && !(val as string).trim());
}
/**
 * Returns true only if the given value is 0, null, undefined or NaN.
 * @param {*} val
 */
export function isNullishOrZero(val: unknown) {
    return isNullish(val) || val === 0;
}
/**
 * Returns an array containing a range of integers.
 * @param {Number} [start] The number to start at. The start number is included in the results.
 * If only one argument is supplied, start will be set to 1.
 * @param {Number} end The top end of the range.
 * Unlike Pythons range function, The end number is included in the results.
 * @returns {[Number]}
 */
export function range(start: number, end?: number): Array<number> {
    let nEnd: number, nStart: number;
    switch (arguments.length) {
        case 0:
            throw new Error('The "end" value must be supplied');
        case 1:
            nStart = 1;
            nEnd = start;
            break;
        default:
            nEnd = end as number;
            nStart = start;
    }
    return Array.from({ length: nEnd - nStart + 1 }, (_v, i) => nStart + i);
}

export function getRandomString(len: number): string {
    return Array(len + 1)
        .join(`${Math.random().toString(36)}00000000000000000`.slice(2, 18))
        .slice(0, len);
}

export function isDev() {
    return (
        process.env.NODE_ENV === "development" ||
        process.env.E2E_BUILD === "true"
    );
}
/**
 * Log message to console
 * @param {*} txt
 */
export function log(txt: string, ...other: Array<unknown>) {
    if (isDev()) {
        // eslint-disable-next-line no-console
        console.log(txt, ...other);
    }
}
/**
 * Warn message to console
 * @param {*} txt
 */
export function warn(txt: string, ...other: Array<unknown>) {
    if (isDev()) {
        // eslint-disable-next-line no-console
        console.warn(txt, ...other);
    }
}
/**
 * Error message to console
 * @param {*} txt
 */
export function error(txt: string, ...other: Array<unknown>) {
    if (isDev()) {
        // eslint-disable-next-line no-console
        console.error(txt, ...other);
    }
}

/**
 * Get a random number of the specified length.
 * @param {Number} length
 */
export function getRandomNumber(length: number): number {
    return Math.floor(
        10 ** (length - 1) + Math.random() * (9 * 10 ** (length - 1))
    );
}

/**
 * Gets just the filename without the path or optionally, without the extension.
 * Returns "test" when supplied with ".../assets/include/blah/folder/test.extension"
 * @param {String} filePath
 */
export function getFileName(
    filePath: string,
    includeExtension: boolean = false
) {
    const regEx = includeExtension ? /.+\/(.+)/ : /.+\/(.+)\..+/;
    return filePath ? filePath.replace(regEx, "$1") : null;
}

export async function fileExists(filePath: string) {
    let exists = await fs.exists(filePath);
    if (!exists && GLOBALS.IS_ANDROID) {
        exists = await fs.existsAssets(filePath);
    }
    return exists;
}

export async function copyFile(fromPath: string, newPath: string) {
    try {
        await fs.copyFile(fromPath, newPath);
        return true;
    } catch {
        if (GLOBALS.IS_ANDROID) {
            await fs.copyFileAssets(fromPath, newPath);
            return true;
        }
    }
    return false;
}

export function getNewDatabaseFullFileName() {
    const d = new Date();
    // The database file is put in a folder where all os's have access
    return `${
        GLOBALS.DB_WORKING_PATH
    }/Luach-${d.getDate()}-${d.getMonth()}-${d.getFullYear()}_${d.getHours()}-${d.getMinutes()}-${d.getSeconds()}.sqlite`;
}

/**
 * Returns a deep clone of any object - note does not clone functions.
 * @param {Object} obj any object
 */
export function deepClone(obj: unknown): unknown {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Returns true if this app has never been launched yet on the current device.
 * Determined by a unique Async storage key for this device.
 */
export async function isFirstTimeRun() {
    const uniqueKey = `LuachDidThis:${DeviceInfo.getUniqueId()}`,
        isFirstTime = !(await AsyncStorage.getItem(uniqueKey));

    if (isFirstTime) {
        log("GeneralUtils.isFirstTimeRun(): IsFirstTime is true.");
        await AsyncStorage.setItem(uniqueKey, "1");
    }
    return isFirstTime;
}

export async function initFirstRun() {
    log("Starting GeneralUtils.initFirstRun()");

    /** *********************************************************************
     * If this is the first time the app was run after a fresh installation,
     * we change the default location to a guess based
     * on the system time zone or else Lakewood NJ.
     *********************************************************************** */
    const newLocation = await tryToGuessLocation();
    log(
        `GeneralUtils.initFirstRun(): Guessed location is ${
            newLocation && newLocation.Name
        }.`
    );
    await DataUtils.SetCurrentLocationOnDatabase(newLocation);
    log(`Location has been set to: ${newLocation.Name}`);
    // Create a remote backup account.
    if (await RemoteBackup.createFreshUserNewAccount()) {
        log(
            "GeneralUtils.initFirstRun(): A new remote account has been created with a random username and password"
        );
    }
}
