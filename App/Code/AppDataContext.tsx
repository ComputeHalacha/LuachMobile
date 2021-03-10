import React, {
    useContext,
    useEffect,
    createContext,
    ReactNode,
    useState,
    Fragment,
} from "react";
import AppData from "./Data/AppData";
import { isFirstTimeRun, initFirstRun } from "./GeneralUtils";
import LocalStorage from "./Data/LocalStorage";

type Data = {
    appData: AppData;
    localStorage: LocalStorage;
};

type GlobalData = {
    data: Data;
    setData: (data: Data) => void;
};

type Props = {
    children: ReactNode;
    globalData: GlobalData;
};

const newData: GlobalData = {
    data: {
        appData: new AppData(),
        localStorage: new LocalStorage(),
    },
    setData: () => {},
};

const AppDataContext = createContext(newData);

function AppDataProvider(props: { children: Element }) {
    const [currentData, setCurrentData] = useState(newData.data);

    useEffect(() => {
        async function initialize() {
            if (await isFirstTimeRun()) {
                await initFirstRun();
            }
            const appData = await AppData.fromDatabase();
            const localStorage = await LocalStorage.loadAll();
            setCurrentData({ appData, localStorage });
        }
        initialize();
    }, []);

    return <>{props.children}</>;
}

function GlobalDataAndStorage() {
    return useContext(AppDataContext);
}

export { AppDataProvider, GlobalDataAndStorage };
