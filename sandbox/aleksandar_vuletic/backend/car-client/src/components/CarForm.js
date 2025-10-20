import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

const CarForm = ({ onAdd, editingCar, onUpdate }) => {
  const [car, setCar] = useState({ make: '', model: '', year: '' });

  useEffect(() => {
    if (editingCar) setCar(editingCar);
  }, [editingCar]);

  const handleChange = (field, value) => {
    setCar({ ...car, [field]: value });
  };

  const handleSubmit = () => {
    if (!car.make || !car.model || !car.year) return;
    const carData = { ...car, year: parseInt(car.year) };
    editingCar ? onUpdate(carData) : onAdd(carData);
    setCar({ make: '', model: '', year: '' });
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Marka"
        value={car.make}
        onChangeText={text => handleChange('make', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Model"
        value={car.model}
        onChangeText={text => handleChange('model', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Godina"
        keyboardType="numeric"
        value={car.year.toString()}
        onChangeText={text => handleChange('year', text)}
      />
      <Button title={editingCar ? "Izmeni auto" : "Dodaj auto"} onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
});

export default CarForm;