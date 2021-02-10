import SQLite from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import {
  getGlobals,
  isDev,
  log,
  error,
  warn,
  fileExists
} from '../GeneralUtils';
import AppData from './AppData';
import JDate from '../JCal/JDate';
import Settings from '../Settings';
import Location from '../JCal/Location';
import { UserOccasion, UserOccasionTypes } from '../JCal/UserOccasion';
import Entry from '../Chashavshavon/Entry';
import EntryList from '../Chashavshavon/EntryList';
import { NightDay, Onah } from '../Chashavshavon/Onah';
import { Kavuah, KavuahTypes } from '../Chashavshavon/Kavuah';
import { TaharaEvent, TaharaEventType } from '../Chashavshavon/TaharaEvent';
import Utils from '../JCal/Utils';
import LocalStorage from './LocalStorage';


SQLite.DEBUG(!!__DEV__);
SQLite.enablePromise(true);

export default class DataUtils {
  static databasePath = getGlobals().DEFAULT_DB_PATH;

  static allLocations: Array<Location> = [];

  static async getDatabasePath() {
    if (DataUtils.databasePath) {
        return DataUtils.databasePath;
    } else {
        const localStorage = await LocalStorage.loadAll();
        DataUtils.databasePath = localStorage.databasePath;
        return localStorage.databasePath;
    }
}

/**
 * Gets the true actual database path that the data is getting read from and written to
 */
static async getDatabaseAbsolutePath() {
    const path = await this.getDatabasePath(),
        databasePath = path && path.replace('~', '');
    return path
        ? getGlobals().IS_ANDROID
            ? `/data/data/${getAppBundleIdAndroid()}/databases/${getFileName(
                  databasePath
              )}`
            : databasePath
        : null;
}

  static async SettingsFromDatabase(): Promise<Settings> {
    const settings = new Settings();
    try {
      const results = await DataUtils.executeSql('SELECT * from settings');
      const dbSet = results.list[0];
      settings.location =
        (await DataUtils.LocationFromDatabase(dbSet.locationId)) ||
        Location.getLakewood();
      settings.showOhrZeruah = !!dbSet.showOhrZeruah;
      settings.keepThirtyOne = !!dbSet.keepThirtyOne;
      settings.onahBeinunis24Hours = !!dbSet.onahBeinunis24Hours;
      settings.numberMonthsAheadToWarn = dbSet.numberMonthsAheadToWarn;
      settings.keepLongerHaflagah = !!dbSet.keepLongerHaflagah;
      // In the database; the dilugChodeshPastEnds value is stored
      // in a field misnamed "cheshbonKavuahByCheshbon".
      // A field that was no longer in use was appropriated for this value;
      // and we don't want to change the database schema itself
      // so as not to overwrite existing data.
      settings.dilugChodeshPastEnds = !!dbSet.cheshbonKavuahByCheshbon;
      settings.haflagaOfOnahs = !!dbSet.haflagaOfOnahs;
      settings.kavuahDiffOnahs = !!dbSet.kavuahDiffOnahs;
      settings.calcKavuahsOnNewEntry = !!dbSet.calcKavuahsOnNewEntry;
      settings.showProbFlagOnHome = !!dbSet.showProbFlagOnHome;
      settings.showEntryFlagOnHome = !!dbSet.showEntryFlagOnHome;
      settings.navigateBySecularDate = !!dbSet.navigateBySecularDate;
      settings.showIgnoredKavuahs = !!dbSet.showIgnoredKavuahs;
      settings.noProbsAfterEntry = !!dbSet.noProbsAfterEntry;
      settings.hideHelp = !!dbSet.hideHelp;
      settings.discreet = !!dbSet.discreet;
      settings.autoBackup = !!dbSet.autoBackup;
      settings.remindBedkMornTime = dbSet.remindBedkMornTime;
      settings.remindBedkAftrnHour = dbSet.remindBedkAftrnHour;
      settings.remindMikvahTime = dbSet.remindMikvahTime;
      settings.remindDayOnahHour = dbSet.remindDayOnahHour;
      settings.remindNightOnahHour = dbSet.remindNightOnahHour;
      /** *******************************************************************************
                If this is the first run after version 1.73 -
                where the requirePIN and PIN were moved out from the database into local storage,
                AND the databasePath was moved from a static string to local storage,
                we will move those values over from the database into local storage.
                This will not override local storage values afterwards as LocalStorage.initialize
                only saves the values if the local storage has never been initialized. */

      LocalStorage.initialize(dbSet.requirePIN, dbSet.PIN);
      /** ******************************************************************************* */
    } catch (err) {
      warn('Error trying to get settings from the database.');
      error(err);
    }

    return settings;
  }

