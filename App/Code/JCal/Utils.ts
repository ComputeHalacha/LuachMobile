import JDate from './JDate';

export default class Utils {
  static jMonthsEng = [
    '',
    'Nissan',
    'Iyar',
    'Sivan',
    'Tamuz',
    'Av',
    'Ellul',
    'Tishrei',
    'Cheshvan',
    'Kislev',
    'Teves',
    'Shvat',
    'Adar',
    'Adar Sheini'
  ];

  static jMonthsHeb = [
    '',
    'ניסן',
    'אייר',
    'סיון',
    'תמוז',
    'אב',
    'אלול',
    'תשרי',
    'חשון',
    'כסלו',
    'טבת',
    'שבט',
    'אדר',
    'אדר שני'
  ];

  static sMonthsEng = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  static dowEng = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Erev Shabbos',
    'Shabbos Kodesh'
  ];

  static dowHeb = [
    'יום ראשון',
    'יום שני',
    'יום שלישי',
    'יום רביעי',
    'יום חמישי',
    'ערב שבת קודש',
    'שבת קודש'
  ];

  static jsd = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];

  static jtd = ['י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

  static jhd = ['ק', 'ר', 'ש', 'ת'];

  static jsnum = [
    '',
    'אחד',
    'שנים',
    'שלשה',
    'ארבעה',
    'חמשה',
    'ששה',
    'שבעה',
    'שמונה',
    'תשעה'
  ];

  static jtnum = ['', 'עשר', 'עשרים', 'שלושים', 'ארבעים'];

  /**
   * Gets the Jewish representation of a number (365 = שס"ה)
   * Minimum number is 1 and maximum is 9999.
   * @param {Number} number
   */
  static toJNum(number: number) {
    if (number < 1) {
      throw 'Min value is 1';
    }

    if (number > 9999) {
      throw 'Max value is 9999';
    }

    let n = number;
    let retval = '';

    if (n >= 1000) {
      retval += `${Utils.jsd[Utils.toInt((n - (n % 1000)) / 1000) - 1]}'`;
      n %= 1000;
    }

    while (n >= 400) {
      retval += 'ת';
      n -= 400;
    }

    if (n >= 100) {
      retval += Utils.jhd[Utils.toInt((n - (n % 100)) / 100) - 1];
      n %= 100;
    }

    if (n === 15) {
      retval += 'טו';
    } else if (n === 16) {
      retval += 'טז';
    } else {
      if (n > 9) {
        retval += Utils.jtd[Utils.toInt((n - (n % 10)) / 10) - 1];
      }
      if (n % 10 > 0) {
        retval += Utils.jsd[(n % 10) - 1];
      }
    }
    if (number > 999 && number % 1000 < 10) {
      retval = `'${retval}`;
    } else if (retval.length > 1) {
      retval = `${retval.slice(0, -1)}"${retval[retval.length - 1]}`;
    }
    return retval;
  }

  /**
   * Returns the javascript date in the format: Thursday, the 3rd of January 2018.
   * @param {Date} date
   * @param {Boolean} hideDayOfWeek
   * @param {Boolean} noCapitalize
   */
  static toStringDate(
    date: Date,
    hideDayOfWeek?: boolean,
    noCapitalize?: boolean
  ) {
    const cap = noCapitalize ? 't' : 'T';
    return `${
      hideDayOfWeek ? cap : `${Utils.dowEng[date.getDay()]}, t`
    }he ${Utils.toSuffixed(date.getDate())} of ${
      Utils.sMonthsEng[date.getMonth()]
    } ${date.getFullYear().toString()}`;
  }

  /**
   * Add two character suffix to number. e.g. 21st, 102nd, 93rd, 500th
   * @param {Number} num
   */
  static toSuffixed(num: number) {
    const t = num.toString();
    let suffix = 'th';
    if (t.length === 1 || t[t.length - 2] !== '1') {
      switch (t[t.length - 1]) {
        case '1':
          suffix = 'st';
          break;
        case '2':
          suffix = 'nd';
          break;
        case '3':
          suffix = 'rd';
          break;
        default:
          break;
      }
    }
    return t + suffix;
  }

  /**
   * Returns if the given full secular year has a February 29th
   * @param {Number} year
   */
  static isSecularLeapYear(year: number) {
    return !(year % 400) || (!!(year % 100) && !(year % 4));
  }

  /**
   * Get day of week using Javascripts getDay function.
   * Important note: months starts at 1 not 0 like javascript
   * The DOW returned has Sunday = 0
   * @param {Number} year
   * @param {Number} month
   * @param {Number} day
   */
  static getSdDOW(year: number, month: number, day: number | undefined) {
    return new Date(year, month - 1, day).getDay();
  }

  /**
   * Makes sure hour is between 0 and 23 and minute is between 0 and 59.
   * Overlaps get added/subtracted.
   * The argument needs to be an object in the format {hour : 12, minute :42 }
   * @param {{hour:Number, minute:Number}} hm
   */
  static fixHourMinute(hm: { hour: number; minute: number }) {
    if (!hm)
      throw new Error(
        'Utils.fixHourMinute - hm is not an object of type {hour:Number, minute:Number}'
      );
    // make a copy - javascript sends object parameters by reference
    const result = { hour: hm.hour, minute: hm.minute };
    while (result.minute < 0) {
      result.minute += 60;
      result.hour--;
    }
    while (result.minute >= 60) {
      result.minute -= 60;
      result.hour++;
    }
    if (result.hour < 0) {
      result.hour = 24 + (result.hour % 24);
    }
    if (result.hour > 23) {
      result.hour %= 24;
    }
    return result;
  }

  /**
   * Add the given number of minutes to the given time.
   * The argument needs to be an object in the format {hour : 12, minute :42 }
   *
   * @param {{hour:Number, minute:Number}} hm
   * @param {Number} minutes
   */
  static addMinutes(hm: { hour: number; minute: number }, minutes: number) {
    if (!hm)
      throw new Error(
        'Utils.addMinutes - hm is not an object of type {hour:Number, minute:Number}'
      );
    return Utils.fixHourMinute({
      hour: hm.hour,
      minute: hm.minute + minutes
    });
  }

  /**
   * Gets the time difference between two times of day.
   * Both arguments need to be an object in the format {hour : 12, minute :42 }
   * @param {{hour:Number, minute:Number}} time1
   * @param {{hour:Number, minute:Number}} time2
   */
  static timeDiff(
    time1: { hour: number; minute: number },
    time2: { hour: number; minute: number }
  ) {
    return Utils.fixHourMinute(
      Utils.addMinutes(time1, Utils.totalMinutes(time2))
    );
  }

  /**
   * Gets the total number of minutes in the given time.
   * @param {{hour:Number, minute:Number}} time An object in the format {hour : 12, minute :42 }
   */
  static totalMinutes(time: { hour: number; minute: number }) {
    return time.hour * 60 + time.minute;
  }

  /**
   * Returns the given time in a formatted string.     *
   * @param {{hour:Number, minute:Number}} hm An object in the format {hour : 23, minute :42 }
   * @param {Boolean} army If falsey, the returned string will be: 11:42 PM otherwise it will be 23:42
   * @param {Boolean} roundUp If falsey, the numbers will converted to a whole number by rounding down, otherwise, up.
   */
  static getTimeString(
    hm: { hour: number; minute: number },
    army = false,
    roundUp = false
  ) {
    if (!hm)
      throw new Error(
        'Utils.getTimeString - hm is not an object of type {hour:Number, minute:Number}'
      );
    const round = roundUp ? Math.ceil : Math.floor;
    const hourMinute = { hour: round(hm.hour), minute: round(hm.minute) };
    if (army) {
      return `${hourMinute.hour.toString()}:${
        hourMinute.minute < 10
          ? `0${hourMinute.minute.toString()}`
          : hourMinute.minute.toString()
      }`;
    }
    const hour = hourMinute.hour === 0 ? 12 : hourMinute.hour;
    return `${(hourMinute.hour <= 12
      ? hour
      : hourMinute.hour - 12
    ).toString()}:${
      hourMinute.minute < 10
        ? `0${hourMinute.minute.toString()}`
        : hourMinute.minute.toString()
    }${hourMinute.hour < 12 ? ' AM' : ' PM'}`;
  }

  /**
   * Returns the given time in a simple formatted string: 17:06:00
   * @param {{hour:Number, minute:Number}} hm An object in the format {hour : 23, minute :42 }
   */
  static getSimpleTimeString(hm?: {
    hour: number;
    minute: number;
  }): string | null {
    if (!hm) {
      return null;
    }
    if (hm.hour < 0)
      throw new Error(
        'Utils.getSimpleTimeString - hm is not an object of type {hour:Number, minute:Number}'
      );
    return `${hm.hour < 10 ? '0' : ''}${hm.hour}:${hm.minute < 10 ? '0' : ''}${
      hm.minute
    }:00`;
  }

  /**
   * Returns the given time as an object in the format {hour : 17, minute :6 }
   * @param {string} str A string in the format 17:06:00
   */
  static fromSimpleTimeString(str: string) {
    if (str && str.length) {
      const parts = str.split(':');
      if (parts.length > 1) {
        const hour = parseInt(parts[0], 10);
        const minute = parseInt(parts[1], 10);
        if (
          !Number.isNaN(hour) &&
          hour >= 0 &&
          hour <= 23 &&
          !Number.isNaN(minute) &&
          minute >= 0 &&
          minute <= 59
        ) {
          return { hour, minute };
        }
      }
    }
    return null;
  }

  /**
   * Gets the UTC offset in whole hours for the users time zone.
   * Note: this is not affected by DST - unlike javascripts getTimezoneOffset() function which gives you the current offset.
   */
  static currUtcOffset() {
    const date = new Date();
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    return -Utils.toInt(
      Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset()) / 60
    );
  }

  /** Determines if the given date is within DST on the users system */
  static isDateDST(date: { getTimezoneOffset: () => number }) {
    return (
      -Utils.toInt(date.getTimezoneOffset() / 60) !== Utils.currUtcOffset()
    );
  }

  /** Determines if the given date is within DST in the given location
   * Note: This may not be correct if the user has set the Location to a
   * time zone outside Israel or the USA which is not the current system time zone.
   */
  static isDST(location: { UTCOffset: number; Israel: boolean }, date: Date) {
    // If the current system time zone is the same as the given locations time zone
    if (location.UTCOffset === Utils.currUtcOffset()) {
      // We can use the system data to determine if the given date is within DST
      return Utils.isDateDST(date);
    }
    if (location.Israel) {
      return Utils.isIsraelDst(date);
    }
    return Utils.isUsaDst(date);
  }

  /**
   * Determines if the given javascript date is during DST according to the USA rules
   * @param {Date} date A javascript Date object
   */
  static isUsaDst(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    if (month < 3 || month === 12) {
      return false;
    }
    if (month > 3 && month < 11) {
      return true;
    }

    // DST starts at 2 AM on the second Sunday in March
    if (month === 3) {
      // March
      // Gets day of week on March 1st
      const firstDOW = Utils.getSdDOW(year, 3, 1);
      // Gets date of second Sunday
      const targetDate = firstDOW === 0 ? 8 : 7 - ((firstDOW + 7) % 7) + 8;

      return day > targetDate || (day === targetDate && hour >= 2);
    }
    // DST ends at 2 AM on the first Sunday in November //dt.Month == 11 / November

    // Gets day of week on November 1st
    const firstDOW = Utils.getSdDOW(year, 11, 1);
    // Gets date of first Sunday
    const targetDate = firstDOW === 0 ? 1 : 7 - ((firstDOW + 7) % 7) + 1;

    return day < targetDate || (day === targetDate && hour < 2);
  }

  //
  /**
   * Determines if the given Javascript date is during DST according to the current (5776) Israeli rules
   * @param {Date} date A Javascript Date object
   */
  static isIsraelDst(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    if (month > 10 || month < 3) {
      return false;
    }
    if (month > 3 && month < 10) {
      return true;
    }
    // DST starts at 2 AM on the Friday before the last Sunday in March
    if (month === 3) {
      // March
      // Gets date of the Friday before the last Sunday
      const lastFriday = 31 - Utils.getSdDOW(year, 3, 31) - 2;
      return day > lastFriday || (day === lastFriday && hour >= 2);
    }
    // DST ends at 2 AM on the last Sunday in October //dt.Month === 10 / October

    // Gets date of last Sunday in October
    const lastSunday = 31 - Utils.getSdDOW(year, 10, 31);
    return day < lastSunday || (day === lastSunday && hour < 2);
  }

  /** The current time in Israel - determined by the current users system time and time zone offset */
  static getSdNowInIsrael() {
    const now = new Date();
    // first determine the hour differential between this user and Israel time
    const israelTimeOffset = 2 + -Utils.currUtcOffset();
    // This will give us the current correct date and time in Israel
    now.setHours(now.getHours() + israelTimeOffset);
    return now;
  }

  /**
   * Adds the given number of days to the given javascript date and returns the new date
   * @param {Date} sdate
   * @param {Number} days
   */
  static addDaysToSdate(sdate: string | number, days: number) {
    const dat = new Date(sdate.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
  }

  /**
   * Compares two js dates to se if they both refer to the same day - time is ignored.
   * @param {Date} sdate1
   * @param {Date} sdate2
   */
  static isSameSdate(sdate1: Date, sdate2: Date) {
    return sdate1 && sdate2 && sdate1.toDateString() === sdate2.toDateString();
  }

  /**
   * Compares two JDates to se if they both refer to the same day - time is ignored.
   * @param {JDate} jdate1
   * @param {JDate} jdate2
   */
  static isSameJdate(jdate1: JDate, jdate2: JDate): boolean {
    return (
      !!jdate1 &&
      !!jdate2 &&
      !!jdate1.Abs &&
      !!jdate2.Abs &&
      jdate1.Abs === jdate2.Abs
    );
  }

  /**
   * Compares two JDates to see if they both refer to the same Jewish Month.
   * @param {JDate} jdate1
   * @param {JDate} jdate2
   */
  static isSameJMonth(jdate1: JDate, jdate2: JDate) {
    return jdate1.Month === jdate2.Month && jdate1.Year === jdate2.Year;
  }

  /**
   * Compares two dates to see if they both refer to the same Secular Month.
   * @param {Date} sdate1
   * @param {Date} sdate2
   */
  static isSameSMonth(sdate1: Date, sdate2: Date) {
    return (
      sdate1.getMonth() === sdate2.getMonth() &&
      sdate1.getFullYear() === sdate2.getFullYear()
    );
  }

  /**
   * Compares two time objects.
   * @param {{hour:Number, minute:Number}} time1
   * @param {{hour:Number, minute:Number}} time2
   */
  static isSameTime(
    time1: { hour: number; minute: number } | null,
    time2: { hour: number; minute: number } | null
  ) {
    return (
      time1 &&
      time2 &&
      time1.hour === time2.hour &&
      time1.minute === time2.minute
    );
  }

  /**
   * Converts the given complex number to an integer by removing the decimal part.
   * Returns same results as Math.floor for positive numbers and Math.ceil for negative ones.
   * Almost identical functionality to Math.trunc and parseInt.
   * The difference is if the argument is NaN. Math.trunc returns NaN while ths function returns 0.
   * In performance tests, this function was found to be quicker than the alternatives.
   * @param {Number} float The complex number to convert to an integer
   */
  static toInt(float: number) {
    // eslint-disable-next-line no-bitwise
    return float | 0;
  }
}
