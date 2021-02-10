import JDate from './JDate';
import Utils from './Utils';

enum UserOccasionTypes {
  OneTime = 1,
  HebrewDateRecurringYearly = 2,
  HebrewDateRecurringMonthly = 4,
  SecularDateRecurringYearly = 8,
  SecularDateRecurringMonthly = 16
}

/**
 * An Occasion or Event.
 *
 * Note, the terms "Occasion" and "Event" are used interchangeably in code, comments and documentation.
 */
class UserOccasion {
  title: string;

  occasionType: UserOccasionTypes;

  dateAbs: number;

  color: string;

  comments: string;

  occasionId: number;

  static defaultColor = '#b96';

  private privateJdate: JDate | null = null;

  private privateSdate: Date | null = null;

  constructor(
    title: string,
    occasionType: UserOccasionTypes,
    dateAbs: number,
    color: string,
    comments: string,
    occasionId: number
  ) {
    this.title = title;
    this.occasionType = occasionType;
    // This should only be changed by setting the jdate or sdate properties
    this.dateAbs = dateAbs;
    this.color = color || UserOccasion.defaultColor;
    this.comments = comments;
    this.occasionId = occasionId;
  }

  /**
   * Returns a short description of the current Occasion/Event
   * @param {Boolean} noOriginalDate Set to true to refrain from showing the setting date.
   */
  toString(noOriginalDate: boolean) {
    switch (this.occasionType) {
      case UserOccasionTypes.OneTime:
        return `One time event on ${this.jdate.toString()} - ${Utils.toStringDate(
          this.sdate,
          true,
          true
        )}`;
      case UserOccasionTypes.HebrewDateRecurringYearly:
        return `${this.jdate.toString()}  (${
          noOriginalDate ? '' : `${this.sdate.toLocaleDateString()}).\n`
        }Yearly event on the ${Utils.toSuffixed(this.jdate.Day)} day of ${
          Utils.jMonthsEng[this.jdate.Month]
        }`;
      case UserOccasionTypes.HebrewDateRecurringMonthly:
        return `${this.jdate.toString()}  (${
          noOriginalDate ? '' : `${this.sdate.toLocaleDateString()}).\n`
        }Monthly event on the ${Utils.toSuffixed(
          this.jdate.Day
        )} day of each Jewish month`;
      case UserOccasionTypes.SecularDateRecurringYearly:
        return `${
          noOriginalDate
            ? ''
            : `${Utils.toStringDate(
                this.sdate,
                false
              )}  (${this.jdate.toShortString(false)}).\n`
        }Yearly event on the ${Utils.toSuffixed(this.sdate.getDate())} day of ${
          Utils.sMonthsEng[this.sdate.getMonth()]
        }`;
      case UserOccasionTypes.SecularDateRecurringMonthly:
        return `${
          noOriginalDate
            ? ''
            : `${Utils.toStringDate(
                this.sdate,
                false
              )}  (${this.jdate.toShortString(false)}).\n`
        }Monthly event on the ${Utils.toSuffixed(
          this.sdate.getDate()
        )} day of each Secular month`;
      default:
        return null;
    }
  }

  /**
   * If the given date matches any iteration of an annual Occasion,
   * returns the year number for that iteration in the format: "5th year"
   * @param {JDate | Date} date Can be either a JDate or a Javascript Date
   */
  getYearString(date: JDate | Date) {
    if (!date) {
      return '';
    }
    if (this.occasionType === UserOccasionTypes.HebrewDateRecurringYearly) {
      const jdate = date instanceof JDate ? date : new JDate(date);
      if (
        jdate.Year > this.jdate.Year &&
        jdate.Month === this.jdate.Month &&
        jdate.Day === this.jdate.Day
      ) {
        return `${Utils.toSuffixed(jdate.Year - this.jdate.Year)} year`;
      }
    } else if (
      this.occasionType === UserOccasionTypes.SecularDateRecurringYearly
    ) {
      const sdate = date instanceof Date ? date : date.getDate();
      if (
        sdate.getFullYear() > this.sdate.getFullYear() &&
        sdate.getMonth() === this.sdate.getMonth() &&
        sdate.getDate() === this.sdate.getDate()
      ) {
        return `${Utils.toSuffixed(
          sdate.getFullYear() - this.sdate.getFullYear()
        )} year`;
      }
    }
    return '';
  }

  /**
   * Returns the year of the latest anniversary for this occasion.
   * Only returns a value for annual events.
   */
  getCurrentYear() {
    const jdate = this.getPreviousInstance();
    if (
      jdate &&
      this.occasionType === UserOccasionTypes.HebrewDateRecurringYearly
    ) {
      return jdate.Year - this.jdate.Year;
    }
    if (
      jdate &&
      this.occasionType === UserOccasionTypes.SecularDateRecurringYearly
    ) {
      const sdate = jdate.getDate();
      return sdate.getFullYear() - this.sdate.getFullYear();
    }
    return null;
  }

  /**
   * Gets the jdate of the next instance of a recurring event.
   */
  getNextInstance() {
    const nowSd = new Date();
    const nowJd = new JDate(nowSd);
    let jd;
    let sd;
    switch (this.occasionType) {
      case UserOccasionTypes.HebrewDateRecurringYearly:
        jd = new JDate(nowJd.Year, this.jdate.Month, this.jdate.Day);
        while (jd.getDate() < nowSd) {
          jd = jd.addYears(1);
        }
        return jd;
      case UserOccasionTypes.HebrewDateRecurringMonthly:
        jd = new JDate(nowJd.Year, nowJd.Month, this.jdate.Day);
        while (jd.getDate() < nowSd) {
          jd = jd.addMonths(1);
        }
        return jd;
      case UserOccasionTypes.SecularDateRecurringYearly:
        sd = new Date(
          nowSd.getFullYear(),
          this.sdate.getMonth(),
          this.sdate.getDate() + 1
        );
        while (sd < nowSd) {
          sd.setFullYear(sd.getFullYear() + 1);
        }
        return new JDate(sd);
      case UserOccasionTypes.SecularDateRecurringMonthly:
        sd = new Date(
          nowSd.getFullYear(),
          nowSd.getMonth(),
          this.sdate.getDate() + 1
        );
        while (sd < nowSd) {
          sd.setMonth(sd.getMonth() + 1);
        }
        return new JDate(sd);
      default:
        return null;
    }
  }

  /**
   * Gets the jdate of the last instance of a recurring event.
   */
  getPreviousInstance() {
    const nowSd = new Date();
    const nowJd = new JDate(nowSd);
    let jd: JDate | null = null;
    let sd: Date;
    switch (this.occasionType) {
      case UserOccasionTypes.HebrewDateRecurringYearly:
        jd = new JDate(nowJd.Year, this.jdate.Month, this.jdate.Day);
        while (jd.getDate() > nowSd) {
          jd = jd.addYears(-1);
        }
        break;
      case UserOccasionTypes.HebrewDateRecurringMonthly:
        jd = new JDate(nowJd.Year, nowJd.Month, this.jdate.Day);
        while (jd.getDate() > nowSd) {
          jd = jd.addMonths(-1);
        }
        break;
      case UserOccasionTypes.SecularDateRecurringYearly:
        sd = new Date(
          nowSd.getFullYear(),
          this.sdate.getMonth(),
          this.sdate.getDate() + 1
        );
        while (sd > nowSd) {
          sd.setFullYear(sd.getFullYear() - 1);
        }
        jd = new JDate(sd);
        break;
      case UserOccasionTypes.SecularDateRecurringMonthly:
        sd = new Date(
          nowSd.getFullYear(),
          nowSd.getMonth(),
          this.sdate.getDate() + 1
        );
        while (sd > nowSd) {
          sd.setMonth(sd.getMonth() - 1);
        }
        jd = new JDate(sd);
        break;
      default:
        jd = null;
    }
    return jd;
  }

  /**
   * Compares 2 events to see if they have the same title, date, type, color and comment.
   * @param {UserOccasion} occasion
   */
  isSameOccasion(occasion: UserOccasion) {
    if (!occasion) {
      return false;
    }
    return (
      this.title === occasion.title &&
      this.occasionType === occasion.occasionType &&
      this.dateAbs === occasion.dateAbs &&
      this.color === occasion.color &&
      this.comments === occasion.comments
    );
  }

  /**
   * Returns whether or not the color of this event was ever changed from the default color.
   */
  isCustomColor() {
    return this.color !== UserOccasion.defaultColor;
  }

  /**
   * Return a cloned copy of this event.S
   */
  clone() {
    return new UserOccasion(
      this.title,
      this.occasionType,
      this.dateAbs,
      this.color,
      this.comments,
      this.occasionId
    );
  }

  /**
   * Get the Jewish Date for the date of this event.
   */
  get jdate() {
    if (!this.privateJdate) {
      this.privateJdate = new JDate(this.dateAbs);
    }
    return this.privateJdate;
  }

  /**
   * Set the date of this event by supplying a Jewish Date.
   */
  set jdate(jd) {
    this.privateJdate = jd;
    this.dateAbs = jd.Abs;
    this.privateSdate = jd.getDate();
  }

  /**
   * Get the Secular Date for the date of this event.
   */
  get sdate() {
    if (!this.privateSdate) {
      this.privateSdate = JDate.sdFromAbs(this.dateAbs);
    }
    return this.privateSdate;
  }

  /**
   * Set the date of this event by supplying a Javascript Date.
   */
  set sdate(sd) {
    this.privateJdate = new JDate(sd);
    this.privateSdate = sd;
    this.dateAbs = this.privateJdate.Abs;
  }

  /**
   * Returns whether or not this Occasion was ever saved to the database.
   */
  get hasId() {
    return !!this.occasionId;
  }

  /**
   * Sorts a list of UserOccasions chronologically
   * @param {[UserOccasion]} occasionList
   */
  static sortList(occasionList: Array<UserOccasion>) {
    return occasionList.sort((a, b) => a.dateAbs - b.dateAbs);
  }

  /**
   * Returns a list of occasions for the given date.
   * Works out recurring occasions and returns those that the
   * given date matches any iteration.
   * @param {JDate} jdate
   * @param {[UserOccasion]} allOccasions
   */
  static getOccasionsForDate(jdate: JDate, allOccasions: Array<UserOccasion>) {
    return allOccasions.filter(o => {
      const oJDate = o.jdate;
      switch (o.occasionType) {
        case UserOccasionTypes.OneTime:
          return o.dateAbs === jdate.Abs;
        case UserOccasionTypes.HebrewDateRecurringYearly:
          return oJDate.Month === jdate.Month && oJDate.Day === jdate.Day;
        case UserOccasionTypes.HebrewDateRecurringMonthly:
          return oJDate.Day === jdate.Day;
        case UserOccasionTypes.SecularDateRecurringYearly:
        case UserOccasionTypes.SecularDateRecurringMonthly: {
          const sdate1 = jdate.getDate();
          const sdate2 = oJDate.getDate();
          // For both secular occasion types, the day of the month must match
          if (sdate1.getDate() !== sdate2.getDate()) {
            return false;
          }
          // Now that the day matches, for a monthly occasion, the match is confirmed.
          return (
            o.occasionType === UserOccasionTypes.SecularDateRecurringMonthly ||
            // For a  yearly occasion, the month must also match
            sdate1.getMonth() === sdate2.getMonth()
          );
        }
        default:
          return null;
      }
    });
  }
}

export { UserOccasionTypes, UserOccasion };
