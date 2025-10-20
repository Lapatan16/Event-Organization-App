import { useState } from 'react';

function FestivalForm({ onFestivalCreated }) {
  const [naziv, setNaziv] = useState('');
  const [lokacija, setLokacija] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!naziv.trim() || !lokacija.trim()) {
      alert('Please fill in both the naziv and lokacija.');
      return;
    }

    const Festival = {
      naziv,
      lokacija,
    };

    try {
      const response = await fetch('http://localhost:7016/api/Festival', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Festival),
      });

      if (!response.ok) {
        throw new Error('Failed to create Festival');
      }

      const newFestival = await response.json();
      onFestivalCreated(newFestival);

      setNaziv('');
      setLokacija('');
      setYear('');
    } catch (error) {
      console.error('Error creating Festival:', error);
      alert('There was a problem creating the Festival.');
    }
  };

  return (
    <>
    <h2>Festivals</h2>
    <form onSubmit={handleSubmit}>
      <input value={naziv} onChange={(e) => setNaziv(e.target.value)} placeholder="Festival naziv" />
      <input value={lokacija} onChange={(e) => setLokacija(e.target.value)} placeholder="Festival lokacija" />
      <button type="submit">Add Festival</button>
    </form>
    </>
  );
}

export default FestivalForm;
