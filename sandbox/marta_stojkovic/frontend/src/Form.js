import React, { useState, useEffect } from "react";

function ItemForm({ onSubmit, currentItem }) {
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [brojIndeksa, setBrojIndeksa] = useState("");

  useEffect(() => {
    if (currentItem) {
      setIme(currentItem.ime || "");
      setPrezime(currentItem.prezime || "");
      setBrojIndeksa(currentItem.brojIndeksa || "");
    }
  }, [currentItem]);

    const handleSubmit = (e) => {
    e.preventDefault();
    if (!ime.trim() || !prezime.trim() || !brojIndeksa.trim()) return;

    onSubmit({
      id: currentItem?.id || null,
      ime,
      prezime,
      brojIndeksa,
    });

     setIme("");
    setPrezime("");
    setBrojIndeksa("");
  };
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Ime"
        value={ime}
        onChange={(e) => setIme(e.target.value)}
      />
      <input
        type="text"
        placeholder="Prezime"
        value={prezime}
        onChange={(e) => setPrezime(e.target.value)}
      />
      <input
        type="text"
        placeholder="Broj indeksa"
        value={brojIndeksa}
        onChange={(e) => setBrojIndeksa(e.target.value)}
      />
      <button type="submit">{currentItem ? "Izmeni" : "Dodaj"}</button>
    </form>
  );
}

export default ItemForm;
