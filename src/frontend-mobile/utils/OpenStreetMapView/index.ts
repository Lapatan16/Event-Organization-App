import { Platform } from 'react-native';

let OpenStreetMapView: any;

const factory = Platform.select({
  ios: () => require('./OpenStreetMapView.native').default,
  android: () => require('./OpenStreetMapView.native').default,
  web: () => require('./OpenStreetMapView.web').default,
});

if (factory) {
  OpenStreetMapView = factory();
} else {
  throw new Error('Unsupported platform for OpenStreetMapView');
}

export default OpenStreetMapView;

