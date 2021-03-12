import { registerRootComponent } from 'expo';

import App from './App';

const isHermes = () => !!global.HermesInternal;
console.log(`Hermes Engine: ${isHermes()}`);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
