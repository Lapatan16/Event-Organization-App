// OpenStreetMapView.web.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OpenStreetMapView = () => (
  <View style={styles.container}>
    <Text style={styles.text}>🗺️ Mapa nije dostupna u web prikazu.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  text: {
    color: '#555',
  },
});

export default OpenStreetMapView;
