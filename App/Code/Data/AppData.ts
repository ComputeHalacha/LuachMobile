import DataUtils from "./DataUtils";
import Settings from "../Settings";
import Entry from "../Chashavshavon/Entry";
import { Kavuah } from "../Chashavshavon/Kavuah";
import EntryList from "../Chashavshavon/EntryList";
import { UserOccasion } from "../JCal/UserOccasion";
import ProblemOnah from "../Chashavshavon/ProblemOnah";
import { TaharaEvent } from "../Chashavshavon/TaharaEvent";
import {
    resetDayOnahReminders,
    resetNightOnahReminders,
    removeAllDayOnahReminders,
    removeAllNightOnahReminders,
} from "../Notifications";
import {
    log,
    isNullishOrFalse,
    isFirstTimeRun,
    initFirstRun,
} from "../GeneralUtils";

/**
 * List of fields that have been added after the initial app launch.
 * Any that do not yet exist, will be added to the db schema during initial loading.
 * Optionally sets an async callback to run after the field has been added.
 */
const addedFields: Array<{
    table: string;
    name: string;
    type: string;
    allowNull?: boolean;
    defaultValue?: string | number | boolean | null;
    afterAddCallback?: Function;
}> = [];

/**
 * An single object that contains all the application data.
 * Ideally, there should only be a single global instance of this class.
 */
export default class AppData {
    Settings: Settings;

    UserOccasions: UserOccasion[];

    EntryList: EntryList;

    KavuahList: Kavuah[];

    ProblemOnahs: ProblemOnah[];

    TaharaEvents: TaharaEvent[];

    /**
     * @param {?Settings} settings
     * @param {?[UserOccasion]} occasions
     * @param {?EntryList} entryList
     * @param {?[Kavuah]} kavuahList
     * @param {?[ProblemOnah]} problemOnahs
     * @param {?[TaharaEvent]} taharaEvents
     */
    constructor(
        settings?: Settings,
        occasions?: UserOccasion[],
        entryList?: EntryList,
        kavuahList?: Kavuah[],
        problemOnahs?: ProblemOnah[],
        taharaEvents?: TaharaEvent[]
    ) {
        this.Settings = settings || new Settings({});
        this.UserOccasions = occasions || [];
        this.EntryList = entryList || new EntryList();
        this.KavuahList = kavuahList || [];
        this.ProblemOnahs = problemOnahs || [];
        this.TaharaEvents = taharaEvents || [];
    }

    /**
     *  Calculates all the Entry Haflagas and Flagged Dates for this appData instance.
     */
    updateProbsAndClean() {
        this.EntryList.calculateHaflagas();
        let probs: ProblemOnah[] = [];
        if (this.EntryList.length > 0) {
            probs = this.EntryList.getProblemOnahs(
                this.KavuahList,
                this.Settings
            );
        }
        this.ProblemOnahs = probs;

        if (isNullishOrFalse(this.Settings.remindDayOnahHour)) {
            removeAllDayOnahReminders();
        } else {
            resetDayOnahReminders(this);
        }
        if (isNullishOrFalse(this.Settings.remindNightOnahHour)) {
            removeAllNightOnahReminders();
        } else {
            resetNightOnahReminders(this);
        }
    }

    /**
     * Adds or removes the given item to the appropriate list in this appData object.
     * The Entry Haflagas and Flagged Dates are then recalculated.
     * @param {Entry | Kavuah} item
     * @param {Boolean} remove
     */
    addOrRemoveChashItem(item?: Entry | Kavuah, remove?: boolean) {
        if (item) {
            if (!remove) {
                if (item instanceof Entry) {
                    this.EntryList.add(item);
                } else if (item instanceof Kavuah) {
                    this.KavuahList.push(item);
                }
            } else if (item instanceof Entry) {
                this.EntryList.remove(item);
            } else if (item instanceof Kavuah) {
                const index = this.KavuahList.indexOf(item);
                if (index > -1) {
                    this.KavuahList.splice(index, 1);
                }
            }
        }
        this.updateProbsAndClean();
    }

    /**
     * Return a clone of this AppData object
     */
    clone() {
        return new AppData(
            this.Settings,
            this.UserOccasions,
            this.EntryList,
            this.KavuahList,
            this.ProblemOnahs,
            this.TaharaEvents
        );
    }

    /**
     * Returns the global appData object.
     * The first time this function is called, the global object is filled with the data from the local database file.
     */
    static async getAppData() {
        const glb = global as any;
        if (!glb.GlobalAppData) {
            glb.GlobalAppData = await AppData.fromDatabase();
            glb.IsFirstRun = await isFirstTimeRun();
            if (glb.IsFirstRun) {
                await initFirstRun();
            }
        }
        return glb.GlobalAppData;
    }

    /**
     * Update the schema of the local database file.
     * Any new fields that do not yet exist, will be added to the db schema.
     */
    static async upgradeDatabase() {
        // First get a list of tables that may need updating.
        const tablesToChange: Array<string> = [];
        addedFields.forEach((af) => {
            if (!tablesToChange.includes(af.table)) {
                tablesToChange.push(af.table);
            }
        });
        tablesToChange.forEach(async (tbl) => {
            // Get the new fields for this table.
            const newFields = addedFields.filter((af) => af.table === tbl);
            const fields = await DataUtils.GetTableFields(tbl);

            newFields.forEach(async (nf) => {
                if (!fields.some((f) => f.name === nf.name)) {
                    // Add any new fields that were added after the last update.
                    await DataUtils.AddTableField(nf);
                    // If there was a callback supplied.
                    if (nf.afterAddCallback) {
                        await nf.afterAddCallback();
                    }
                }
            });
        });
    }

    /**
     * Returns an appData instance containing all the user data from the local database file.
     */
    static async fromDatabase() {
        // Before getting data from database, make sure that the local database schema is up to date.
        await AppData.upgradeDatabase();

        const settings = await DataUtils.SettingsFromDatabase();
        const occasions = await DataUtils.GetAllUserOccasions();
        const entryList = await DataUtils.EntryListFromDatabase();
        const kavuahList = await DataUtils.GetAllKavuahs(entryList);
        const taharaEvents = await DataUtils.GetAllTaharaEvents();

        // After getting all the data, the problem onahs are set.
        const problemOnahs = (entryList as EntryList).getProblemOnahs(
            kavuahList,
            settings
        );

        return new AppData(
            settings,
            occasions,
            entryList,
            kavuahList,
            problemOnahs,
            taharaEvents
        );
    }
}
