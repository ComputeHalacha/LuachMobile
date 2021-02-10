import Utils from '../JCal/Utils';
import { Onah, NightDay } from './Onah';
import { setDefault } from '../GeneralUtils';
import Entry from './Entry';
import Settings from '../Settings';
import JDate from '../JCal/JDate';

enum KavuahTypes {
  Haflagah = 1,
  DayOfMonth = 2,
  DayOfWeek = 4,
  Sirug = 8,
  DilugHaflaga = 16,
  DilugDayOfMonth = 32,
  HaflagaMaayanPasuach = 64,
  DayOfMonthMaayanPasuach = 128,
  HaflagaOnahs = 256
}

class Kavuah {
  kavuahType: KavuahTypes;

  settingEntry: Entry;

  specialNumber: number;

  cancelsOnahBeinunis: boolean;

  active: boolean;

  ignore: boolean;

  kavuahId?: number;

  constructor(
    kavuahType: KavuahTypes,
    settingEntry: Entry | undefined,
    specialNumber: number,
    cancelsOnahBeinunis = true,
    active = true,
    ignore = false,
    kavuahId?: number
  ) {
    this.kavuahType = kavuahType;
    // The third entry  - the one that created the chazakah.
    this.settingEntry = settingEntry;
    /* Each type of Kavuah uses the specialNumber in its own way:
            Haflagah  - the number of days
            DayOfMonth - the day of the month
            DayOfWeek - the number of days between onahs
            Sirug - the number of months between onahs
            DilugHaflaga - number of days to increment (can be negative) number
            DilugDayOfMonth - number of days to increment (can be negative) number
            HaflagaMaayanPasuach and DayOfMonthMaayanPasuach the same as their regular counterparts.
            HaflagaOnahs - the number of Onahs between the Entries */
    this.specialNumber = specialNumber;
    // Does this Kavuah cancel the onah beinonis?
    this.cancelsOnahBeinunis = !!cancelsOnahBeinunis;
    this.active = setDefault(active, true);
    this.ignore = !!ignore;
    this.kavuahId = kavuahId;
  }

  /**
   * Returns true if this Kavuahs type is not dependent on its entries being 3 in a row
   */
  get isIndependent() {
    return [
      KavuahTypes.DayOfMonth,
      KavuahTypes.DayOfMonthMaayanPasuach,
      KavuahTypes.DayOfWeek,
      KavuahTypes.DilugDayOfMonth,
      KavuahTypes.Sirug
    ].includes(this.kavuahType);
  }

  toString(hideActive?: boolean) {
    let txt = '';
    if (!hideActive && !this.active) {
      txt = '[INACTIVE] ';
    }
    if (this.ignore) {
      txt = '[IGNORED] ';
    }
    txt +=
      this.settingEntry.nightDay === NightDay.Night
        ? 'Night-time '
        : 'Day-time ';
    switch (this.kavuahType) {
      case KavuahTypes.Haflagah:
        txt += `every ${this.specialNumber.toString()} days`;
        break;
      case KavuahTypes.DayOfMonth:
        txt += `on every ${Utils.toSuffixed(
          this.specialNumber
        )} day of the Jewish Month`;
        break;
      case KavuahTypes.DayOfWeek:
        txt +=
          `on the ${Utils.dowEng[this.settingEntry.date.getDayOfWeek()]} ` +
          `of every ${Utils.toSuffixed(
            Utils.toInt(this.specialNumber / 7)
          )} week`;
        break;
      case KavuahTypes.Sirug:
        txt +=
          `on the ${Utils.toSuffixed(this.settingEntry.day)} ` +
          `day of every ${Utils.toSuffixed(this.specialNumber)} month`;
        break;
      case KavuahTypes.HaflagaMaayanPasuach:
        txt +=
          `on every ${this.specialNumber.toString()} ` +
          "days (through Ma'ayan Pasuach)";
        break;
      case KavuahTypes.DayOfMonthMaayanPasuach:
        txt +=
          `on the ${Utils.toSuffixed(this.specialNumber)} day of ` +
          "the Jewish Month (through Ma'ayan Pasuach)";
        break;
      case KavuahTypes.DilugHaflaga:
        txt += `of "Dilug Haflaga" in the interval pattern of "${
          this.specialNumber < 0 ? 'subtract ' : 'add '
        }${Math.abs(this.specialNumber).toString()} days"`;
        break;
      case KavuahTypes.DilugDayOfMonth:
        txt += `of "Dilug Yom Hachodesh" in the interval pattern of "${
          this.specialNumber < 0 ? 'subtract ' : 'add '
        }${Math.abs(this.specialNumber).toString()} days"`;
        break;
      case KavuahTypes.HaflagaOnahs:
        txt += `every ${this.specialNumber.toString()} Onahs`;
        break;
      default:
        return null;
    }
    return `${txt}.`;
  }

