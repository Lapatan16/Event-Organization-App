import React from "react";

function ItemList({ items, onEdit, onDelete }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <strong>{item.ime} {item.prezime}</strong> – Indeks: {item.brojIndeksa}
          <button onClick={() => onEdit(item)}>Izmeni</button>
          <button onClick={() => onDelete(item.id)}>Obrisi</button>
        </li>
      ))}
    </ul>
  );
}

export default ItemList;
