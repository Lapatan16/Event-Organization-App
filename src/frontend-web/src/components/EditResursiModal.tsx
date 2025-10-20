import { useState, useEffect } from "react";
import "./EditResursiModal.css"; 

export type Resource = {
  id: string;
  name: string;
  type: string;
  adress: string;
  city: string;
  contact: string;
  description: string;
  createdAt: string;
};

type Props = {
 visible: boolean;
  initialData: Resource | null;
  onClose: () => void;
  onSave: (updated: Resource) => void;
};

const EditResursiModal = ({ visible, initialData, onClose, onSave }: Props) => {
 if (!visible || !initialData) return null;
  const [formData, setFormData] = useState<Resource>(initialData as Resource);

    

useEffect(() => {
  if (initialData) {
    setFormData(initialData);
  }
}, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
  const updatedData = {
    ...formData,
    date: new Date().toISOString(),
  };

  onSave(updatedData);
  onClose();
};


  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Izmeni resurs</h2>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Ime" />
        <input name="type" value={formData.type} onChange={handleChange} placeholder="Kategorija" />
        <input name="adress" value={formData.adress} onChange={handleChange} placeholder="Adresa" />
        <input name="city" value={formData.city} onChange={handleChange} placeholder="Grad" />
        <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Kontakt" />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Opis" />
        <div className="modal-buttons">
          <button onClick={handleSubmit}>Sačuvaj</button>
          <button onClick={onClose}>Otkaži</button>
        </div>
      </div>
    </div>
  );
};

export default EditResursiModal;