  toLongString() {
    let txt = this.toString();
    txt += `\nSetting Entry: ${this.settingEntry.toLongString()}`;
    if (this.cancelsOnahBeinunis) {
      txt += '\nThis Kavuah cancels the "Onah Beinonis" Flagged Dates.';
    }
    return txt;
  }

  isMatchingKavuah(kavuah: Kavuah) {
    return (
      this.kavuahType === kavuah.kavuahType &&
      this.settingEntry.onah.isSameOnah(kavuah.settingEntry.onah) &&
      this.specialNumber === kavuah.specialNumber
    );
  }

  /**
   * Returns true if the given Entry matches the current Kavuah pattern.
   * @param {Entry} entry The Entry to test.
   * @param {Array<Entry>} entries The entire list of Entries. This is needed for some Kavuah types.
   * @param {Settings} settings
   */
  isEntryInPattern(entry: Entry, entries: Array<Entry>, settings: Settings) {
    if (entry.nightDay !== this.settingEntry.nightDay) {
      return false;
    }
    // Each Kavuah type has its own pattern
    switch (this.kavuahType) {
      case KavuahTypes.Haflagah:
        return entry.haflaga === this.specialNumber;
      case KavuahTypes.DayOfMonth:
        return entry.day === this.specialNumber;
      case KavuahTypes.Sirug: {
        const previous = entries[entries.indexOf(entry) - 1];
        return (
          previous &&
          entry.day === this.settingEntry.day &&
          previous.date.diffMonths(entry.date) === this.specialNumber
        );
      }
      case KavuahTypes.DilugHaflaga: {
        const previous = entries[entries.indexOf(entry) - 1];
        return (
          previous && entry.haflaga === previous.haflaga + this.specialNumber
        );
      }
      case KavuahTypes.DilugDayOfMonth:
      case KavuahTypes.DayOfWeek: {
        const iters = Kavuah.getIndependentIterations(
          this,
          entry.date,
          settings && settings.dilugChodeshPastEnds
        );
        return iters.some(o => entry.onah.isSameOnah(o));
      }
      default:
        return false;
    }
  }

  get hasId() {
    return !!this.kavuahId;
  }

  /**
   * Tries to determine if the specialNumber correctly matches the information in the settingEntry
   */
  get specialNumberMatchesEntry() {
    if (!this.specialNumber) {
      return false;
    }
    switch (this.kavuahType) {
      case KavuahTypes.Haflagah:
      case KavuahTypes.HaflagaMaayanPasuach:
        return (
          this.specialNumber > 0 &&
          (this.specialNumber === this.settingEntry.haflaga ||
            !this.settingEntry.haflaga)
        );
      case KavuahTypes.DayOfMonth:
      case KavuahTypes.DayOfMonthMaayanPasuach:
        return (
          this.specialNumber > 0 &&
          this.specialNumber <= 30 &&
          this.specialNumber === this.settingEntry.day
        );
      case KavuahTypes.HaflagaOnahs:
        return this.specialNumber > 0;
      default:
        return true;
    }
  }

