import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';

const CarList = ({ cars, onEdit, onDelete }) => {
  return (
    <View>
      <Text style={styles.title}>Lista automobila</Text>
      <FlatList
        data={cars}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.carItem}>
            <Text>{item.make} {item.model} ({item.year})</Text>
            <View style={styles.buttons}>
              <Button title="Izmeni" onPress={() => onEdit(item)} />
              <Button title="Obriši" onPress={() => onDelete(item.id)} color="red" />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  carItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});

export default CarList;