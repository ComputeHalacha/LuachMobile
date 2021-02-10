import Utils from './Utils';
import JDate from './JDate';
import Location from './Location';
/* Returns the molad for the given jewish month and year.
 * Algorithm was adapted from Hebcal by Danny Sadinoff
 *
 * Example of use:
 * const moladString = Molad.getString(5776, 10);
 */
export default class Molad {
  static getMolad(month: number, year: number) {
    let monthAdj = month - 7;

    if (monthAdj < 0) {
      monthAdj += JDate.monthsJYear(year);
    }
    const totalMonths = Utils.toInt(
      monthAdj +
        235 * Utils.toInt((year - 1) / 19) +
        12 * ((year - 1) % 19) +
        (((year - 1) % 19) * 7 + 1) / 19
    );
    const partsElapsed = 204 + 793 * (totalMonths % 1080);
    const hoursElapsed =
      5 +
      12 * totalMonths +
      793 * Utils.toInt(totalMonths / 1080) +
      Utils.toInt(partsElapsed / 1080) -
      6;
    const parts = Utils.toInt(
      (partsElapsed % 1080) + 1080 * (hoursElapsed % 24)
    );

    return {
      JDate: new JDate(
        1 + 29 * Utils.toInt(totalMonths) + Utils.toInt(hoursElapsed / 24)
      ),
      time: {
        hour: Utils.toInt(hoursElapsed) % 24,
        minute: Utils.toInt((parts % 1080) / 18)
      },
      chalakim: parts % 18
    };
  }

  // Returns the time of the molad as a string in the format: Monday Night, 8:33 PM and 12 Chalakim
  // The molad is always in Jerusalem so we use the Jerusalem sunset times
  // to determine whether to display "Night" or "Motzai Shabbos" etc. (check this...)
  static getString(year: number, month: number) {
    const molad = Molad.getMolad(month, year);
    const nightfall = molad.JDate.getSunriseSunset(Location.getJerusalem())
      .sunset;
    const isNight =
      Utils.totalMinutes(Utils.timeDiff(molad.time, nightfall)) >= 0;
    const dow = molad.JDate.getDayOfWeek();
    let str = '';

    if (Number.isNaN(nightfall.hour)) {
      str += Utils.dowEng[dow];
    } else if (dow === 6 && isNight) {
      str += 'Motzai Shabbos,';
    } else if (dow === 5 && isNight) {
      str += 'Shabbos Night,';
    } else {
      str += Utils.dowEng[dow] + (isNight ? ' Night' : '');
    }
    str += ` ${Utils.getTimeString(
      molad.time
    )} and ${molad.chalakim.toString()} Chalakim`;

    return str;
  }

  // Returns the time of the molad as a string in the format: ליל שני 20:33 12 חלקים
  // The molad is always in Jerusalem so we use the Jerusalem sunset times
  // to determine whether to display "ליל/יום" or "מוצאי שב"ק" etc.
  static getStringHeb(year: number, month: number) {
    const molad = Molad.getMolad(month, year);
    const nightfall = molad.JDate.getSunriseSunset(Location.getJerusalem())
      .sunset;
    const isNight =
      Utils.totalMinutes(Utils.timeDiff(molad.time, nightfall)) >= 0;
    const dow = molad.JDate.getDayOfWeek();
    let str = '';

    if (dow === 6) {
      str += isNight ? 'מוצאי שב"ק' : 'יום שב"ק';
    } else if (dow === 5) {
      str += isNight ? 'ליל שב"ק' : 'ערב שב"ק';
    } else {
      str += (isNight ? 'ליל' : 'יום') + Utils.dowHeb[dow].replace('יום', '');
    }
    str += ` ${Utils.getTimeString(
      molad.time,
      true
    )} ${molad.chalakim.toString()} חלקים`;

    return str;
  }
}
