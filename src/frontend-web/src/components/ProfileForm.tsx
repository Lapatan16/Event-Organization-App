import React, { useState, useRef } from "react";
import { useUser } from "../hooks/UserContext";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";

import "./ProfileForm.css";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { API_URL } from "../services/config";

type PodaciKorisnika = {
  ime: string;
  prezime: string;
  email: string;
  lozinka: string;
  image: string;
};

const ProfileForm = () => {
  const { user, loading, setUser } = useUser();
  const [mogucaIzmena, setMogucaIzmena] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toast = useRef<Toast>(null);

  if (loading) return <h2>Učitavanje podataka</h2>;

  const [podaci] = useState<PodaciKorisnika>({
    ime: user?.firstName ?? "",
    prezime: user?.lastName ?? "",
    email: user?.email ?? "",
    lozinka: "********",
    image: "",
  });

  const [ime, setIme] = useState(podaci.ime);
  const [prezime, setPrezime] = useState(podaci.prezime);
  const [email, setEmail] = useState(podaci.email);
  const wasEmailChanged = user?.email !== email;

  const [previewImage] = useState<string | null>(null);

  const validateForm = () => {
    setErrorMessage(null); 
    const emailRegex = /^\S+@\S+\.\S+$/;
    const imeRegex = /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,19}$/;
    const prezimeRegex = /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,29}$/;

    if (!ime.trim() || !prezime.trim() || !email.trim()) {
      setErrorMessage("Sva polja moraju biti popunjena.");
      return false;
    }

    if (!emailRegex.test(email)) {
      setErrorMessage("Molimo Vas unesite ispravnu email adresu.");
      return false;
    }

    if (!imeRegex.test(ime)) {
      setErrorMessage("Molimo Vas unesite ispravno ime.");
      return false;
    }

    if (!prezimeRegex.test(prezime)) {
      setErrorMessage("Molimo Vas unesite ispravno prezime.");
      return false;
    }

    return true;
  };

  const handleNeSacuvaj = () => {
    setMogucaIzmena(false);
    setIme(podaci.ime);
    setPrezime(podaci.prezime);
    setEmail(podaci.email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const updatedUser = {
      id: user?.id,
      firstName: ime,
      lastName: prezime,
      email: email,
    };

    try {
      const res = await fetchWithAuth(`${API_URL}/api/User`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        if (wasEmailChanged) {
          toast.current?.show({
        severity: "info",
        summary: "Email promenjen",
        detail: "Vaša email adresa je promenjena. Molimo Vas da se ponovo prijavite.",
        life: 4000, // 2 seconds
    });

    setTimeout(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        window.location.href = "/login";
    }, 2100);
        } else {
          const refreshed = await fetchWithAuth(`${API_URL}/api/User/me`);
          if (refreshed.ok) {
            const data = await refreshed.json();
            setUser(data);
            setMogucaIzmena(false);
            setErrorMessage(null);
          }
        }
      } else {
        if (res.status === 409) {
          setErrorMessage("Ova email adresa je već zauzeta.");
        } else {
          console.error("User update failed.");
          setMogucaIzmena(false);
        }
      }
    } catch (error) {
      console.error("Unexpected error during update", error);
      setErrorMessage("Došlo je do greške na mreži. Pokušajte ponovo.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Toast ref={toast} />
      <h1>Moj Profil</h1>
      <hr />

      <div className="profile-circle-div">
        {previewImage ? (
          <img src={previewImage} alt="Profilna slika" className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar-fallback">{ime ? ime[0].toUpperCase() : "?"}</div>
        )}
      </div>

      <div className="profile-inputs-div">
        <div className="profile-left-div">
          <h2>Informacije</h2>
          {errorMessage && <Message severity="error" text={errorMessage} />}
          <div>
            <label htmlFor="ime">Ime</label>
            <br />
            <InputText
              id="ime"
              value={ime}
              onChange={(e) => setIme(e.target.value)}
              disabled={!mogucaIzmena}
              invalid={!/^[A-ZŠĐŽČĆ][a-zšđžčć]{1,19}$/.test(ime)}
            />
          </div>
          <div>
            <label htmlFor="prezime">Prezime</label>
            <br />
            <InputText
              id="prezime"
              value={prezime}
              onChange={(e) => setPrezime(e.target.value)}
              disabled={!mogucaIzmena}
              invalid={!/^[A-ZŠĐŽČĆ][a-zšđžčć]{1,29}$/.test(prezime)}
            />
          </div>
          <div>
            <label htmlFor="email">E-mail adresa</label>
            <br />
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!mogucaIzmena}
              invalid={!/^\S+@\S+\.\S+$/.test(email)}
            />
          </div>
        </div>
      </div>

      <div className="profile-submit-div">
        {!mogucaIzmena && (
          <div>
            <Button
              className="izmeni-btn"
              label="Izmeni"
              icon="pi pi-user-edit"
              type="button"
              onClick={() => setMogucaIzmena(true)}
            />
          </div>
        )}
        {mogucaIzmena && (
          <>
            <div className="profile-submit-left">
              <Button
                label="Izađi bez promene"
                icon="pi pi-times"
                type="button"
                onClick={() => {
                  handleNeSacuvaj();
                  setErrorMessage(null);
                }}
              />
            </div>
            <div className="profile-submit-right">
              <Button label="Sačuvaj promene" icon="pi pi-check" type="submit" />
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default ProfileForm;
