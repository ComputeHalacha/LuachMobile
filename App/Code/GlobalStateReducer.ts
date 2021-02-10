import AppData from './Data/AppData';
import LocalStorage from './Data/LocalStorage';
import { UserOccasion } from './JCal/UserOccasion';
import Settings from './Settings';
import Entry from './Chashavshavon/Entry';
import { Kavuah } from './Chashavshavon/Kavuah';
import ProblemOnah from './Chashavshavon/ProblemOnah';
import { TaharaEvent } from './Chashavshavon/TaharaEvent';

interface GlobalState {
  appData: AppData;
  localStorage: LocalStorage;
}
interface Dispatch {
  type: string;
  payload:
    | GlobalState
    | LocalStorage
    | AppData
    | Settings
    | UserOccasion
    | Entry
    | Kavuah
    | ProblemOnah
    | TaharaEvent;
}

function getNextId(
  itemList: Array<{ id: number; [propName: string]: unknown }>
) {
  // find the maximum id in the list
  return (Math.max(...itemList.map(i => i.id)) || 0) + 1;
}

/**
 *
 * @param {{appData:AppData, localStorage:LocalStorage}} state
 * @param {Function({type:string,payload:any})} action
 */
export default function globalStateReducer(
  state: GlobalState,
  action: Dispatch
) {
  switch (action.type) {
    case 'INIT_GLOBAL_STATE':
      return { ...action.payload };
    case 'UPDATE_LOCAL_STORAGE':
      return { ...state, localStorage: action.payload };
    case 'UPDATE_APP_DATA':
      return {
        ...state,
        appData: action.payload
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        appData: { ...state.appData, Settings: action.payload }
      };
    case 'UPDATE_SETTING_SHOW_OHR_ZERUAH': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, showOhrZeruah: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_KEEP_THIRTY_ONE': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, keepThirtyOne: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_ONAH_BEINUNIS_24_HOURS': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, onahBeinunis24Hours: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_NUMBER_MONTHS_AHEAD_TO_WARN': {
      const settings = state.appData.Settings;
      const newSettings = {
        ...settings,
        numberMonthsAheadToWarn: action.payload
      };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_KEEP_LONGER_HAFLAGAH': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, keepLongerHaflagah: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_DILUG_CHODESH_PAST_ENDS': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, dilugChodeshPastEnds: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_HAFLAGA_OF_ONAHS': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, haflagaOfOnahs: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_KAVUAH_DIFF_ONAHS': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, kavuahDiffOnahs: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_CALC_KAVUAHS_ON_NEW_ENTRY': {
      const settings = state.appData.Settings;
      const newSettings = {
        ...settings,
        calcKavuahsOnNewEntry: action.payload
      };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_SHOW_PROB_FLAG_ON_HOME': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, showProbFlagOnHome: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_SHOW_ENTRY_FLAG_ON_HOME': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, showEntryFlagOnHome: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_NAVIGATE_BY_SECULAR_DATE': {
      const settings = state.appData.Settings;
      const newSettings = {
        ...settings,
        navigateBySecularDate: action.payload
      };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_SHOW_IGNORED_KAVUAHS': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, showIgnoredKavuahs: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_NO_PROBS_AFTER_ENTRY': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, noProbsAfterEntry: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_HIDE_HELP': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, hideHelp: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_DISCREET': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, discreet: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_AUTO_BACKUP': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, autoBackup: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_REMIND_BEDK_AFTRN_HOUR': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, remindBedkAftrnHour: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_REMIND_DAY_ONAH_HOUR': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, remindDayOnahHour: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_SETTING_REMIND_NIGHT_ONAH_HOUR': {
      const settings = state.appData.Settings;
      const newSettings = { ...settings, remindNightOnahHour: action.payload };
      return {
        ...state,
        appData: { ...state.appData, Settings: newSettings }
      };
    }
    case 'UPDATE_OCCASION': {
      const updatedList = [...state.appData.UserOccasions];
      const occasion = action.payload as UserOccasion;
      const index = updatedList.findIndex(
        i => i.occasionId === occasion.occasionId
      );
      updatedList[index] = occasion;
      return {
        ...state,
        appData: { ...state.appData, UserOccasions: updatedList }
      };
    }
    case 'ADD_OCCASION': {
      return {
        ...state,
        appData: {
          ...state.appData,
          UserOccasions: [...state.appData.UserOccasions, action.payload]
        }
      };
    }
    case 'REMOVE_OCCASION': {
      const filteredList = state.appData.UserOccasions.filter(
        i => i.occasionId !== (action.payload as UserOccasion).occasionId
      );
      return {
        ...state,
        appData: { ...state.appData, UserOccasions: filteredList }
      };
    }
    case 'UPDATE_ENTRY': {
      const updatedList = [...state.appData.EntryList];
      const entry = action.payload as Entry;
      const index = updatedList.findIndex(i => i.entryId === entry.entryId);
      updatedList[index] = entry;
      return {
        ...state,
        appData: { ...state.appData, EntryList: updatedList }
      };
    }
    case 'ADD_ENTRY': {
      return {
        ...state,
        appData: {
          ...state.appData,
          EntryList: [...state.appData.EntryList, action.payload]
        }
      };
    }
    case 'REMOVE_ENTRY': {
      const filteredList = state.appData.EntryList.filter(
        i => i.entryId !== (action.payload as Entry).entryId
      );
      return {
        ...state,
        appData: { ...state.appData, EntryList: filteredList }
      };
    }
    case 'UPDATE_KAVUAH': {
      const updatedList = [...state.appData.KavuahList];
      const kavuah = action.payload as Kavuah;
      const index = updatedList.findIndex(i => i.kavuahId === kavuah.kavuahId);
      updatedList[index] = kavuah;
      return {
        ...state,
        appData: { ...state.appData, KavuahList: updatedList }
      };
    }
    case 'ADD_KAVUAH': {
      return {
        ...state,
        appData: {
          ...state.appData,
          KavuahList: [...state.appData.KavuahList, action.payload]
        }
      };
    }
    case 'REMOVE_KAVUAH': {
      const filteredList = state.appData.KavuahList.filter(
        i => i.kavuahId !== (action.payload as Kavuah).kavuahId
      );
      return {
        ...state,
        appData: { ...state.appData, KavuahList: filteredList }
      };
    }
    case 'ADD_PROBLEM_ONAH': {
      const probOnah = action.payload;
      return {
        ...state,
        appData: {
          ...state.appData,
          ProblemOnahs: [...state.appData.ProblemOnahs, probOnah]
        }
      };
    }
    case 'REMOVE_PROBLEM_ONAH': {
      const prob = action.payload as ProblemOnah;
      const filteredList = state.appData.ProblemOnahs.filter(i =>
        i.isSameProb(prob)
      );
      return {
        ...state,
        appData: { ...state.appData, ProblemOnahs: filteredList }
      };
    }
    case 'UPDATE_TAHARA_EVENT': {
      const updatedList = [...state.appData.TaharaEvents];
      const tEvent = action.payload as TaharaEvent;
      const index = updatedList.findIndex(
        i => i.taharaEventId === tEvent.taharaEventId
      );
      updatedList[index] = tEvent;

      return {
        ...state,
        appData: { ...state.appData, TaharaEvents: updatedList }
      };
    }
    case 'ADD_TAHARA_EVENT': {
      return {
        ...state,
        appData: {
          ...state.appData,
          TaharaEvents: [...state.appData.TaharaEvents, action.payload]
        }
      };
    }
    case 'REMOVE_TAHARA_EVENT': {
      const filteredList = state.appData.TaharaEvents.filter(
        i => i.taharaEventId !== (action.payload as TaharaEvent).taharaEventId
      );
      return {
        ...state,
        appData: { ...state.appData, TaharaEvents: filteredList }
      };
    }
    default:
      return state;
  }
}

export { globalStateReducer, getNextId };