  /**
   * Returns a list of Onahs that theoretically should have Entries on them
   * according to the pattern of the given Kavuah.
   * Only applicable to "Independent" type Kavuahs.
   * @param {Kavuah} kavuah The kavuah to get the list for
   * @param {JDate} jdate The date until when to work out the theoretical iterations.
   * @param {boolean} dilugChodeshPastEnds
   * @returns {Array<Onah>}
   */
  static getIndependentIterations(
    kavuah: Kavuah,
    jdate: JDate,
    dilugChodeshPastEnds: boolean
  ): Array<Onah> {
    let iterations: Array<Onah> = [];
    if (kavuah.isIndependent) {
      if (kavuah.kavuahType === KavuahTypes.DayOfWeek) {
        iterations = Kavuah.getDayOfWeekIterations(kavuah, jdate);
      } else if (kavuah.kavuahType === KavuahTypes.DilugDayOfMonth) {
        iterations = Kavuah.getDilugDayOfMonthIterations(
          kavuah,
          jdate,
          dilugChodeshPastEnds
        );
      } else {
        let nextIteration = kavuah.settingEntry.date;
        while (nextIteration.Abs < jdate.Abs) {
          nextIteration = nextIteration.addMonths(
            // Go to the next month. Sirug Kavuahs add more than one month
            kavuah.kavuahType === KavuahTypes.Sirug ? kavuah.specialNumber : 1
          );
          iterations.push(
            new Onah(nextIteration, kavuah.settingEntry.nightDay)
          );
        }
      }
    }
    return iterations;
  }

  /**
   * Returns a list of Onahs that theoretically should have Entries on them
   * according to the pattern of this DayOfWeek Kavuah.
   * @param {Kavuah} kavuah The kavuah to get the list for
   * @param {JDate} jdate The date until when to work out the theoretical iterations.
   * @returns {Array<Onah>}
   */
  static getDayOfWeekIterations(kavuah: Kavuah, jdate: JDate): Array<Onah> {
    const iterations: Array<Onah> = [];
    if (kavuah.kavuahType === KavuahTypes.DayOfWeek) {
      let nextIteration = kavuah.settingEntry.date;
      while (nextIteration.Abs < jdate.Abs) {
        nextIteration = nextIteration.addDays(kavuah.specialNumber);
        iterations.push(new Onah(nextIteration, kavuah.settingEntry.nightDay));
      }
    }
    return iterations;
  }

  /**
   * Returns a list of Onahs that theoretically should have Entries on them
   * according to the pattern of the given DilugDayOfMonth Kavuah.
   * @param {Kavuah} kavuah The kavuah to get the list for
   * @param {JDate} jdate The date until when to work out the theoretical iterations.
   * @param {boolean} dilugChodeshPastEnds Continue incrementing into another month?
   * @returns {Array<Onah>}
   */
  static getDilugDayOfMonthIterations(
    kavuah: Kavuah,
    jdate: JDate,
    dilugChodeshPastEnds: boolean
  ): Array<Onah> {
    const iterations: Array<Onah> = [];

    if (kavuah.kavuahType === KavuahTypes.DilugDayOfMonth) {
      let nextMonth = kavuah.settingEntry.date;
      for (let i = 1; ; i++) {
        nextMonth = nextMonth.addMonths(1);
        const nextIteration = nextMonth.addDays(kavuah.specialNumber * i);
        if (
          nextIteration.Abs > jdate.Abs ||
          nextIteration.Abs <= kavuah.settingEntry.date.Abs
        ) {
          break;
        }
        // dilugChodeshPastEnds means continue incrementing Dilug Yom Hachodesh Kavuahs into another month.
        if (
          !dilugChodeshPastEnds &&
          // If the current iterations Day is more than the setting entries Day
          // and the Dilug is a positive number, than we have slided into another month.
          // And vice versa.
          Math.sign(kavuah.settingEntry.day - nextIteration.Day) ===
            Math.sign(kavuah.specialNumber)
        ) {
          break;
        }
        iterations.push(new Onah(nextIteration, kavuah.settingEntry.nightDay));
      }
    }
    return iterations;
  }

