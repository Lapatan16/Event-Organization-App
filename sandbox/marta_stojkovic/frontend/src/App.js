import React, { useState } from "react";
import ItemForm from "./Form";
import ItemList from "./List";

function App() {
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

  const addItem = (item) => {
    setItems([...items, { id: Date.now(), ...item }]);
  };

  const updateItem = (updatedItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setCurrentItem(null);
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1>Studenti</h1>
      <ItemForm
        onSubmit={currentItem ? updateItem : addItem}
        currentItem={currentItem}
      />
      <ItemList
        items={items}
        onEdit={setCurrentItem}
        onDelete={deleteItem}
      />
    </div>
  );
}

export default App;