import axios from "axios";
import { useEffect, useState } from "react";
import './NoviResurs.css';
import { API_URL } from "../services/config";

type Resource = {

  name: string;
  type: string;
  adress: string;
  city: string;
  contact: string;
  description: string;
};

const NoviResurs = () => {
  const [kategorije, setKategorije] = useState<string[]>([]);
  const [kategorija, setKategorija] = useState('');
  const [novaKategorija, setNovaKategorija] = useState('');
  const [koristiNovuKategoriju, setKoristiNovuKategoriju] = useState(false);

  const [naziv, setNaziv] = useState('');
  const [kontakt, setKontakt] = useState('');
  const [opis, setOpis] = useState('');
   const [grad, setGrad] = useState('');
    const [adresa, setAdresa] = useState('');

 const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

  useEffect(() => {
    axios.get<Resource[]>(`${API_URL}/api/Resource`)
      .then(res => {
        const types: string[] = [...new Set(res.data.map((r) => r.type))];
        setKategorije(types);
      })
      .catch(err => console.error("Greška prilikom dohvatanja kategorija:", err));
  }, []);

  const handleSubmit = async () => {
    const izabraniType = koristiNovuKategoriju ? novaKategorija.trim() : kategorija;

    if (!naziv || !izabraniType) {
      alert("Popuni naziv i kategoriju!");
      return;
    }
const noviResurs = {
  name: naziv,
  type: izabraniType,
  adress: adresa,
  city: grad,
  contact: kontakt,
  description: opis
};

console.log("Sending data:", noviResurs);
    try {
      await axios.post(`${API_URL}/api/Resource`, noviResurs);
      alert("Uspešno dodat resurs!");

      setNaziv('');
      setKategorija('');
      setNovaKategorija('');
      setKoristiNovuKategoriju(false);
      setAdresa('');
      setGrad('');
      setKontakt('');
      setOpis('');
    } catch (error) {
      console.error("Greška prilikom dodavanja:", error);
       if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);
        console.error("Axios error status:", error.response?.status);
        console.error("Axios error headers:", error.response?.headers);
      }
      alert("Došlo je do greške!");
    }
  };

  return (
    <div className="novi-resurs-container">
      <div className="leva-strana">
    <select
          value={koristiNovuKategoriju ? "nova" : kategorija}
          onChange={(e) => {
            const vrednost = e.target.value;
            if (vrednost === "nova") {
              setKoristiNovuKategoriju(true);
              setKategorija('');
            } else {
              setKoristiNovuKategoriju(false);
              setKategorija(vrednost);
            }
          }}
        >
          <option disabled value="">Odaberi kategoriju</option>
          {kategorije.map((k, i) => (
            <option key={i} value={k}>{k}</option>
          ))}
          <option value="nova">+ Dodaj novu kategoriju</option>
        </select>

        {koristiNovuKategoriju && (
          <input
            type="text"
            placeholder="Unesi novu kategoriju"
            value={novaKategorija}
            onChange={(e) => setNovaKategorija(e.target.value)}


          />
        )}

        <input
          type="text"
          placeholder="Naziv"
          value={naziv}
          onChange={(e) => setNaziv(capitalize(e.target.value))}

        />
      </div>

      <div className="sredina">
        
        <div className="kontakt">
          <label>Kontakt</label>
          <textarea
            rows={4}
            value={kontakt}
            onChange={(e) => setKontakt(capitalize(e.target.value))}

            placeholder="telefon/mejl..."
          />
        </div>
        <div className="adresa">
          <label>Adresa</label>
          <textarea
            rows={4}
            value={adresa}
            onChange={(e) => setAdresa(capitalize(e.target.value))}

            placeholder="Adresa..."
          />
        </div>
        <div className="grad">
          <label>Grad</label>
          <textarea
            rows={4}
            value={grad}
            onChange={(e) => setGrad(capitalize(e.target.value))}

            placeholder="Grad..."
          />
        </div>

        <div className="opis">
          <label>Deskripcija</label>
          <textarea
            rows={4}
            value={opis}
            onChange={(e) => setOpis(capitalize(e.target.value))}

            placeholder="Opis resursa"
          />
        </div>
      </div>

      <div className="dugme-kutija">
        <button onClick={handleSubmit}>Dodaj</button>
      </div>
    </div>
  );
};

export default NoviResurs;
