import { useState, useEffect } from 'react';
import FestivalList from './FestivalList';
import FestivalForm from './FestivalForm';
import "./App.css";

function App() {
  const [Festivali, setFestivali] = useState([]);

  const loadFestivali = async () => {
    const res = await fetch('http://localhost:7016/api/Festival');
    const data = await res.json();
    setFestivali(data);
  };

  useEffect(() => {
    loadFestivali();
  }, []);

  return (
    <>
      <FestivalForm onFestivalCreated={loadFestivali} />
      <FestivalList Festivali={Festivali} refresh={loadFestivali} />
    </>
  );
}
export default App;