  static async SettingsToDatabase(settings: Settings) {
    try {
      await DataUtils.executeSql(
        `UPDATE settings SET
                locationId=?,
                showOhrZeruah=?,
                keepThirtyOne=?,
                onahBeinunis24Hours=?,
                numberMonthsAheadToWarn=?,
                keepLongerHaflagah=?,
                cheshbonKavuahByCheshbon=?,
                haflagaOfOnahs=?,
                kavuahDiffOnahs=?,
                calcKavuahsOnNewEntry=?,
                showProbFlagOnHome=?,
                showEntryFlagOnHome=?,
                navigateBySecularDate=?,
                showIgnoredKavuahs=?,
                noProbsAfterEntry=?,
                hideHelp=?,
                discreet=?,
                autoBackup=?,
                remindBedkMornTime=?,
                remindBedkAftrnHour=?,
                remindMikvahTime=?,
                remindDayOnahHour=?,
                remindNightOnahHour=?`,
        [
          // Lakewood is the default - locationId: 185
          (settings.location && settings.location.locationId) || 185,
          settings.showOhrZeruah,
          settings.keepThirtyOne,
          settings.onahBeinunis24Hours,
          settings.numberMonthsAheadToWarn,
          settings.keepLongerHaflagah,
          settings.dilugChodeshPastEnds,
          settings.haflagaOfOnahs,
          settings.kavuahDiffOnahs,
          settings.calcKavuahsOnNewEntry,
          settings.showProbFlagOnHome,
          settings.showEntryFlagOnHome,
          settings.navigateBySecularDate,
          settings.showIgnoredKavuahs,
          settings.noProbsAfterEntry,
          settings.hideHelp,
          settings.discreet,
          settings.autoBackup,
          settings.remindBedkMornTime
            ? Utils.getSimpleTimeString(settings.remindBedkMornTime)
            : null,
          settings.remindBedkAftrnHour,
          settings.remindMikvahTime
            ? Utils.getSimpleTimeString(settings.remindMikvahTime)
            : null,
          settings.remindDayOnahHour,
          settings.remindNightOnahHour
        ]
      );
    } catch (err) {
      warn('Error trying to enter settings into the database.');
      error(err);
    }
  }

  static async SetCurrentLocationOnDatabase(location: Location) {
    try {
      await DataUtils.executeSql(
        `UPDATE settings SET
                locationId=?`,
        [location.locationId]
      );
    } catch (err) {
      warn('Error trying to enter location setting into the database.');
      error(err);
    }
  }

  static async EntryListFromDatabase(): Promise<EntryList> {
    const entryList = new EntryList();
    try {
      const results = await DataUtils.executeSql(
        'SELECT * from entries ORDER BY dateAbs, day'
      );
      results.list.forEach(
        (e: {
          dateAbs: number;
          day: boolean;
          entryId: number;
          ignoreForFlaggedDates: boolean;
          ignoreForKavuah: boolean;
          comments: string;
        }) => {
          const onah = new Onah(
            new JDate(e.dateAbs),
            e.day ? NightDay.Day : NightDay.Night
          );
          entryList.add(
            new Entry(
              onah,
              e.entryId,
              e.ignoreForFlaggedDates,
              e.ignoreForKavuah,
              e.comments
            )
          );
        }
      );
      entryList.calculateHaflagas();
    } catch (err) {
      warn('Error trying to get all entries from the database.');
      error(err);
    }
    return entryList;
  }

