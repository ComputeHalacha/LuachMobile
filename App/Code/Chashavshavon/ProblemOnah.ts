import { NightDay, Onah } from './Onah';
import Utils from '../JCal/Utils';
import ProblemFlag from './ProblemFlag';
import JDate from '../JCal/JDate';

/**
 * Represents all the problems of a single Onah.
 * The flagList contains an Array of strings, each describing one problem.
 */
export default class ProblemOnah extends Onah {
  flagsList: ProblemFlag[];

  /**
   * @param {JDate} jdate
   * @param {NightDay} nightDay
   * @param {[String]} flagsList
   */
  constructor(
    jdate: JDate,
    nightDay: NightDay,
    flagsList?: Array<ProblemFlag>
  ) {
    if (!jdate) {
      throw 'jdate must be supplied.';
    }
    if (!nightDay) {
      throw 'nightDay must be supplied.';
    }
    super(jdate, nightDay);
    this.flagsList = flagsList || [];
  }

  /**
   * Returns a detailed text description for the entire Onah.
   * Each flag description is shown on its own line and prefixed with a "►".
   */
  toString() {
    const goyDate =
      this.nightDay === NightDay.Night
        ? this.jdate.addDays(-1).getDate()
        : this.jdate.getDate();
    return `The ${
      this.nightDay === NightDay.Night ? 'night' : 'day'
    } of ${this.jdate.toString()} (${goyDate.toLocaleDateString()}) is the:${this.flagsList
      .map(f => `\n  ►  ${f}`)
      .join('')}`;
  }

  /**
   * Determines if the given ProblemOnah is on the same Onah
   * and has all the flags that this one does.
   * @param {ProblemOnah} prob
   */
  isSameProb(prob: ProblemOnah) {
    return (
      this.isSameOnah(prob) &&
      this.flagsList.every(f => prob.flagsList.some(pf => pf === f))
    );
  }

  /**
   * Filter a list of problem onahs for the ones pertaining to the given date.
   * @param {JDate} jdate
   * @param {[ProblemOnah]} probOnahList
   */
  static getProbsForDate(jdate: JDate, probOnahList: Array<ProblemOnah>) {
    return (
      probOnahList &&
      probOnahList.length > 0 &&
      probOnahList.filter(po => Utils.isSameJdate(po.jdate, jdate))
    );
  }

  /**
   * Sort problems
   */
  static sortProbList(probOnahs: Array<ProblemOnah>) {
    // Sort problem onahs by chronological order, and return them
    return probOnahs.sort((a, b) => {
      if (a.jdate.Abs < b.jdate.Abs) {
        return -1;
      }
      if (a.jdate.Abs > b.jdate.Abs) {
        return 1;
      }
      return a.nightDay - b.nightDay;
    });
  }
}