  /**
   * Get possible new Kavuahs from a list of entries.
   * @param {Array<Entry>} realEntryList List of entries to search. All should be not ignoreForFlaggedDates.
   * @param {Array<Kavuah>} kavuahList The list of Kavuahs to used to determine if any found kavuah is a "new" one.
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getPossibleNewKavuahs(
    realEntryList: Array<Entry>,
    kavuahList: Array<Kavuah>,
    settings: Settings
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    // Get all Kavuahs in the list that are active - including ignored ones.
    const list: Array<Kavuah> = kavuahList.filter(k => k.active);
    // Find all possible Kavuahs.
    return (
      Kavuah.getKavuahSuggestionList(realEntryList, kavuahList, settings)
        // Filter out any Kavuahs that are already in the active list.
        // Ignored Kavuahs will also not be returned.
        .filter(pk => !list.find(k => k.isMatchingKavuah(pk.kavuah)))
    );
  }

  /**
   * Works out all possible Kavuahs from the given list of entries
   * Returns an array of objects, each containing:
   * {
   *      kavuah: the found Kavuah object
   *      entries: an array of the 3 or 4 Entry objects that were found to have a possible Kavuah relationship.
   * }
   * @param {Array<Entry>} realEntryList
   * @param {Array<Kavuah>} previousKavuahs
   * @param {Settings} settings
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getKavuahSuggestionList(
    realEntryList: Array<Entry>,
    previousKavuahs: Array<Kavuah>,
    settings: Settings
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    let kavuahList: Array<{ kavuah: Kavuah; entries: Array<Entry> }> = [];
    const queue: Array<Entry> = [];
    const nonIgnored = realEntryList.filter(e => !e.ignoreForKavuah);
    nonIgnored.forEach(entry => {
      // First we work out those Kavuahs that are not dependent on their entries being 3 in a row
      kavuahList = kavuahList
        .concat(Kavuah.getDayOfMonthKavuah(entry, realEntryList, settings))
        .concat(Kavuah.getDayOfWeekKavuahs(entry, realEntryList, settings));

      // If there are no previous active Kavuahs of type DayOfMonth for the date of this entry,
      // we can look for a Dilug Day of Month Kavuah of just three entries. [Sha"ch yr"d 189, 7]
      if (
        !previousKavuahs ||
        !previousKavuahs.some(
          k =>
            k.active &&
            k.kavuahType === KavuahTypes.DayOfMonth &&
            k.specialNumber === entry.date.Day
        )
      ) {
        kavuahList = kavuahList.concat(
          Kavuah.getDilugDayOfMonthKavuah(entry, realEntryList, settings)
        );
      }

      /* For calculating all other Kavuahs, we use a queue of 3 or 4 entries in a row. */

      // Add the entry of the current iteration to the end of the queue.
      queue.push(entry);
      // if the queue is too "full"
      if (queue.length > 4) {
        // pop out the earliest one - leaves us with just this entry and the previous 3.
        queue.shift();
      }

