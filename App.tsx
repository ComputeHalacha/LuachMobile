import "react-native-gesture-handler";
import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import HomeScreen from "./App/GUI/Screens/HomeScreen";
import SettingsScreen from "./App/GUI/Screens/SettingsScreen";
import NewOccasionScreen from "./App/GUI/Screens/NewOccasionScreen";
import OccasionsScreen from "./App/GUI/Screens/OccasionsScreen";
import KavuahScreen from "./App/GUI/Screens/KavuahScreen";
import EntryScreen from "./App/GUI/Screens/EntryScreen";
import FlaggedDatesScreen from "./App/GUI/Screens/FlaggedDatesScreen";
import NewEntryScreen from "./App/GUI/Screens/NewEntryScreen";
import NewKavuahScreen from "./App/GUI/Screens/NewKavuahScreen";
import DateDetailsScreen from "./App/GUI/Screens/DateDetailsScreen";
import FindKavuahScreen from "./App/GUI/Screens/FindKavuahScreen";
import FindLocationScreen from "./App/GUI/Screens/FindLocationScreen";
import MonthViewScreen from "./App/GUI/Screens/MonthViewScreen";
import BrowserScreen from "./App/GUI/Screens/BrowserScreen";
import ExportDataScreen from "./App/GUI/Screens/ExportDataScreen";
import NewLocationScreen from "./App/GUI/Screens/NewLocationScreen";
import RemoteBackupScreen from "./App/GUI/Screens/RemoteBackupScreen";

const AppNavigator = createStackNavigator(
        {
            Home: HomeScreen,
            Settings: SettingsScreen,
            NewOccasion: NewOccasionScreen,
            Occasions: OccasionsScreen,
            Kavuahs: KavuahScreen,
            Entries: EntryScreen,
            NewEntry: NewEntryScreen,
            NewKavuah: NewKavuahScreen,
            FlaggedDates: FlaggedDatesScreen,
            DateDetails: DateDetailsScreen,
            FindKavuahs: FindKavuahScreen,
            FindLocation: FindLocationScreen,
            MonthView: MonthViewScreen,
            Browser: BrowserScreen,
            ExportData: ExportDataScreen,
            NewLocation: NewLocationScreen,
            RemoteBackup: RemoteBackupScreen,
        },
        {
            initialRouteName: "Home",
        }
    ),
    AppContainer = createAppContainer(AppNavigator);

export default function App() {
    return <AppContainer />;
}