  static async LocationFromDatabase(locationId: number) {
    let location: Location | null = null;
    if (!locationId) {
      throw 'locationId parameter cannot be empty. Use GetAllLocations to retrieve all locations.';
    }
    try {
      const ls = await DataUtils.queryLocations('locationId=?', [locationId]);
      if (ls.length > 0) {
        [location] = ls;
      }
    } catch (err) {
      warn(
        `Error loading location id ${locationId} from the database: ${err.message}`
      );
    }
    return location;
  }

  /**
   * Add a Location to the list in the database
   * @param {Location} location The location to add
   */
  static async LocationToDatabase(location: Location): Promise<Location> {
    const loc = location;
    const params = [
      location.Name,
      location.Israel,
      location.Latitude,
      location.Longitude,
      location.UTCOffset,
      location.Elevation,
      location.CandleLighting
    ];
    if (location.hasId()) {
      try {
        await DataUtils.executeSql(
          `UPDATE locations SET
                        name=?,
                        israel=?,
                        latitude=?,
                        longitude=?,
                        utcoffset=?,
                        elevation=?,
                        candles=?
                    WHERE locationId=?`,
          [...params, location.locationId]
        );
        log(`Updated Location Id ${location.locationId.toString()}`);
        return loc;
      } catch (err) {
        warn(
          `Error trying to update Location Id ${location.locationId.toString()} to the database.`
        );
        error(err);
        return loc;
      }
    } else {
      try {
        const results = await DataUtils.executeSql(
          `INSERT INTO locations (
                            name,
                            israel,
                            latitude,
                            longitude,
                            utcoffset,
                            elevation,
                            candles)
                        VALUES (?,?,?,?,?,?,?)`,
          params
        );
        loc.locationId = results.id;
        return loc;
      } catch (err) {
        warn('Error trying to insert location into the database.');
        error(err);
        return loc;
      }
    }
  }

  /**
   * Deletes a Location from the locations table
   * @param {Location} location The location to remove from the database
   */
  static async DeleteLocation(location: Location) {
    if (!location.hasId()) {
      throw 'Locations can only be deleted from the database if they have an id';
    }
    try {
      await DataUtils.executeSql('DELETE from locations where locationId=?', [
        location.locationId
      ]);
    } catch (err) {
      warn(
        `Error trying to delete location id ${location.locationId} from the database`
      );
      error(err);
    }
  }

  /** Returns a list of Location objects containing all the locations in the database.
   * @returns [Location]
   */
  static async GetAllLocations() {
    if (DataUtils.allLocations.length === 0) {
      DataUtils.allLocations = await DataUtils.queryLocations();
      log(
        `DataUtils.GetAllLocations(): ${DataUtils.allLocations.length} locations returned from the database`
      );
    }

    return DataUtils.allLocations;
  }

  /**
   * Returns a list of the Location objects in the database that their name or heb values contain the search term.
   * The search is not case sensitive.
   * @param {String} searchTerm The terms to search for
   * @param {Boolean} [utcOffset] Does the results need to match the current utc offset?
   * @returns {<[Location]>}
   */
  static async SearchLocations(searchTerm: string, utcOffset: boolean) {
    if (!searchTerm) {
      throw 'Search parameter cannot be empty. Use GetAllLocations to retrieve all locations.';
    }
    let where = "(name || IFNULL(heb, '') LIKE ?)";
    const values: Array<number | string | boolean | Date | null> = [
      `%${searchTerm}%`
    ];
    if (utcOffset) {
      where += ' and utcOffset=?';
      values.push(Utils.currUtcOffset());
    }
    return DataUtils.queryLocations(where, values);
  }

  static async GetAllUserOccasions(): Promise<Array<UserOccasion>> {
    let list: Array<UserOccasion> = [];
    try {
      const results = await DataUtils.executeSql(
        'SELECT * from occasions ORDER BY dateAbs'
      );
      list = results.list.map(
        (o: {
          title: string;
          type: UserOccasionTypes;
          dateAbs: number;
          color: string;
          comments: string;
          occasionId: number;
        }) =>
          new UserOccasion(
            o.title,
            o.type,
            o.dateAbs,
            o.color,
            o.comments,
            o.occasionId
          )
      );
    } catch (err) {
      warn('Error trying to get all occasions from the database.');
      error(err);
    }
    return list;
  }

