import { FloatLabel } from 'primereact/floatlabel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link, Navigate } from 'react-router-dom';
import { Password } from 'primereact/password';
import { useForm, Controller } from 'react-hook-form';
import { API_URL } from '../services/config';
import { SelectButton } from 'primereact/selectbutton';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';

import './LoginForm.css';
import { useState } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';

const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });

  const passwordValue = watch('lozinka');
  const selectedOption = watch('roleSelection');
  const [redirect, setRedirect] = useState(false);
  const options = ['Organizator', 'Dobavljač'];
  const toast = useRef<Toast>(null);

  const tipOptions = [
    { label: 'Prostor', value: 'prostor' },
    { label: 'Oprema', value: 'oprema' },
    { label: 'Hrana', value: 'hrana' },
    { label: 'Transport', value: 'transport'},
    { label: 'Osoblje', value: 'osoblje'},
    { label: 'Obezbeđenje', value: 'obezbeđenje'},
    { label: 'Reklamiranje', value: 'reklamiranje'},
  ];

  const showError = (summary: string, detail: string) => {
      toast.current?.show({severity:'error', summary: summary, detail:detail, life: 3000});
  }

  const onSubmit = async (data: any) => {
    try {
      const isSupplier = data.roleSelection === 'Dobavljač';

      // Construct registration payload
      const payload: any = {
        email: data.email,
        password: data.lozinka,
        firstName: data.ime,
        lastName: data.prezime,
        phone: '', // Optional: set if needed in user account
        role: isSupplier ? 'Supplier' : 'Admin',
      };

      if (isSupplier) {
        payload.name = data.naziv;
        payload.type = data.tip;
      }

      // First: register the user
      const response = await fetch(`${API_URL}/api/Auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        console.error('Registration failed:', err);
        alert(`Greška: ${err.message || 'Registracija nije uspela'}`);
        return;
      }

      const result = await response.json();

      // If Dobavljač, create supplier entry
      if (isSupplier) {
        const supplierPayload = {
          supplierId: result.id, // Assuming API returns created user's id
          name: data.naziv,
          type: data.tip,
          phone: data.telefon,
          description: data.opis,
        };

        const supplierRes = await fetch(`${API_URL}/api/Supplier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierPayload),
        });

        if (!supplierRes.ok) {
          const err = await supplierRes.json();
          console.error('Supplier creation failed:', err);
          showError("Greška pri kreiranju dobavljača", "");
          // alert(`Greška pri kreiranju dobavljača: ${err.message || 'Pokušajte ponovo.'}`);
          return;
        }

        console.log('Dobavljač dodat:', await supplierRes.json());
      }

      // alert('Uspešna registracija!');
      setRedirect(true);
    } catch (error) {
      console.error('Greška pri registraciji:', error);
      // alert('Greška pri povezivanju sa serverom.');
      showError("Greška pri kreiranju dobavljača", "");
    }
  };


  if (redirect) return <Navigate to="/login" />;

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)}>

      <Toast ref={toast} />

      {/* SelectButton for role */}
      <div className="register-options">
        <Controller
          name="roleSelection"
          control={control}
          defaultValue="Organizator"
          render={({ field }) => (
            <SelectButton
              {...field}
              options={options}
              onChange={(e) => field.onChange(e.value)}
            />
          )}
        />
      </div>

      <div className='register-main-div'>
      
      <div className='register-left'>

      {/* Ime */}
      <div className="field">
        <Controller
          name="ime"
          control={control}
          defaultValue=""
          rules={{
            required: 'Ime je obavezno',
            pattern: {
              value: /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,19}$/,
              message: 'Ime mora početi velikim slovom',
            },
          }}
          render={({ field }) => (
            <FloatLabel>
              <InputText
                id="ime"
                {...field}
                className={`input-text ${errors.ime ? 'p-invalid' : ''}`}
              />
              <label htmlFor="ime">Ime</label>
            </FloatLabel>
          )}
        />
        {typeof errors.ime?.message === 'string' && (
          <small className="p-error">{errors.ime.message}</small>
        )}
      </div>

      {/* Prezime */}
      <div className="field">
        <Controller
          name="prezime"
          control={control}
          defaultValue=""
          rules={{
            required: 'Prezime je obavezno',
            pattern: {
              value: /^[A-ZŠĐŽČĆ][a-zšđžčć]{1,29}$/,
              message: 'Prezime mora početi velikim slovom',
            },
          }}
          render={({ field }) => (
            <FloatLabel>
              <InputText
                id="prezime"
                {...field}
                className={`input-text ${errors.prezime ? 'p-invalid' : ''}`}
              />
              <label htmlFor="prezime">Prezime</label>
            </FloatLabel>
          )}
        />
        {typeof errors.prezime?.message === 'string' && (
          <small className="p-error">{errors.prezime.message}</small>
        )}
      </div>

      {/* Email */}
      <div className="field">
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{
            required: 'Email je obavezan',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Neispravan email format',
            },
          }}
          render={({ field }) => (
            <FloatLabel>
              <InputText
                id="email"
                {...field}
                className={`input-text ${errors.email ? 'p-invalid' : ''}`}
              />
              <label htmlFor="email">Email</label>
            </FloatLabel>
          )}
        />
        {typeof errors.email?.message === 'string' && (
          <small className="p-error">{errors.email.message}</small>
        )}
      </div>

      {/* Lozinka */}
      <div className="field">
        <Controller
          name="lozinka"
          control={control}
          defaultValue=""
          rules={{
            required: 'Lozinka je obavezna',
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_\-]{8,}$/,
              message: '',
            },
          }}
          render={({ field }) => {
            const header = <h6>Unesi lozinku</h6>;
            const footer = (
              <>
                <p className="p-mt-2">Zahtevi:</p>
                <ul className="p-pl-2 p-text-sm">
                  <li>Najmanje 8 karaktera</li>
                  <li>Bar jedno veliko slovo</li>
                  <li>Bar jedna cifra</li>
                  <li>Poželjno: specijalan znak (npr. @, !, %...)</li>
                </ul>
              </>
            );

            return (
              <FloatLabel>
                <Password
                  id="lozinka"
                  {...field}
                  toggleMask
                  feedback={true}
                  header={header}
                  footer={footer}
                  promptLabel="Unesite lozinku"
                  weakLabel="Slaba"
                  mediumLabel="Srednja"
                  strongLabel="Jaka"
                  className={`input-text w-full ${errors.lozinka ? 'p-invalid' : ''}`}
                  style={{ display: 'block', width: '100%' }}
                  inputStyle={{ width: '100%' }}
                />
                <label htmlFor="lozinka">Lozinka</label>
              </FloatLabel>
            );
          }}
        />
        <div className="error-wrapper">
          {typeof errors.lozinka?.message === 'string' && (
            <small className="p-error">{errors.lozinka.message}</small>
          )}
        </div>
      </div>

      {/* Potvrda lozinke */}
      <div className="field">
        <Controller
          name="potvrdaLozinke"
          control={control}
          defaultValue=""
          rules={{
            required: 'Potvrda lozinke je obavezna',
            validate: (value) =>
              value === passwordValue || 'Lozinke se ne poklapaju',
          }}
          render={({ field }) => (
            <FloatLabel>
              <Password
                id="potvrdaLozinke"
                {...field}
                feedback={false}
                toggleMask
                className={`input-text w-full ${errors.potvrdaLozinke ? 'p-invalid' : ''}`}
                style={{ display: 'block', width: '100%' }}
                inputStyle={{ width: '100%' }}
              />
              <label htmlFor="potvrdaLozinke">Potvrdi lozinku</label>
            </FloatLabel>
          )}
        />
        <div className="error-wrapper">
          {typeof errors.potvrdaLozinke?.message === 'string' && (
            <small className="p-error">{errors.potvrdaLozinke.message}</small>
          )}
        </div>
      </div>

      </div>


      {selectedOption === 'Dobavljač' &&(
        <div className='register-right'>

      {/* Naziv (only if Dobavljač) */}
      {selectedOption === 'Dobavljač' && (
        <div className="field">
          <Controller
            name="naziv"
            control={control}
            defaultValue=""
            rules={{
              required: 'Naziv firme je obavezan',
              pattern: {
                value: /^[A-ZŠĐŽČĆ][a-zA-ZšđžčćŠĐŽČĆ\s]{1,49}$/,
                message: 'Naziv firme mora početi velikim slovom',
              },
            }}
            render={({ field }) => (
              <FloatLabel>
                <InputText
                  id="naziv"
                  {...field}
                  className={`input-text ${errors.naziv ? 'p-invalid' : ''}`}
                />
                <label htmlFor="naziv">Naziv firme</label>
              </FloatLabel>
            )}
          />
          {typeof errors.naziv?.message === 'string' && (
          <small className="p-error">{errors.naziv.message}</small>
        )}
        </div>
      )}

      {/* Tip (dropdown, only for supplier) */}
      {selectedOption === 'Dobavljač' && (
        <div className="field">
          <Controller
            name="tip"
            control={control}
            defaultValue=""
            rules={{ required: 'Tip je obavezan' }}
            render={({ field }) => (
              <FloatLabel>
                <Dropdown
                  id="tip"
                  {...field}
                  options={tipOptions}
                  placeholder="Izaberite tip"
                  className={errors.tip ? 'p-invalid' : ''}
                />
                <label htmlFor="tip">Tip</label>
              </FloatLabel>
            )}
          />
          {typeof errors.tip?.message === 'string' && (
          <small className="p-error">{errors.tip.message}</small>
        )}
        </div>
      )}

      {/* Telefon */}
      <div className="field">
        <Controller
          name="telefon"
          control={control}
          defaultValue=""
          rules={{
            required: 'Telefon je obavezan',
            pattern: {
              value: /^06[0-9]{7,8}$/,
              message: 'Neispravan format',
            },
          }}
          render={({ field }) => (
            <FloatLabel>
              <InputText
                id="telefon"
                {...field}
                className={`input-text ${errors.telefon ? 'p-invalid' : ''}`}
              />
              <label htmlFor="telefon">Kontakt</label>
            </FloatLabel>
          )}
        />
        {typeof errors.telefon?.message === 'string' && (
          <small className="p-error">{errors.telefon.message}</small>
        )}
      </div>

      {/* Opis (textarea, only for Dobavljač) */}
      {selectedOption === 'Dobavljač' && (
        <div className="field opis-firme">
          <Controller
            name="opis"
            control={control}
            defaultValue=""
            rules={{
              required: 'Opis je obavezan',
              minLength: {
                value: 10,
                message: 'Opis mora imati najmanje 10 karaktera',
              },
            }}
            render={({ field }) => (
              <FloatLabel>
                <InputTextarea
                  id="opis"
                  {...field}
                  rows={4}
                  style={{ textTransform: 'none' }}
                  className={`input-textarea ${errors.opis ? 'p-invalid' : ''}`}
                />
                <label htmlFor="opis">Opis firme</label>
              </FloatLabel>
            )}
          />
          {typeof errors.opis?.message === 'string' && (
            <small className="p-error">{errors.opis.message}</small>
          )}
        </div>
      )}


      </div>

      )}
      
      </div>


      <Button type="submit" label="Registruj se" className='reg-dugme'/>
      <Link className="link" to="/login">
        Već imate nalog? Prijavite se!
      </Link>
    </form>
  );
};

export default RegisterForm;
