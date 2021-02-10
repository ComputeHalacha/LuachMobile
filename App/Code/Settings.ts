import Location from './JCal/Location';
import { setDefault } from './GeneralUtils';
import DataUtils from './Data/DataUtils';
import Utils from './JCal/Utils';

interface Time {
  hour: number;
  minute: number;
}

export default class Settings {
  location: Location;

  showOhrZeruah: boolean;

  keepThirtyOne: boolean;

  onahBeinunis24Hours: boolean;

  numberMonthsAheadToWarn: number;

  keepLongerHaflagah: boolean;

  dilugChodeshPastEnds: boolean;

  haflagaOfOnahs: boolean;

  kavuahDiffOnahs: boolean;

  calcKavuahsOnNewEntry: boolean;

  showProbFlagOnHome: boolean;

  showEntryFlagOnHome: boolean;

  navigateBySecularDate: boolean;

  showIgnoredKavuahs: boolean;

  noProbsAfterEntry: boolean;

  hideHelp: boolean;

  remindBedkMornTime?: Time | null;

  remindBedkAftrnHour?: number;

  remindMikvahTime?: Time | null;

  remindDayOnahHour?: number;

  remindNightOnahHour?: number;

  discreet: boolean;

  autoBackup: boolean;

  constructor(args?: {
    location?: Location;
    showOhrZeruah?: boolean;
    keepThirtyOne?: boolean;
    onahBeinunis24Hours?: boolean;
    numberMonthsAheadToWarn?: number;
    keepLongerHaflagah?: boolean;
    dilugChodeshPastEnds?: boolean;
    haflagaOfOnahs?: boolean;
    kavuahDiffOnahs?: boolean;
    calcKavuahsOnNewEntry?: boolean;
    showProbFlagOnHome?: boolean;
    showEntryFlagOnHome?: boolean;
    navigateBySecularDate?: boolean;
    showIgnoredKavuahs?: boolean;
    noProbsAfterEntry?: boolean;
    hideHelp?: boolean;
    remindBedkMornTime?: string;
    remindBedkAftrnHour?: number;
    remindMikvahTime?: string;
    remindDayOnahHour?: number;
    remindNightOnahHour?: number;
    discreet?: boolean;
    autoBackup?: boolean;
  }) {
    this.location = args?.location || Location.getLakewood();
    this.showOhrZeruah = setDefault(args?.showOhrZeruah, true) as boolean;
    this.keepThirtyOne = setDefault(args?.keepThirtyOne, true) as boolean;
    this.onahBeinunis24Hours = setDefault(
      args?.onahBeinunis24Hours,
      true
    ) as boolean;
    this.numberMonthsAheadToWarn = setDefault(
      args?.numberMonthsAheadToWarn,
      12
    ) as number;
    /** This setting is for the Ta"z.
     *  Causes flagging of Onah Beinonis's days 30, 31 and Haflaga
     *  even if there was another Entry in middle
     *  Also causes to keep flagging any haflaga that was not surpassed afterwards. */
    this.keepLongerHaflagah = !!args?.keepLongerHaflagah;
    this.dilugChodeshPastEnds = setDefault(
      args?.dilugChodeshPastEnds,
      true
    ) as boolean;
    this.haflagaOfOnahs = !!args?.haflagaOfOnahs;
    this.kavuahDiffOnahs = !!args?.kavuahDiffOnahs;
    this.calcKavuahsOnNewEntry = setDefault(
      args?.calcKavuahsOnNewEntry,
      true
    ) as boolean;
    this.showProbFlagOnHome = setDefault(
      args?.showProbFlagOnHome,
      true
    ) as boolean;
    this.showEntryFlagOnHome = setDefault(
      args?.showEntryFlagOnHome,
      true
    ) as boolean;
    this.navigateBySecularDate = !!args?.navigateBySecularDate;
    this.showIgnoredKavuahs = !!args?.showIgnoredKavuahs;
    this.noProbsAfterEntry = setDefault(
      args?.noProbsAfterEntry,
      true
    ) as boolean;
    this.hideHelp = !!args?.hideHelp;
    // If a reminders field is null, we won't show the reminders
    this.remindBedkMornTime =
      args && args.remindBedkAftrnHour
        ? Utils.fromSimpleTimeString(args.remindBedkMornTime as string)
        : undefined;
    this.remindBedkAftrnHour = args?.remindBedkAftrnHour;
    this.remindMikvahTime =
      args && args.remindMikvahTime
        ? Utils.fromSimpleTimeString(args.remindMikvahTime)
        : null;
    this.remindDayOnahHour = args?.remindDayOnahHour;
    this.remindNightOnahHour = args?.remindNightOnahHour;
    this.discreet = setDefault(args?.discreet, true) as boolean;
    this.autoBackup = setDefault(args?.autoBackup, true) as boolean;
  }

  static async setCurrentLocation(location: Location) {
    await DataUtils.SetCurrentLocationOnDatabase(location);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).GlobalAppData.Settings.location = location;
  }

  isSameSettings(other: Settings) {
    if (!!this !== !!other) {
      return false;
    }
    return (
      (!this && !other) ||
      (this.location === other.location &&
        this.showOhrZeruah === other.showOhrZeruah &&
        this.keepThirtyOne === other.keepThirtyOne &&
        this.onahBeinunis24Hours === other.onahBeinunis24Hours &&
        this.numberMonthsAheadToWarn === other.numberMonthsAheadToWarn &&
        this.keepLongerHaflagah === other.keepLongerHaflagah &&
        this.dilugChodeshPastEnds === other.dilugChodeshPastEnds &&
        this.haflagaOfOnahs === other.haflagaOfOnahs &&
        this.kavuahDiffOnahs === other.kavuahDiffOnahs &&
        this.calcKavuahsOnNewEntry === other.calcKavuahsOnNewEntry &&
        this.showProbFlagOnHome === other.showProbFlagOnHome &&
        this.showEntryFlagOnHome === other.showEntryFlagOnHome &&
        this.navigateBySecularDate === other.navigateBySecularDate &&
        this.showIgnoredKavuahs === other.showIgnoredKavuahs &&
        this.noProbsAfterEntry === other.noProbsAfterEntry &&
        this.hideHelp === other.hideHelp &&
        this.discreet === other.discreet &&
        this.autoBackup === other.autoBackup &&
        Utils.isSameTime(
          this.remindBedkMornTime as Time | null,
          other.remindBedkMornTime as Time | null
        ) &&
        this.remindBedkAftrnHour === other.remindBedkAftrnHour &&
        Utils.isSameTime(
          this.remindMikvahTime as Time | null,
          other.remindMikvahTime as Time | null
        ) &&
        this.remindDayOnahHour === other.remindDayOnahHour &&
        this.remindNightOnahHour === other.remindNightOnahHour)
    );
  }
}
