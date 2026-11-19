import { Platform } from 'react-native';
import { MapComponentProps } from './MapComponent.android';

let MapComponentImpl: React.FC<MapComponentProps>;

if (Platform.OS === 'android') {
  MapComponentImpl = require('./MapComponent.android').MapComponent;
} else if (Platform.OS === 'ios') {
  MapComponentImpl = require('./MapComponent.ios').MapComponent;
} else {
  MapComponentImpl = require('./MapComponent.web').MapComponent;
}

export const MapComponent = MapComponentImpl;
export * from './MapComponent.android';

