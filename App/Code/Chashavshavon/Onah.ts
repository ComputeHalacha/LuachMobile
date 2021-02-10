import JDate from '../JCal/JDate';
import Utils from '../JCal/Utils';

enum NightDay {
  Night = -1,
  Day = 1
}
/**
 * Represents either the night-time or the day-time of a single Jewish Date.
 */
class Onah {
  jdate: JDate;

  nightDay: NightDay;

  constructor(jdate: JDate, nightDay: number) {
    if (!(jdate instanceof JDate)) {
      throw 'jdate must be supplied.';
    }
    if (![NightDay.Day, NightDay.Night].includes(nightDay)) {
      throw 'nightDay must be supplied.';
    }
    this.jdate = jdate;
    this.nightDay = nightDay;
  }

  /**
   * Determines if the supplied Onah has the same Jewish date and Night/Day as the current Onah.
   * @param {Onah} onah
   */
  isSameOnah(onah: Onah) {
    return (
      Utils.isSameJdate(this.jdate, onah.jdate) &&
      this.nightDay === onah.nightDay
    );
  }

  /**
   * Add the given number of Onahs to the current one
   * @param {Number} number - if it is negative will get an earlier onah
   */
  addOnahs(number: number) {
    if (!number) {
      return this;
    }

    // First add the full days. Each day is 2 onahs.
    const fullDays = Utils.toInt(number / 2);
    let onah = new Onah(this.jdate.addDays(fullDays), this.nightDay),
      currNumber = number;
    currNumber -= fullDays * 2;
    while (currNumber > 0) {
      onah = currNumber > 0 ? onah.next : onah.previous;
      currNumber--;
    }
    return onah;
  }

  /**
   * Returns the Onah directly before to this one.
   */
  get previous() {
    if (this.nightDay === NightDay.Day) {
      return new Onah(this.jdate, NightDay.Night);
    }
    return new Onah(this.jdate.addDays(-1), NightDay.Day);
  }

  /**
   * Returns the Onah directly after this one.
   */
  get next() {
    if (this.nightDay === NightDay.Day) {
      return new Onah(this.jdate.addDays(1), NightDay.Night);
    }
    return new Onah(this.jdate, NightDay.Day);
  }
}

export { NightDay, Onah };
