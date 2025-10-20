import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import API from './api';
import CarList from './components/CarList';
import CarForm from './components/CarForm';

export default function App() {
  const [cars, setCars] = useState([]);
  const [editingCar, setEditingCar] = useState(null);

  const loadCars = async () => {
    try {
      const res = await API.get('/');
      setCars(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju automobila', err);
    }
  };

  const addCar = async (car) => {
    try {
      await API.post('/', car);
      loadCars();
    } catch (err) {
      console.error('Greška pri dodavanju automobila', err);
    }
  };

  const updateCar = async (car) => {
    try {
      await API.put(`/${car.id}`, car);
      setEditingCar(null);
      loadCars();
    } catch (err) {
      console.error('Greška pri ažuriranju automobila', err);
    }
  };

  const deleteCar = async (id) => {
    try {
      await API.delete(`/${id}`);
      loadCars();
    } catch (err) {
      console.error('Greška pri brisanju automobila', err);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <CarForm onAdd={addCar} editingCar={editingCar} onUpdate={updateCar} />
      <CarList cars={cars} onEdit={setEditingCar} onDelete={deleteCar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});