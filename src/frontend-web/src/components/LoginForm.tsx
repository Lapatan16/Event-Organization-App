import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
// import { Dialog } from 'primereact/dialog'; // << UVEZENO
import { useUser } from '../hooks/UserContext';
import { API_URL } from "../services/config";
import { Toast } from 'primereact/toast';
import React, { useRef } from 'react';

import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");
//   const [error, setError] = useState(""); // << DODATO
//   const [showDialog, setShowDialog] = useState(false); // << DODATO
  const { setUser } = useUser();
  const navigate = useNavigate();
    const toast = useRef<Toast>(null);


    const showError = (summary: string, detail: string) => {
        toast.current?.show({severity:'error', summary: summary, detail:detail, life: 3000, closable: false});
    }

    const validate = () =>
    {
        if(email === '' || password === '')
            return false;
        return true;
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validate())
    {
        showError("Neuspešna prijava", "Nisu sva polja popunjena");
        return;
    }
    
    const loginResponse = await fetch(`${API_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResponse.ok) {
        showError('Neuspešna prijava', 'Korisnik sa datim kredencijalima ne postoji');
      console.error("Login failed");
      
      return;
    }

    const data = await loginResponse.json();

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.userId || data.id);

    const userResponse = await fetch(`${API_URL}/api/User/me`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.accessToken}`,
      },
    });

    const user = await userResponse.json();
    setUser(user);    

    if (user.role === "Admin") {
        navigate("/dashboard");
    } else if (user.role === "Supplier") {
        navigate("/supplier/dashboard");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
        <Toast ref={toast} />
      <FloatLabel className="float-label first-elem">
        <InputText
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          
        />
        <label htmlFor="email">E-mail adresa</label>
      </FloatLabel>

      <FloatLabel className="float-label">
        <Password
          feedback={false}
          toggleMask
          id="password"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          
          style={{ display: 'block', width: '100%' }}
          inputStyle={{ width: '100%' }}
          className="w-full"
        />
        <label htmlFor="password">Lozinka</label>
      </FloatLabel>

      <Button label="Prijavi se" type="submit" />
      <Link className="link" to="/register">Nemate nalog? Registrujte se!</Link>

      {/* <Dialog header="Greška prilikom prijave" visible={showDialog} onHide={() => setShowDialog(false)} style={{ width: '30vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}>
          <div className="p-text-center dialog-content-wrapper">
              <p>{error}</p>
              <Button label="OK" onClick={() => setShowDialog(false)} className="p-button-text" autoFocus />
          </div>
      </Dialog> */}
    </form>
  );
};

export default LoginForm;