import React, { useEffect, useState } from 'react';
import API from './api';
import CarList from './components/CarList';
import CarForm from './components/CarForm';

function App() {
  const [cars, setCars] = useState([]);

  const loadCars = async () => {
    const res = await API.get('/');
    setCars(res.data);
  };

  const addCar = async car => {
    await API.post('/', { ...car, year: parseInt(car.year) });
    loadCars();
  };

  const deleteCar = async id => {
    await API.delete(`/${id}`);
    loadCars();
  };

  useEffect(() => {
    loadCars();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Auto Menadžer</h1>
      <CarForm onAdd={addCar} />
      <CarList cars={cars} onDelete={deleteCar} />
    </div>
  );
}

export default App;