  static async UserOccasionToDatabase(
    occasion: UserOccasion
  ): Promise<UserOccasion> {
    const occ = occasion;
    const params = [
      occasion.title,
      occasion.occasionType,
      occasion.dateAbs,
      occasion.isCustomColor() ? occasion.color : null,
      occasion.comments
    ];
    if (occasion.hasId) {
      try {
        await DataUtils.executeSql(
          `UPDATE occasions SET
                        title=?,
                        type=?,
                        dateAbs=?,
                        color=?,
                        comments=?
                    WHERE occasionId=?`,
          [...params, occasion.occasionId]
        );
        log(`Updated Occasion Id ${occasion.occasionId.toString()}`);
        return occ;
      } catch (err) {
        warn(
          `Error trying to update Occasion Id ${occasion.occasionId.toString()} to the database.`
        );
        error(err);
        return occ;
      }
    } else {
      try {
        const results = await DataUtils.executeSql(
          `INSERT INTO occasions (
                        title,
                        type,
                        dateAbs,
                        color,
                        comments)
                    VALUES (?,?,?,?,?)`,
          params
        );
        occ.occasionId = results.id;
        log(
          `New occasion "${occasion.title}" was inserted. OccasionId is ${occasion.occasionId}`
        );
        return occ;
      } catch (err) {
        warn('Error trying to insert occasion into the database.');
        error(err);
        return occ;
      }
    }
  }

  static async DeleteUserOccasion(occasion: UserOccasion) {
    if (!occasion.hasId) {
      throw 'Occasions can only be deleted from the database if they have an id';
    }
    try {
      await DataUtils.executeSql('DELETE from occasions where occasionId=?', [
        occasion.occasionId
      ]);
    } catch (err) {
      warn(
        `Error trying to delete occasion id ${occasion.occasionId} from the database`
      );
      error(err);
    }
  }

  /**
   * Gets all Kavuahs from the database.
   * @param {EntryList|[Entry]} entries An EntryList instance or an Array of entries where the settingEntry can be found
   */
  static async GetAllKavuahs(
    entries: Array<Entry> | EntryList
  ): Promise<Array<Kavuah>> {
    const entryList = entries;
    let list: Array<Kavuah> = [];
    try {
      const results = await DataUtils.executeSql('SELECT * from kavuahs');
      list = results.list.map(
        (k: {
          kavuahType: KavuahTypes;
          settingEntryId: number;
          specialNumber: number;
          cancelsOnahBeinunis: boolean;
          active: boolean;
          ignore: boolean;
          kavuahId: number | undefined;
        }) => {
          const kav = new Kavuah(
            k.kavuahType,
            entryList.find(e => e.entryId === k.settingEntryId),
            k.specialNumber,
            !!k.cancelsOnahBeinunis,
            !!k.active,
            !!k.ignore,
            k.kavuahId
          );
          return kav;
        }
      );
    } catch (err) {
      warn('Error trying to get all kavuahs from the database.');
      error(err);
    }
    return list;
  }

  /**
   * Gets all TaharaEvents from the database.
   */
  static async GetAllTaharaEvents(): Promise<Array<TaharaEvent>> {
    let list: Array<TaharaEvent> = [];
    try {
      const results = await DataUtils.executeSql(
        'SELECT * from taharaEvents ORDER BY dateAbs'
      );
      list = results.list.map(
        (te: {
          dateAbs: number;
          taharaEventType: TaharaEventType;
          taharaEventId: number;
        }) =>
          new TaharaEvent(
            new JDate(te.dateAbs),
            te.taharaEventType,
            te.taharaEventId
          )
      );
    } catch (err) {
      warn('Error trying to get all taharaEvents from the database.');
      error(err);
    }
    return list;
  }

