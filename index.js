import {AppRegistry} from 'react-native';
import AppNavigator from './app/AppNavigators';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => AppNavigator);
