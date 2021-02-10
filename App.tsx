import React from 'react';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './App/GUI/Screens/HomeScreen';
import SettingsScreen from './App/GUI/Screens/SettingsScreen';
import NewOccasionScreen from './App/GUI/Screens/NewOccasionScreen';
import OccasionsScreen from './App/GUI/Screens/OccasionsScreen';
import KavuahScreen from './App/GUI/Screens/KavuahScreen';
import EntryScreen from './App/GUI/Screens/EntryScreen';
import FlaggedDatesScreen from './App/GUI/Screens/FlaggedDatesScreen';
import NewEntryScreen from './App/GUI/Screens/NewEntryScreen';
import NewKavuahScreen from './App/GUI/Screens/NewKavuahScreen';
import DateDetailsScreen from './App/GUI/Screens/DateDetailsScreen';
import FindKavuahScreen from './App/GUI/Screens/FindKavuahScreen';
import FindLocationScreen from './App/GUI/Screens/FindLocationScreen';
import MonthViewScreen from './App/GUI/Screens/MonthViewScreen';
import BrowserScreen from './App/GUI/Screens/BrowserScreen';
import ExportDataScreen from './App/GUI/Screens/ExportDataScreen';
import NewLocationScreen from './App/GUI/Screens/NewLocationScreen';
import RemoteBackupScreen from './App/GUI/Screens/RemoteBackupScreen';

export default function App() {
  return StackNavigator(
    {
        Home: { screen: HomeScreen },
        Settings: { screen: SettingsScreen },
        NewOccasion: { screen: NewOccasionScreen },
        Occasions: { screen: OccasionsScreen },
        Kavuahs: { screen: KavuahScreen },
        Entries: { screen: EntryScreen },
        NewEntry: { screen: NewEntryScreen },
        NewKavuah: { screen: NewKavuahScreen },
        FlaggedDates: { screen: FlaggedDatesScreen },
        DateDetails: { screen: DateDetailsScreen },
        FindKavuahs: { screen: FindKavuahScreen },
        FindLocation: { screen: FindLocationScreen },
        MonthView: { screen: MonthViewScreen },
        Browser: { screen: BrowserScreen },
        ExportData: { screen: ExportDataScreen },
        NewLocation: { screen: NewLocationScreen },
        RemoteBackup: { screen: RemoteBackupScreen },
    },
    {
        initialRouteName: 'Home',
        //If not in __DEV__  turn off the built-in logger
        onNavigationStateChange: __DEV__ ? undefined : null,
    }
);
}