  static async KavuahToDatabase(
    appData: AppData,
    kavuah: Kavuah
  ): Promise<Kavuah> {
    if (!(kavuah.settingEntry && kavuah.settingEntry.hasId)) {
      throw "A kavuah can not be saved to the database unless it's setting entry is already in the database.";
    }
    const kav = kavuah;
    const params = [
      kavuah.kavuahType,
      kavuah.settingEntry.entryId,
      kavuah.specialNumber,
      kavuah.cancelsOnahBeinunis,
      kavuah.active,
      kavuah.ignore
    ];
    if (kavuah && kavuah.hasId) {
      try {
        await DataUtils.executeSql(
          `UPDATE kavuahs SET
                        kavuahType=?,
                        settingEntryId=?,
                        specialNumber=?,
                        cancelsOnahBeinunis=?,
                        active=?,
                        [ignore]=?
                    WHERE kavuahId=?`,
          [...params, kavuah.kavuahId]
        );
        log(`Updated Kavuah Id ${kavuah.kavuahId?.toString()}`);
        appData.updateProbsAndClean();
        return kav;
      } catch (err) {
        warn(
          `Error trying to update Kavuah Id ${kavuah.kavuahId?.toString()} to the database.`
        );
        error(err);
        return kav;
      }
    } else {
      try {
        const results = await DataUtils.executeSql(
          `INSERT INTO kavuahs (
                        kavuahType,
                        settingEntryId,
                        specialNumber,
                        cancelsOnahBeinunis,
                        active,
                        [ignore])
                    VALUES (?,?,?,?,?,?)`,
          params
        );
        kav.kavuahId = results.id;
        appData.addOrRemoveChashItem(kavuah);
        return kav;
      } catch (err) {
        warn('Error trying to insert kavuah into the database.');
        error(err);
        return kav;
      }
    }
  }

  static async DeleteKavuah(appData: AppData, kavuah: Kavuah) {
    if (!kavuah.hasId) {
      throw 'Kavuahs can only be deleted from the database if they have an id';
    }
    try {
      await DataUtils.executeSql('DELETE from kavuahs where kavuahId=?', [
        kavuah.kavuahId
      ]);
      appData.addOrRemoveChashItem(kavuah, true);
    } catch (err) {
      warn(
        `Error trying to delete kavuah id ${kavuah.kavuahId} from the database`
      );
      error(err);
    }
  }

  static async EntryToDatabase(appData: AppData, entry: Entry): Promise<Entry> {
    const ent = entry;
    if (entry.hasId) {
      try {
        await DataUtils.executeSql(
          'UPDATE entries SET dateAbs=?, day=?, ignoreForFlaggedDates=?, ignoreForKavuah=?, comments=? WHERE entryId=?',
          [
            entry.date.Abs,
            entry.nightDay === NightDay.Day,
            entry.ignoreForFlaggedDates,
            entry.ignoreForKavuah,
            entry.comments,
            entry.entryId
          ]
        );
        log(`Updated Entry Id ${entry.entryId.toString()}`);
        appData.updateProbsAndClean();
        return ent;
      } catch (err) {
        warn(
          `Error trying to update entry id ${entry.entryId.toString()} to the database.`
        );
        error(err);
        return ent;
      }
    } else {
      try {
        const results = await DataUtils.executeSql(
          'INSERT INTO entries (dateAbs, day, ignoreForFlaggedDates, ignoreForKavuah, comments) VALUES (?, ?, ?, ?, ?)',
          [
            entry.date.Abs,
            entry.nightDay === NightDay.Day,
            entry.ignoreForFlaggedDates,
            entry.ignoreForKavuah,
            entry.comments
          ]
        );
        ent.entryId = results.id;
        appData.addOrRemoveChashItem(entry);
        return ent;
      } catch (err) {
        warn('Error trying to insert entry into the database.');
        error(err);
        return ent;
      }
    }
  }

  static async DeleteEntry(appData: AppData, entry: Entry) {
    if (!entry.hasId) {
      throw 'Entries can only be deleted from the database if they have an id';
    }
    try {
      await DataUtils.executeSql('DELETE from entries where entryId=?', [
        entry.entryId
      ]);
      appData.addOrRemoveChashItem(entry, true);
    } catch (err) {
      warn(
        `Error trying to delete entry id ${entry.entryId} from the database`
      );
      error(err);
    }
  }

