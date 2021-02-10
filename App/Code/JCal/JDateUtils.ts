import AppData from '../Data/AppData';
import JDate from './JDate';
import Location from './Location';
import Utils from './Utils';
import Zmanim from './Zmanim';

/**
 * Determines if the time of the given Date() is after sunset at the given Location
 * @param {Date} sdate
 * @param {Location} location
 */
export function isAfterSunset(sdate: Date, location: Location) {
  const sunriseSunset = Zmanim.getSunTimes(sdate, location);
  const nowMinutes = sdate.getHours() * 60 + sdate.getMinutes();
  const shkiaMinutes = Utils.totalMinutes(sunriseSunset.sunset);
  return nowMinutes >= shkiaMinutes;
}

/**
 * Gets the current Jewish Date at the given Location
 * @param {Location} location
 */
export function nowAtLocation(location: Location) {
  const sdate = new Date();
  // if isAfterSunset a day is added.
  if (isAfterSunset(sdate, location)) {
    sdate.setDate(sdate.getDate() + 1);
  }
  return new JDate(sdate);
}

/**
 * Gets the proper Jewish Date at the current time at the current location
 * @param {AppData} appData
 */
export function getTodayJdate(appData: AppData) {
  if (appData && appData.Settings && !appData.Settings.navigateBySecularDate) {
    return nowAtLocation(appData.Settings.location);
  }
  return new JDate();
}

/**
 * Return true if given date is either Yom Kippur or Tish'a Be'av
 * @param {Jdate} jdate
 */
export function isYomKippurOrTishaBav(jdate: JDate) {
  if (jdate.Month === 7 && jdate.Day === 10) {
    return true;
  }
  if (
    (jdate.Month === 5 && jdate.Day === 9 && jdate.DayOfWeek !== 6) ||
    (jdate.Day === 10 && jdate.DayOfWeek === 0)
  ) {
    return true;
  }
  return false;
}
/**
 * Return true if given date is either Erev Yom Kippur or Erev Tish'a Be'av
 * @param {Jdate} jdate
 */
export function isErevYomKippurOrTishaBav(jdate: JDate) {
  if (jdate.Month === 7 && jdate.Day === 9) {
    return true;
  }
  if (
    (jdate.Month === 5 && jdate.Day === 8 && jdate.DayOfWeek !== 5) ||
    (jdate.Day === 9 && jdate.DayOfWeek === 6)
  ) {
    return true;
  }
  return false;
}
