import Utils from './Utils';
import JDate from './JDate';
import { isValidDate } from '../GeneralUtils';
import Location from './Location';

export interface HourMinute {
  hour: number;
  minute: number;
}

/**
 * Computes the daily Zmanim for any single date at any location.
 * The astronomical and mathematical calculations were directly adapted from the excellent
 * Jewish calendar calculation in C# Copyright © by Ulrich and Ziporah Greve (2005)
 */
export default class Zmanim {
  /**
   * Gets sunrise and sunset time for given date and Location.
   * Accepts a javascript Date object, a string for creating a javascript date object or a JDate object.
   * Location object is required.
   * @returns {{sunrise:{hour:Number, minute:Number},sunset:{hour:Number, minute:Number}}
   * @param {Date | JDate} date A Javascript Date or Jewish Date for which to calculate the sun times.
   * @param {Location} location Where on the globe to calculate the sun times for.
   * @param {Boolean} considerElevation
   */
  static getSunTimes(
    date: string | number | JDate | Date,
    location: Location,
    considerElevation = true
  ) {
    let sdate: Date;
    if (date instanceof JDate) {
      sdate = date.getDate();
    } else {
      sdate = new Date(date);
    }

    if (!isValidDate(sdate)) {
      throw 'Zmanim.getSunTimes: supplied date parameter cannot be converted to a Date';
    }

    const day = Zmanim.dayOfYear(sdate),
      earthRadius = 6356900;
    let sunrise: HourMinute = { hour: -1, minute: -1 },
      sunset: HourMinute = { hour: -1, minute: -1 },
      zenithDeg = 90,
      zenithMin = 50,
      lonHour = 0,
      longitude = 0,
      latitude = 0,
      cosLat = 0,
      sinLat = 0,
      cosZen = 0,
      sinDec = 0,
      cosDec = 0,
      xmRise = 0,
      xmSet = 0,
      xlRise = 0,
      xlSet = 0,
      aRise = 0,
      aSet = 0,
      ahrRise = 0,
      ahrSet = 0,
      hRise = 0,
      hSet = 0,
      tRise = 0,
      tSet = 0,
      utRise = 0,
      utSet = 0;
    const zenithAtElevation =
      Zmanim.degToDec(zenithDeg, zenithMin) +
      Zmanim.radToDeg(
        Math.acos(
          earthRadius /
            (earthRadius + (considerElevation ? location.Elevation : 0))
        )
      );
    zenithDeg = Math.floor(zenithAtElevation);
    zenithMin = (zenithAtElevation - zenithDeg) * 60;
    cosZen = Math.cos(0.01745 * Zmanim.degToDec(zenithDeg, zenithMin));
    longitude = location.Longitude;
    lonHour = longitude / 15;
    latitude = location.Latitude;
    cosLat = Math.cos(0.01745 * latitude);
    sinLat = Math.sin(0.01745 * latitude);
    tRise = day + (6 + lonHour) / 24;
    tSet = day + (18 + lonHour) / 24;
    xmRise = Zmanim.M(tRise);
    xlRise = Zmanim.L(xmRise);
    xmSet = Zmanim.M(tSet);
    xlSet = Zmanim.L(xmSet);
    aRise = 57.29578 * Math.atan(0.91746 * Math.tan(0.01745 * xlRise));
    aSet = 57.29578 * Math.atan(0.91746 * Math.tan(0.01745 * xlSet));
    if (Math.abs(aRise + 360 - xlRise) > 90) {
      aRise += 180;
    }
    if (aRise > 360) {
      aRise -= 360;
    }
    if (Math.abs(aSet + 360 - xlSet) > 90) {
      aSet += 180;
    }
    if (aSet > 360) {
      aSet -= 360;
    }
    ahrRise = aRise / 15;
    sinDec = 0.39782 * Math.sin(0.01745 * xlRise);
    cosDec = Math.sqrt(1 - sinDec * sinDec);
    hRise = (cosZen - sinDec * sinLat) / (cosDec * cosLat);
    ahrSet = aSet / 15;
    sinDec = 0.39782 * Math.sin(0.01745 * xlSet);
    cosDec = Math.sqrt(1 - sinDec * sinDec);
    hSet = (cosZen - sinDec * sinLat) / (cosDec * cosLat);
    if (Math.abs(hRise) <= 1) {
      hRise = 57.29578 * Math.acos(hRise);
      utRise = (360 - hRise) / 15 + ahrRise + Zmanim.adj(tRise) + lonHour;
      sunrise = Zmanim.timeAdj(utRise + location.UTCOffset, sdate, location);
      if (sunrise.hour > 12) {
        sunrise.hour -= 12;
      }
    }
    if (Math.abs(hSet) <= 1) {
      hSet = 57.29578 * Math.acos(hSet);
      utSet = hRise / 15 + ahrSet + Zmanim.adj(tSet) + lonHour;
      sunset = Zmanim.timeAdj(utSet + location.UTCOffset, sdate, location);
      if (sunset.hour > 0 && sunset.hour < 12) {
        sunset.hour += 12;
      }
    }
    return { sunrise, sunset };
  }