  static async TaharaEventToDatabase(
    taharaEvent: TaharaEvent
  ): Promise<TaharaEvent> {
    const te = taharaEvent;
    if (taharaEvent.hasId) {
      try {
        await DataUtils.executeSql(
          'UPDATE taharaEvents SET dateAbs=?, taharaEventType=? WHERE taharaEventId=?',
          [
            taharaEvent.jdate.Abs,
            taharaEvent.taharaEventType,
            taharaEvent.taharaEventId
          ]
        );
        log(`Updated TaharaEvent Id ${taharaEvent.taharaEventId.toString()}`);
        return te;
      } catch (err) {
        warn(
          `Error trying to update taharaEvent id ${taharaEvent.taharaEventId.toString()} to the database.`
        );
        error(err);
        return te;
      }
    } else {
      try {
        const results = await DataUtils.executeSql(
          'INSERT INTO taharaEvents (dateAbs, taharaEventType) VALUES (?, ?)',
          [taharaEvent.jdate.Abs, taharaEvent.taharaEventType]
        );
        te.taharaEventId = results.id;
        return te;
      } catch (err) {
        warn('Error trying to insert taharaEvent into the database.');
        error(err);
        return te;
      }
    }
  }

  static async DeleteTaharaEvent(taharaEvent: TaharaEvent) {
    if (!taharaEvent.hasId) {
      throw 'TaharaEvents can only be deleted from the database if they have an id';
    }
    await DataUtils.executeSql(
      'DELETE from taharaEvents where taharaEventId=?',
      [taharaEvent.taharaEventId]
    ).catch(err => {
      warn(
        `Error trying to delete taharaEvent id ${taharaEvent.taharaEventId} from the database`
      );
      error(err);
    });
  }

  /**
   * Retrieve the table schema. Each of the returned rows represents a single column of the table.
   * The fields returned by sqlite for this query are: cid, name, type, notnull, dflt_value, pk.
   * @param {String} tableName
   */
  static async GetTableFields(tableName: string) {
    let list = [];
    try {
      const results = await DataUtils.executeSql(
        `PRAGMA table_info(${tableName})`
      );
      list = results.list;
    } catch (err) {
      warn(
        `Error trying to get fields of ${tableName} table from the database`
      );
      error(err);
    }
    return list;
  }

  /**
   * Add a new table field.
   * @param {{table:String, name:String, type:String, allowNull:Boolean, defaultValue:String}} newField
   */
  static async AddTableField(newField: {
    table: string;
    name: string;
    type: string;
    allowNull?: boolean;
    defaultValue?: string | number | boolean | Date | null;
  }) {
    await DataUtils.executeSql(
      `ALTER TABLE ${newField.table}
            ADD COLUMN ${newField.name}
                ${newField.type}
                ${newField.allowNull ? '' : 'NOT '} NULL
                ${
                  newField.defaultValue
                    ? `DEFAULT ${
                        typeof newField.defaultValue === 'string'
                          ? `'${newField.defaultValue}'`
                          : newField.defaultValue.toString()
                      }`
                    : ''
                }`
    ).catch(err => {
      warn(
        `Error trying to add the field "${newField.name}" to the "${newField.table}" table`
      );
      error(err);
    });
  }

  /**
   * Queries the locations table of the local sqlite database, and returns a list of Location objects.
   * @param {String} [whereClause] Optional whereClause should be a valid SQLite statement - such as "name = 'New York'" or "name = ?".
   * @param {[any]} [values] Array of values to be used for the whereClause if it contains any sqlite parameters - such as 'id=?'. For example, if the whereClause is "name=? and israel=?", then values should be: ['Natanya', true].
   */
  static async queryLocations(
    whereClause?: string,
    values?: Array<string | number | boolean | Date | null>
  ): Promise<Array<Location>> {
    const list: Array<Location> = [];
    const results = await DataUtils.executeSql(
      `SELECT * FROM locations ${
        whereClause ? ` WHERE ${whereClause}` : ''
      } ORDER BY name`,
      values
    );
    results.list.forEach(
      (l: {
        name: string;
        israel: boolean;
        latitude: number;
        longitude: number;
        utcoffset: number;
        elevation: number;
        candles: number | undefined;
        locationId: number | undefined;
      }) =>
        list.push(
          new Location(
            l.name,
            !!l.israel,
            l.latitude,
            l.longitude,
            l.utcoffset,
            l.elevation && l.elevation > 0 ? l.elevation : 0,
            l.candles,
            l.locationId
          )
        )
    );
    log(
      `442 - ${list.length} Locations returned from db in DataUtils.queryLocations`
    );
    return list;
  }

