import { isNumber } from '../GeneralUtils';
import Entry from './Entry';
import FlaggedDatesGenerator from './FlaggedDatesGenerator';
import { Kavuah } from './Kavuah';
import Settings from '../Settings';
import JDate from '../JCal/JDate';
import { NightDay, Onah } from './Onah';

export default class EntryList extends Array<Entry> {
  constructor(entryList?: Array<Entry>) {
    if (entryList) {
      super(...entryList);
    } else {
      super(0);
    }
    Object.setPrototypeOf(this, Object.create(EntryList.prototype));
  }

  /**
   * Add an Entry to the list.
   * In most cases, calculate Haflagas should be called after changing the list.
   * @param {Entry} entry
   * @param {Function} [afterwards]
   */
  add(entry: Entry, afterwards?: CallableFunction): number {
    if (!(entry instanceof Entry)) {
      throw 'Only objects of type Entry can be added to the EntryList';
    } else if (!this.some(e => e.isSameEntry(entry))) {
      this.push(entry);
      const index = this.indexOf(entry);
      if (afterwards instanceof Function) {
        afterwards(entry, index);
      }
      return index;
    }
    return 0;
  }

  /**
   * Remove the given entry from the list
   * In most cases, calculateHaflagas should be called after changing the list.
   * @param {Number|Entry} arg Either the index of the Entry to remove or the actual Entry to remove.
   * Note: The supplied Entry does not have to refer to the same instance as the Entry in the list,
   * an entry where Entry.isSameEntry() returns true is removed.
   * @param {Function} [afterwards] The callback. Supplies the removed entry as an argument.
   */
  remove(arg: number | Entry, afterwards?: CallableFunction) {
    let wasRemoved = false;
    let entry = null;
    if (
      isNumber(arg) &&
      (arg as number) >= 0 &&
      (arg as number) < this.length
    ) {
      entry = this.splice(arg as number, 1);
      wasRemoved = true;
    } else if (arg instanceof Entry) {
      const index = this.findIndex(e => e === arg || e.isSameEntry(arg));
      if (index > -1) {
        entry = this.splice(index, 1);
        wasRemoved = true;
      }
    } else {
      throw 'EntryList.remove accepts either an Entry to remove or the index of the Entry to remove';
    }
    if (wasRemoved && afterwards instanceof Function) {
      afterwards(entry);
    }
  }

  /**
   * Returns whether or not the given Entry is in this list.
   * Note: The supplied Entry does not have to refer to the same actual instance as an Entry in the list;
   * an entry where isSameEntry returns true is also considered "found".
   * @param {*} Entry to test
   */
  contains(entry: Entry) {
    // eslint-disable-next-line no-bitwise
    return !!~this.findIndex(e => e === entry || e.isSameEntry(entry));
  }

  /**
   * Returns the list of entries sorted chronologically reversed - the most recent first.
   */
  get descending() {
    // Sort the list by date, clone it, reverse it and return it.
    // Cloning is because reverse is in-place.
    return [...EntryList.sortEntries(this)].reverse();
  }

  /**
   * Gets an array of the Entries in the list that are real periods...
   * I.E. not ignored for flagged dates
   */
  get realEntryList() {
    return EntryList.sortEntries(this.filter(e => !e.ignoreForFlaggedDates));
  }

  /**
   * Returns the latest Entry
   */
  lastEntry() {
    let latest: Entry | undefined;
    this.forEach(entry => {
      if (!latest || entry.date.Abs > latest.date.Abs) {
        latest = entry;
      }
    });
    return latest;
  }

  /**
   * Returns the latest Entry that isn't set to ignore for Flagged Dates
   */
  lastRegularEntry() {
    const { realEntryList } = this;
    return realEntryList[realEntryList.length - 1];
  }

  /**
   * Calculates the haflagas for all the entries in the list.
   */
  calculateHaflagas() {
    // Get only those entries that can generate flagged dates.
    // Non-real entries do not have a haflaga
    const { realEntryList } = this;

    // First Entry in the real entry list does not have a Haflaga
    for (let i = 1; i < realEntryList.length; i++) {
      realEntryList[i].setHaflaga(realEntryList[i - 1]);
    }
  }

  /**
   * Get all the problem onahs (flagged dates) that need to be observed.
   * It is generated from this EntryList and the given list of Kavuahs.
   * The list is generated according the the halachic settings in the supplied settings.
   * Returns an array of ProblemOnah.
   * @param {[Kavuah]} kavuahList
   * @param {Settings} settings
   */
  getProblemOnahs(kavuahList: Array<Kavuah>, settings: Settings) {
    const generator = new FlaggedDatesGenerator(
      this.realEntryList,
      kavuahList,
      settings
    );
    return generator.getProblemOnahs();
  }

  /**
   * Sorts the given list of Entries chronologically.
   * @param {Array<Entry>} list
   */
  static sortEntries(list: Array<Entry>) {
    return list.sort((a, b) => {
      if (a.date.Abs < b.date.Abs) {
        return -1;
      }
      if (a.date.Abs > b.date.Abs) {
        return 1;
      }
      return a.nightDay - b.nightDay;
    });
  }

  static getSampleEntryList(): Array<Entry> {
    const abs = new JDate().Abs;
    return [
      new Entry(
        new Onah(new JDate(abs - 90), NightDay.Night),
        1,
        false,
        false,
        ''
      ),
      new Entry(
        new Onah(new JDate(abs - 60), NightDay.Night),
        2,
        false,
        false,
        ''
      ),
      new Entry(
        new Onah(new JDate(abs - 30), NightDay.Night),
        3,
        false,
        false,
        ''
      )
    ];
  }
}