      // To calculate a Sirug Kavuah, we need just 3 entries
      if (
        queue.length >= 3 &&
        (settings.kavuahDiffOnahs ||
          (queue[0].nightDay === queue[1].nightDay &&
            queue[1].nightDay === queue[2].nightDay))
      ) {
        // We only need three entries for a sirug kavuah.
        // We always send the last 3 entries as the last one is always the newly added one.
        kavuahList = kavuahList.concat(Kavuah.getSirugKavuah(queue.slice(-3)));
      }
      // We can't start calculating haflaga kavuahs until we have 4 entries
      if (queue.length === 4) {
        // Haflaga Kavuahs need the latter 3 entries to have the same nightDay () -
        // unless kavuahDiffOnahs is on.
        // The first entry of the 4, does not have to be
        // the same NightDay as the other three. [Nodah Biyehuda (2, 83), See Chazon Ish (85, 59-)]
        if (
          (queue[1].nightDay === queue[2].nightDay &&
            queue[2].nightDay === queue[3].nightDay) ||
          settings.kavuahDiffOnahs
        ) {
          kavuahList = kavuahList
            .concat(Kavuah.getHaflagahKavuah(queue))
            .concat(Kavuah.getDilugHaflagahKavuah(queue));
        }

        // The Kavuah of Haflaga of Onahs - the Shulchan Aruch Harav
        // If the NightDays of the latter 3 are the same, there will always already be a Haflaga Kavuah.
        if (
          settings.haflagaOfOnahs &&
          queue[1].nightDay !== queue[2].nightDay
        ) {
          kavuahList = kavuahList.concat(Kavuah.getHaflagaOnahsKavuah(queue));
        }
      }
    });

    return kavuahList;
  }

  /**
   * See if there the pattern of a DayOfMonth Kavuah in the given list of Entries.
   * @param {Entry} entry The Entry to start from
   * @param {Array<Entry>} entryList The full list of Entries to search through
   * @param {Settings} settings
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getDayOfMonthKavuah(
    entry: Entry,
    entryList: Array<Entry>,
    settings: Settings
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    const list: Array<{ kavuah: Kavuah; entries: Array<Entry> }> = [];
    const nextMonth: JDate = entry.date.addMonths(1);
    const thirdMonth: JDate = nextMonth.addMonths(1);
    // We look for an entry that is exactly one Jewish month later
    // Note, it is irrelevant if there were other entries in the interim
    const secondFind: Entry | undefined = entryList.find(
      en =>
        (settings.kavuahDiffOnahs ||
          en.onah.nightDay === entry.onah.nightDay) &&
        Utils.isSameJdate(en.date, nextMonth)
    );
    if (secondFind) {
      // Now we look for another entry that is exactly two Jewish months later
      const thirdFind = entryList.find(
        en =>
          (settings.kavuahDiffOnahs ||
            en.onah.nightDay === entry.onah.nightDay) &&
          Utils.isSameJdate(en.date, thirdMonth)
      );
      if (thirdFind) {
        list.push({
          kavuah: new Kavuah(KavuahTypes.DayOfMonth, thirdFind, thirdMonth.Day),
          entries: [entry, secondFind, thirdFind]
        });
      }
    }
    return list;
  }

  /**
   * See if there the pattern of a DilugDayOfMonth Kavuah in the given list of Entries.
   * @param {Entry} entry The Entry to start from
   * @param {Array<Entry>} entryList The full list of Entries to search through
   * @param {Settings} settings
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getDilugDayOfMonthKavuah(
    entry: Entry,
    entryList: Array<Entry>,
    settings: Settings
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    const list = [];
    // First, we look for any entry that is in the next Jewish month after the given entry -
    // but not on the same day as that would be a regular DayOfMonth Kavuah with no Dilug.
    // Note, it is irrelevant if there were other entries in the interim
    const nextMonth = entry.date.addMonths(1);
    const secondFind = entryList.find(
      en =>
        (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
        nextMonth.Day !== en.day &&
        nextMonth.Month === en.month &&
        nextMonth.Year === en.year
    );
    if (secondFind) {
      // Now we look for another entry that is in the 3rd month and has the same "Dilug" as the previous find
      const thirdMonth = entry.date.addMonths(2);
      const dilugDays = secondFind.day - entry.day;
      const finalFind = entryList.find(
        en =>
          (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
          en.day - secondFind.day === dilugDays &&
          thirdMonth.Month === en.month &&
          thirdMonth.Year === en.year
      );
      if (finalFind) {
        list.push({
          kavuah: new Kavuah(KavuahTypes.DilugDayOfMonth, finalFind, dilugDays),
          entries: [entry, secondFind, finalFind]
        });
      }
    }
    return list;
  }

  /**
   * See if there the pattern of a DayOfWeek Kavuah in the given list of Entries.
   * @param {Entry} entry The Entry to start from
   * @param {Array<Entry>} entryList The full list of Entries to search through
   * @param {Settings} settings
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getDayOfWeekKavuahs(
    entry: Entry,
    entryList: Array<Entry>,
    settings: Settings
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    const list: Array<{ kavuah: Kavuah; entries: Array<Entry> }> = [];
    // We go through the proceeding entries in the list looking for those that are on the same day of the week as the given entry
    // Note, similar to Yom Hachodesh based kavuahs, it is irrelevant if there were other entries in the interim (משמרת הטהרה)
    entryList
      .filter(
        e =>
          (settings.kavuahDiffOnahs || e.nightDay === entry.nightDay) &&
          e.date.Abs > entry.date.Abs &&
          e.dayOfWeek === entry.dayOfWeek
      )
      .forEach(firstFind => {
        // We get the interval in days between the found entry and the given entry
        const interval = entry.date.diffDays(firstFind.date);
        const nextDate = firstFind.date.addDays(interval);

        // If the next date has the same day of the week, we will check if there is an Entry on that day.
        if (entry.dayOfWeek === nextDate.DayOfWeek) {
          // We now look for a second entry that is also on the same day of the week
          // and that has the same interval from the previously found entry
          const secondFind = entryList.find(
            en =>
              (settings.kavuahDiffOnahs || en.nightDay === entry.nightDay) &&
              Utils.isSameJdate(en.date, nextDate)
          );
          if (secondFind) {
            list.push({
              kavuah: new Kavuah(KavuahTypes.DayOfWeek, secondFind, interval),
              entries: [entry, firstFind, secondFind]
            });
          }
        }
      });
    return list;
  }

  /**
   * See if there the pattern of a Haflagah Kavuah in the given list of Entries.
   * @param {Array<Entry>} fourEntries The Entry list
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getHaflagahKavuah(
    fourEntries: Array<Entry>
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    const list = [];
    // We simply compare the intervals between the entries. If they are the same, we have a Kavuah
    if (
      fourEntries[1].haflaga === fourEntries[2].haflaga &&
      fourEntries[2].haflaga === fourEntries[3].haflaga
    ) {
      list.push({
        kavuah: new Kavuah(
          KavuahTypes.Haflagah,
          fourEntries[3],
          fourEntries[3].haflaga
        ),
        entries: [...fourEntries]
      });
    }
    return list;
  }

  /**
   * See if there the pattern of a HaflagahOnahs Kavuah in the given list of Entries.
   * @param {Array<Entry>} fourEntries The Entry list
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getHaflagaOnahsKavuah(
    fourEntries: Array<Entry>
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    const list = [];
    const onahs = fourEntries[0].getOnahDifferential(fourEntries[1]);

    // We compare the intervals of onahs between the entries.
    // If they are the same, we have a Kavuah
    if (
      fourEntries[1].getOnahDifferential(fourEntries[2]) === onahs &&
      fourEntries[2].getOnahDifferential(fourEntries[3]) === onahs
    ) {
      list.push({
        kavuah: new Kavuah(KavuahTypes.HaflagaOnahs, fourEntries[3], onahs),
        entries: [...fourEntries]
      });
    }
    return list;
  }

  /**
   * See if there the pattern of a Sirug Kavuah in the given list of Entries.
   * @param {Array<Entry>} threeEntries The Entry list
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getSirugKavuah(
    threeEntries: Array<Entry>
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    // Caculate Kavuah of Sirug
    // We go here according to those that Sirug Kavuahs need 3 in a row with no intervening entries
    const list = [];
    // We get the difference in months between the first 2 entries
    const monthDiff = threeEntries[0].date.diffMonths(threeEntries[1].date);
    // If the difference is 1, than it can not be a Sirug Kavuah - rather it may be a DayOfMonth kavuah.
    // We now check to see if the third Entry is the same number of months
    // after the second one, and that all 3 entries are on the same day of the month.
    if (
      monthDiff > 1 &&
      threeEntries[0].day === threeEntries[1].day &&
      threeEntries[1].day === threeEntries[2].day &&
      threeEntries[1].date.diffMonths(threeEntries[2].date) === monthDiff
    ) {
      // Add the kavuah
      list.push({
        kavuah: new Kavuah(KavuahTypes.Sirug, threeEntries[2], monthDiff),
        entries: [...threeEntries]
      });
    }
    return list;
  }

  /**
   * See if there the pattern of a DilugHaflagah Kavuah in the given list of Entries.
   * @param {Array<Entry>} fourEntries The Entry list
   * @returns {[{kavuah:Kavuah,entries:Array<Entry>}]}
   */
  static getDilugHaflagahKavuah(
    fourEntries: Array<Entry>
  ): Array<{ kavuah: Kavuah; entries: Array<Entry> }> {
    // Calculate Dilug Haflaga Kavuahs
    const list: Array<{ kavuah: Kavuah; entries: Array<Entry> }> = [];
    // We check the entries if their interval "Dilug"s are the same.
    const haflagaDiff1 = fourEntries[3].haflaga - fourEntries[2].haflaga;
    const haflagaDiff2 = fourEntries[2].haflaga - fourEntries[1].haflaga;

    // If the "Dilug" is 0 it may be a regular Kavuah of Haflagah but not a Dilug one
    if (haflagaDiff1 !== 0 && haflagaDiff1 === haflagaDiff2) {
      list.push({
        kavuah: new Kavuah(
          KavuahTypes.DilugHaflaga,
          fourEntries[3],
          haflagaDiff1
        ),
        entries: [...fourEntries]
      });
    }
    return list;
  }

  /**
   * Searches for any active Kavuahs in the given list that the given entry breaks its pattern
   * by being the 3rd one that is out-of-pattern.
   * @param {Entry} entry The entry that nessesitated this calculation
   * @param {Array<Kavuah>} kavuahList
   * @param {Array<Entry>} entries An array of Entries that is sorted chronologically.
   * @param {Settings} settings
   * @returns {Array<Kavuah>}
   */
  static findBrokenKavuahs(
    entry: Entry,
    kavuahList: Array<Kavuah>,
    entries: Array<Entry>,
    settings: Settings
  ): Array<Kavuah> {
    return [
      ...Kavuah.findIndependentBrokens(
        entry.date,
        kavuahList,
        entries,
        settings
      ),
      ...Kavuah.findNonIndependentBrokens(entry, kavuahList, entries, settings)
    ];
  }

  /**
   * Find broken Kavuahs whose type is "Independent"
   * meaning that they do not care if there were other Entries in middle.
   * @param {JDate} jdate
   * @param {Array<Kavuah>} kavuahList
   * @param {Array<Entry>} entries
   * @param {Settings} settings
   * @returns {Array<Kavuah>}
   */
  static findIndependentBrokens(
    jdate: JDate,
    kavuahList: Array<Kavuah>,
    entries: Array<Entry>,
    settings: Settings
  ): Array<Kavuah> {
    const brokenKavuahs: Array<Kavuah> = [];

    // Check the last three theoretical iterations of all the "Independent" type Kavuahs
    kavuahList
      .filter(
        k =>
          k.active &&
          !k.ignore &&
          k.isIndependent &&
          k.settingEntry.date.Abs < jdate.Abs
      )
      .forEach(kavuah => {
        // Get the last three "iterations" of the Kavuah - up to the given date
        const last3Iters = Kavuah.getIndependentIterations(
          kavuah,
          jdate,
          settings.dilugChodeshPastEnds
        ).slice(-3);
        if (
          last3Iters.length === 3 &&
          !last3Iters.some(o => entries.some(e => e.onah.isSameOnah(o)))
        ) {
          brokenKavuahs.push(kavuah);
        }
      });
    return brokenKavuahs;
  }

  /**
   * Find Kavuahs that have had their pattern "broken" by the given Entry.
   * Only active non-independent kavuahs that were set before the last 3 Entries are considered.
   * @param {Entry} entry
   * @param {Array<Kavuah>} kavuahList
   * @param {Array<Entry>} entries
   * @returns {Array<Kavuah>}
   */
  static findNonIndependentBrokens(
    entry: Entry,
    kavuahList: Array<Kavuah>,
    entries: Array<Entry>,
    settings: Settings
  ): Array<Kavuah> {
    const brokenKavuahs: Array<Kavuah> = [];
    const index = entries.indexOf(entry);
    // If there aren't at least 2 previous Entries,
    // no Kavuah could have been broken by this Entry.
    if (index > 1) {
      const lastThree = entries.slice(index - 2, index + 1);
      kavuahList
        .filter(
          k =>
            k.active &&
            !k.ignore &&
            !k.isIndependent &&
            lastThree.every(e => e.date.Abs > k.settingEntry.date.Abs)
        )
        .forEach(kavuah => {
          if (
            !lastThree.some(e => kavuah.isEntryInPattern(e, entries, settings))
          ) {
            brokenKavuahs.push(kavuah);
          }
        });
    }
    return brokenKavuahs;
  }

  /**
   * Searches for Kavuahs in the given list that the given entry is out of pattern with.
   * The only kavuahs considered are active ones that cancel onah beinonis
   * and that were set before this Entry occurred.
   * @param {Entry} entry
   * @param {Array<Kavuah>} kavuahList
   * @param {Array<Entry>} entries An array of Entries that is sorted chronologically.
   * Used to get the previous Entry.
   * * @param {Settings} settings
   * @returns {Array<Kavuah>}
   */
  static findOutOfPattern(
    entry: Entry,
    kavuahList: Array<Kavuah>,
    entries: Array<Entry>,
    settings: Settings
  ): Array<Kavuah> {
    const list: Array<Kavuah> = [];
    kavuahList
      .filter(
        k =>
          k.cancelsOnahBeinunis &&
          k.active &&
          !k.ignore &&
          // "Independent" Kavuahs are not considered "out of pattern" if there is an Entry in middle
          !k.isIndependent &&
          k.settingEntry.date.Abs < entry.date.Abs
      )
      .forEach(kavuah => {
        if (!kavuah.isEntryInPattern(entry, entries, settings)) {
          list.push(kavuah);
        }
      });
    return list;
  }

  /**
   * Searches for inactive Kavuahs in the given list that the given entry is "in pattern" with.
   * The only kavuahs considered are those that were set before this Entry occurred.
   * @param {Entry} entry
   * @param {Array<Kavuah>} kavuahList
   * @param {Array<Entry>} entries An array of Entries that is sorted chronologically.  Used to get the previous Entry.
   * @param {Settings} settings
   * @returns {Array<Kavuah>}
   */
  static findReawakenedKavuahs(
    entry: Entry,
    kavuahList: Array<Kavuah>,
    entries: Array<Entry>,
    settings: Settings
  ): Array<Kavuah> {
    const awakened: Array<Kavuah> = [];
    kavuahList
      .filter(
        k => !k.active && !k.ignore && k.settingEntry.date.Abs < entry.date.Abs
      )
      .forEach(kavuah => {
        if (kavuah.isEntryInPattern(entry, entries, settings)) {
          awakened.push(kavuah);
        }
      });
    return awakened;
  }

  /**
   * Gets the default special number for the given Kavuah description
   * @param {Entry} settingEntry
   * @param {KavuahTypes} kavuahType
   * @param {Array<Entry>} entryList
   * @returns {number}
   */
  static getDefaultSpecialNumber(
    settingEntry: Entry,
    kavuahType: KavuahTypes,
    entryList: Array<Entry>
  ): number {
    if (
      settingEntry.haflaga &&
      [KavuahTypes.Haflagah, KavuahTypes.HaflagaMaayanPasuach].includes(
        kavuahType
      )
    ) {
      return settingEntry.haflaga;
    }
    if (
      [KavuahTypes.DayOfMonth, KavuahTypes.DayOfMonthMaayanPasuach].includes(
        kavuahType
      )
    ) {
      return settingEntry.day;
    }
    if (kavuahType === KavuahTypes.HaflagaOnahs) {
      const index = entryList.findIndex(e => e.isSameEntry(settingEntry));
      // The entries are sorted latest to earlier
      const previous = entryList[index + 1];
      if (previous) {
        return previous.getOnahDifferential(settingEntry);
      }
    }
    return 0;
  }

  /**
   * Returns the definition text of the what the special number represents
   * for the given Kavuah Type.
   * @param {KavuahTypes} kavuahType
   * @returns {string}
   */
  static getNumberDefinition(kavuahType: KavuahTypes): string {
    switch (kavuahType) {
      case KavuahTypes.DayOfMonth:
      case KavuahTypes.DayOfMonthMaayanPasuach:
        return 'Day of each Jewish Month';
      case KavuahTypes.DayOfWeek:
        return 'Number of days between entries (Haflaga)';
      case KavuahTypes.Haflagah:
      case KavuahTypes.HaflagaMaayanPasuach:
        return 'Number of days between entries (Haflaga)';
      case KavuahTypes.DilugDayOfMonth:
        return 'Number of days to add/subtract each month';
      case KavuahTypes.DilugHaflaga:
        return 'Number of days to add/subtract to Haflaga each Entry';
      case KavuahTypes.HaflagaOnahs:
        return 'Number of Onahs between entries (Haflaga of Shulchan Aruch Harav)';
      case KavuahTypes.Sirug:
        return 'Number of months separating the Entries';
      default:
        return 'Kavuah Defining Number';
    }
  }

  /**
   * Get the display text for the given Kavuah Type
   * @param {KavuahTypes} kavuahType
   * @returns {string}
   */
  static getKavuahTypeText(kavuahType: KavuahTypes): string | null {
    switch (kavuahType) {
      case KavuahTypes.DayOfMonth:
        return 'Day of Month';
      case KavuahTypes.DayOfMonthMaayanPasuach:
        return "Day Of Month with Ma'ayan Pasuach";
      case KavuahTypes.DayOfWeek:
        return 'Day of week';
      case KavuahTypes.DilugDayOfMonth:
        return '"Dilug" of Day Of Month';
      case KavuahTypes.DilugHaflaga:
        return '"Dilug" of Haflaga';
      case KavuahTypes.HaflagaOnahs:
        return 'Haflaga of Onahs';
      case KavuahTypes.Haflagah:
        return 'Haflaga';
      case KavuahTypes.HaflagaMaayanPasuach:
        return "Haflaga with Ma'ayan Pasuach";
      case KavuahTypes.Sirug:
        return 'Sirug';
      default:
        return null;
    }
  }
}

export { KavuahTypes, Kavuah };
