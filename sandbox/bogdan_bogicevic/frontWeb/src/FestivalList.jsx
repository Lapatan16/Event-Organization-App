function FestivalList({ Festivali, refresh }) {
  const handleDelete = async (id) => {
    await fetch(`http://localhost:7016/api/Festival/${id}`, { method: 'DELETE' });
    refresh();
  };

  const handleUpdate = async (Festival) => {
    const updatedNaziv = prompt('New naziv:', Festival.naziv);
    if (updatedNaziv === null) return;

    const updatedLokacija = prompt('New lokacija:', Festival.lokacija);
    if (updatedLokacija === null) return;

    await fetch(`http://localhost:7016/api/Festival/${Festival.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...Festival,
        naziv: updatedNaziv,
        lokacija: updatedLokacija
      }),
    });

    refresh();
  };

  return (
    <div id="FestivalList">
      <ul>
      {Festivali.map(Festival => (
        <li key={Festival.id}>
          <div className="list-wrapper">
            <span>
              {Festival.naziv} - {Festival.lokacija}
            </span>
            <span>
              <button className="list-button" onClick={() => handleUpdate(Festival)}>Edit</button>
              <button className="list-button delete-button" onClick={() => handleDelete(Festival.id)}>Delete</button>
            </span>
          </div>
        </li>
      ))}
      </ul>
    </div>
  );
}

export default FestivalList;