  static getChatzos(date: Date | JDate, location: Location) {
    return Zmanim.getChatzosFromSuntimes(
      Zmanim.getSunTimes(date, location, false)
    );
  }

  static getChatzosFromSuntimes(sunTimes: {
    sunrise: HourMinute;
    sunset: HourMinute;
  }) {
    const rise: HourMinute = sunTimes.sunrise,
      set: HourMinute = sunTimes.sunset;

    if (Number.isNaN(rise.hour) || Number.isNaN(set.hour)) {
      return { hour: NaN, minute: NaN };
    }

    const riseMinutes = rise.hour * 60 + rise.minute,
      setMinutes = set.hour * 60 + set.minute,
      chatzos = Utils.toInt((setMinutes - riseMinutes) / 2);

    return Utils.addMinutes(rise, chatzos);
  }

  static getShaaZmanis(date: Date | JDate, location: Location, offset: number) {
    return Zmanim.getShaaZmanisFromSunTimes(
      Zmanim.getSunTimes(date, location, false),
      offset
    );
  }

  static getShaaZmanisFromSunTimes(
    sunTimes: { sunrise: HourMinute; sunset: HourMinute },
    offset?: number | undefined
  ) {
    let rise = sunTimes.sunrise,
      set = sunTimes.sunset;

    if (Number.isNaN(rise.hour) || Number.isNaN(set.hour)) {
      return NaN;
    }

    if (offset) {
      rise = Utils.addMinutes(rise, -offset);
      set = Utils.addMinutes(set, offset);
    }

    return (Utils.totalMinutes(set) - Utils.totalMinutes(rise)) / 12;
  }

  static getShaaZmanisMga(
    sunTimes: {
      sunrise: HourMinute;
      sunset: HourMinute;
    },
    israel: boolean
  ) {
    return Zmanim.getShaaZmanisFromSunTimes(sunTimes, israel ? 90 : 72);
  }

  static getCandleLighting(date: Date | JDate, location: Location) {
    return Zmanim.getCandleLightingFromSunTimes(
      Zmanim.getSunTimes(date, location),
      location
    );
  }

  static getCandleLightingFromSunTimes(
    sunTimes: {
      sunrise?: HourMinute | undefined;
      sunset: HourMinute;
    },
    location: Location
  ) {
    return Utils.addMinutes(sunTimes.sunset, -location.CandleLighting);
  }

  static dayOfYear(date: Date) {
    const month = date.getMonth(),
      isLeap = () => Utils.isSecularLeapYear(date.getFullYear()),
      yearDay = [0, 1, 32, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    return (
      yearDay[month + 1] + date.getDate() + (month > 1 && isLeap() ? 1 : 0)
    );
  }

  static degToDec(deg: number, min: number) {
    return deg + min / 60;
  }

  static M(x: number) {
    return 0.9856 * x - 3.251;
  }

  static L(x: number) {
    return (
      x +
      1.916 * Math.sin(0.01745 * x) +
      0.02 * Math.sin(2 * 0.01745 * x) +
      282.565
    );
  }

  static adj(x: number) {
    return -0.06571 * x - 6.62;
  }

  static radToDeg(rad: number) {
    return 57.29578 * rad;
  }

  static timeAdj(time: number, date: Date, location: Location) {
    let hour,
      t = time;

    if (t < 0) {
      t += 24;
    }
    hour = Utils.toInt(t);
    const min = Utils.toInt((t - hour) * 60 + 0.5);

    if (Utils.isDST(location, date)) {
      hour++;
    }

    return Utils.fixHourMinute({ hour, minute: min });
  }
}