  /**
   * Executes sql on the database. promise resolves with an object { list: ResultsArray, id: LastInsertedRowId }
   * @param {String} sql The sql to execute. Can contain parameters - in the form of ? characters.
   * @param {[string | number | Date | boolean | null]} values Array of the values to be used for any sqlite parameters in the sql
   */
  static async executeSql(
    sql: string,
    values?: Array<string | number | Date | boolean | null | undefined>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resultsList: any[] = [];
    let insertId = -1;
    let db: unknown;

    DataUtils.assureDatabaseExists();

    try {
      const database = await open({
        filename: DataUtils.databasePath,
        driver: sqlite3.cached.Database
      });
      db = database;
      log(
        `0120 - database ${DataUtils.databasePath} is open.
         Starting execution of ${sql} - with values ${values}`
      );
      if (sql.toUpperCase().startsWith('SELECT')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultsList = await database.all<any[]>(sql, values);
        if (resultsList) {
          log(
            `0121 - the sql was executed successfully - ${resultsList.length} rows returned`
          );
        }
      } else {
        const results = await database.run(sql, values);
        if (results.changes) {
          log(
            `0122 - no-result sql was executed successfully - ${results.changes} rows affected`
          );
        }
        if (results.lastID) {
          insertId = results.lastID;
          log(
            `0123 - INSERT statement executed successfully - ID of inserted item is ${results.lastID}`
          );
        }
      }
    } catch (err) {
      warn(`0124 - error opening database - ${DataUtils.databasePath}`);
      error(err);
      await DataUtils.closeDatabase(db as sqlite3.Database);
    }

    return { list: resultsList, id: insertId };
  }

  static assureDatabaseExists() {
    if (fileExists(DataUtils.databasePath)) {
      return true;
    }
    try {
      const globals = getGlobals();
      DataUtils.assureAppDataFolderExists();
      log(
        `${DataUtils.databasePath} was not found.
        Starting copy from ${globals.INITIAL_DB_PATH} to ${globals.DEFAULT_DB_PATH}`
      );
      if (!fs.existsSync(globals.INITIAL_DB_PATH)) {
        throw `File is missing: ${globals.INITIAL_DB_PATH}`;
      }
      try {
        fs.copyFileSync(globals.INITIAL_DB_PATH, globals.DEFAULT_DB_PATH);
        DataUtils.databasePath = globals.DEFAULT_DB_PATH;
        return true;
      } catch (err) {
        error(err);
        log(
          `Failed to copy ${globals.INITIAL_DB_PATH} to ${globals.DEFAULT_DB_PATH} due to error ${err.message}`
        );
        return false;
      }
    } catch (err) {
      error(err);
      return false;
    }
  }

  static assureAppDataFolderExists() {
    const globals = getGlobals();
    if (!fs.existsSync(globals.APPDATA_FOLDER)) {
      log(
        `DataUtils.assureAppDataFolderExists(): User App data folder not found. Creating ${globals.APPDATA_FOLDER}`
      );
      fs.mkdir(globals.APPDATA_FOLDER, { recursive: true }, err => {
        if (err) {
          error(err.toString());
          throw err;
        }
      });
    }
  }

  static async closeDatabase(db: Database) {
    if (db) {
      try {
        await db.close();
        log('130 -  Database is now CLOSED');
      } catch (err) {
        warn('131 - error closing database');
        error(err);
      }
    } else {
      warn('132 - db variable is not a database object');
    }
  }
}

/**
 * An ugly hack to get the current apps internal name on Android.
 */
export function getAppBundleIdAndroid() {
  if (getGlobals().IS_ANDROID) {
      return RNFS.DocumentDirectoryPath.replace(/.+\/(.+?)\/files/, '$1');
  }
}
