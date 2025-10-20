import { Dialog } from 'primereact/dialog';
import { useState, useEffect, useRef } from 'react'; // Dodato useRef
import type { Event } from '../types/Event';
import type { Location } from '../types/Location';

import './EditEventDialog.css';
import ImageUploader from '../components/ImageUploader';
import MapComponent from '../components/MapComponent';
import api from '../services/api';
import { API_URL } from '../services/config';


type Props = {
  visible: boolean;
  onHide: () => void;
  event: Event;
  onUpdate: (updatedEvent: Event) => void;
};

const EditEventDialog = ({ visible, onHide, event, onUpdate }: Props) => {
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [startDate, setStartDate] = useState(
    new Date(event.startDate).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(
    new Date(event.endDate).toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState(event.startTime || "");
  const [poster, setPoster] = useState<string | null>(event.poster || null);

  const [city, setCity] = useState(event.location?.city || "");
  const [address, setAddress] = useState(event.location?.address || "");

  const [location, setLocation] = useState<Location | null>(event.location || null);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  // const [cityError, setCityError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  // Dodate reference za svako polje sa greškom
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  // const cityRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (visible) {
      // Reset svih grešaka pri otvaranju
      setTitleError(null);
      setDescriptionError(null);
      // setCityError(null);
      setAddressError(null);
      setDateError(null);
    }
  }, [visible]);

  const handleLocationChange = (data: { lat: number; lng: number; address: string; city: string }) => {
    setLocation(data);
    setCity(data.city || "");
    setAddress(data.address || "");
  };

  const handleSave = async () => {
    let isValid = true;
    let firstInvalidFieldRef: React.RefObject<any> | null = null;

    // Prvi deo validacije
    if (!/^[A-Za-zČĆŽŠĐčćžšđ0-9\s.,'"-]{3,}$/.test(title.trim())) {
      setTitleError("Naziv mora imati bar 3 karaktera i sme sadržati slova/brojeve/razmak.");
      isValid = false;
      if (!firstInvalidFieldRef) firstInvalidFieldRef = titleRef;
    } else {
      setTitleError(null);
    }

    if (!/^.{10,}$/.test(description.trim())) {
      setDescriptionError("Opis mora imati bar 10 karaktera.");
      isValid = false;
      if (!firstInvalidFieldRef) firstInvalidFieldRef = descriptionRef;
    } else {
      setDescriptionError(null);
    }

    // if (!/^[A-Za-zČĆŽŠĐčćžšđ\s-]{2,}$/.test(city.trim())) {
    //   setCityError("Grad može sadržati samo slova/razmake i mora imati bar 2 karaktera.");
    //   isValid = false;
    //   if (!firstInvalidFieldRef) firstInvalidFieldRef = cityRef;
    // } else {
    //   setCityError(null);
    // }

    if (!/^[A-Za-zČĆŽŠĐčćžšđ0-9\s.,/-]{3,}$/.test(address.trim())) {
      setAddressError("Adresa može sadržati slova/brojeve i bar 3 karaktera.");
      isValid = false;
      if (!firstInvalidFieldRef) firstInvalidFieldRef = addressRef;
    } else {
      setAddressError(null);
    }

    // Validacija datuma
    const selectedStartDate = new Date(startDate);
    const selectedEndDate = new Date(endDate);
    const today = new Date(getTodayDateString());

    if (selectedStartDate < today) {
      setDateError("Datum početka ne može biti u prošlosti.");
      if (!firstInvalidFieldRef) firstInvalidFieldRef = startDateRef;
      isValid = false;
    } else if (selectedEndDate < today) {
      setDateError("Datum kraja ne može biti u prošlosti.");
      if (!firstInvalidFieldRef) firstInvalidFieldRef = endDateRef;
      isValid = false;
    } else if (selectedStartDate > selectedEndDate) {
      setDateError("Datum početka ne može biti posle datuma kraja.");
      if (!firstInvalidFieldRef) firstInvalidFieldRef = startDateRef;
      isValid = false;
    } else {
      setDateError(null);
    }

    // 🚨 VAŽNO: skroluj i fokusiraj prvo neispravno polje ako validacija ne prođe
    if (!isValid && firstInvalidFieldRef?.current) {
      firstInvalidFieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalidFieldRef.current.focus();
      return;
    }

    const updatedEvent: Event = {
      ...event,
      title: title.trim(),
      description: description.trim(),
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      startTime,
      poster: poster ?? "",
      location: {
        ...(location ?? event.location),
        city: city.trim(),
        address: address.trim(),
      } as Location,
    };

    try {
    await api.put(`${API_URL}/api/Event/${event.id}`, updatedEvent);
    onUpdate(updatedEvent);
    onHide();
  } catch (err) {
    console.error("Greška pri ažuriranju događaja", err);
  }
  };

  return (
    <Dialog header="Izmeni događaj" visible={visible} style={{ width: '50vw' }} onHide={onHide}>
      <div className="p-fluid">
        <label>Naziv</label>
        <input
          ref={titleRef} // Dodat ref
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={titleError ? "p-invalid" : ""}
        />
        {titleError && <small className="p-error">{titleError}</small>}

        <ImageUploader onImageUpload={setPoster} imageData={poster} label={event.title} />

        <label>Opis</label>
        <textarea
          ref={descriptionRef} // Dodat ref
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={descriptionError ? "p-invalid" : ""}
        />
        {descriptionError && <small className="p-error">{descriptionError}</small>}

        <label>Datum početka</label>
        <input
          ref={startDateRef} // Dodat ref
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={getTodayDateString()}
        />

        <label>Datum kraja</label>
        <input
          ref={endDateRef} // Dodat ref
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || getTodayDateString()}
        />

        <label>Vreme početka</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        {/* <label>Grad</label>
        <input
          ref={cityRef} // Dodat ref
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={cityError ? "p-invalid" : ""}
        />
        {cityError && <small className="p-error">{cityError}</small>}

        <label>Adresa</label>
        <input
          ref={addressRef} // Dodat ref
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={addressError ? "p-invalid" : ""}
        /> */}
        {addressError && <small className="p-error">{addressError}</small>}

        {dateError && <p style={{ color: 'red', marginTop: '0.5rem' }}>{dateError}</p>}

        <MapComponent
          onLocationChange={handleLocationChange}
          location={event.location}
        />

        <button onClick={handleSave} style={{ marginTop: "1rem" }}>
          Sačuvaj izmene
        </button>
      </div>
    </Dialog>
  );
};

export default EditEventDialog;