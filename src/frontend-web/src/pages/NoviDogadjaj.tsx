import { useRef } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Editor } from 'primereact/editor';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import TicketList from '../components/TicketList';
import ImageUploader from '../components/ImageUploader';
import ReadOnlyMap from '../components/ReadOnlyMap';
import EventImageCard from '../components/EventImageCard';

import { ConfigProvider, TimePicker } from 'antd';
import { Dayjs } from 'dayjs';

import './NoviDogadjaj.css'
import 'primeicons/primeicons.css';
import MapComponent from '../components/MapComponent';
import TimeframeList from '../components/TimeFrameList';
import { useUser } from '../hooks/UserContext';
import SafeDescription from '../components/SafeDescription';

import defaultRadionica from '../assets/event.jpg';
import defaultKoncert from '../assets/defaultKoncert.jpg';
import defaultFilmskoVece from '../assets/defaultFilmskoVece.jpg';
import defaultDrugo from '../assets/defaultDrugo.jpg';
import type { Ticket } from '../types/Ticket';
import type { Location } from '../types/Location';
import { API_URL } from '../services/config';
import api from '../services/api';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';


type DogadjajVrsta = {
  name: string;
  code: string;
};

type Timeframe = {
  id: string;
  naziv: string;
  startDate: Date | null;
  startTime: Date | null;
  endDate: Date | null;
  endTime: Date | null;
};

const NoviDogadjaj = () =>
{
    const { user } = useUser();
    const stepperRef = useRef<any>(null);
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    //Page 1
    const [naziv, setNaziv] = useState('');
    const [deskripcija, setDeskripcija] = useState('');
    const [izabranaVrsta, setIzabranaVrsta] = useState<DogadjajVrsta | null>(null);
    const [image, setImage] = useState<string | null>(null);

    const validateNaziv = () =>
    {
        return /^(?=.{1,40}$)[A-Z][a-zA-Z]*(?: [a-zA-Z]*)*$/.test(naziv);
    }

    async function getBase64FromUrl(url: string): Promise<string> {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const validacijaPrvaStrana = async (): Promise<boolean> => {
        if (!naziv) 
        {
            showError("Greška", 'Naziv ne može biti prazan.');
            return false;
        }
        else if(!deskripcija)
        {
            showError("Greška", "Deskripcija ne može biti prazna.")
            return false;
        }
        else if(!izabranaVrsta)
        {
            showError("Greška", "Potrebno je izabrati vrstu događaja.")
            return false;
        }

        if(!validateNaziv())
        {
            showError("Greška", 'Naziv mora početi velikim slovom i ne sme biti duže od 40 karaktera');
            return false;
        }

        if (!image) {
            let url = '';
            if (izabranaVrsta.name === "Koncert") url = defaultKoncert;
            else if (izabranaVrsta.name === "Radionica") url = defaultRadionica;
            else if (izabranaVrsta.name === "Filmsko veče") url = defaultFilmskoVece;
            else url = defaultDrugo;

            const base64 = await getBase64FromUrl(url);
            setImage(base64);
            return true;
        }
        return true;
    };


    //page 2
    const [dates, setDates] = useState<(Date | null)[] | null>(null);
    const startDate = dates?.[0] ?? null;
    const endDate = dates?.[1] ?? null;
    const [startTime, setStartTime] = useState<Dayjs | null>(null);
    const daysActive = Math.ceil(((endDate?.getTime() ?? 0) - (startDate?.getTime() ?? 0)) / (1000 * 60 * 60 * 24));

    const [timeframes, setTimeframes] = useState<Timeframe[]>([]);

    

    // const customLocale = {
    // ...enUS,
    // TimePicker: {
    //     ...enUS.TimePicker,
    //     placeholder: 'Izaberi vreme',
    //     now: 'Sada',
    //     ok: 'OK',
    //     },
    // };

    const [location, setLocation] = useState<Location | null>(null);

    const handleLocationChange = (data: { lat: number; lng: number; address: string, city: string }) => {
        setLocation(data);
    };
    
    const vrsteDogadjaja: DogadjajVrsta[] = [
        {
            name: 'Koncert',
            code: 'KO'
        },
        {
            name: 'Radionica',
            code: 'RA'
        },
        {
            name: 'Filmsko veče',
            code: 'FIV'
        },
        {
            name: 'Drugo',
            code: 'DR'
        },
    ];

    const validacijaDrugaStrana = () => 
    {
        if (!startDate || !endDate) 
        {
            showError("Greška", 'Izaberite datum početka i završetka događaja pre nego što nastavite.');
            return false;
        }
        else if(!startTime)
        {
            showError("Greška", 'Izaberite vreme početka događaja pre nego što nastavite.');
            return false;
        }
        else if(!location)
        {
            showError("Greška", 'Izaberite lokaciju događaja pre nego što nastavite.');
            return false;
        }
        return true;
    };

    //Page 3

    const [tickets, setTickets] = useState<Ticket[]>([]);

    // const addTicket = (type: 'paid' | 'free' | 'donation') => {
    //     const price = type === 'free' ? 0 : 1;
    //     setTickets(prev => [
    //     ...prev,
    //     { id: crypto.randomUUID(), name: '', quantity: 0, price, time: new Date().getTime(), sold: 0}
    //     ]);
    // };

    addLocale('custom', {
        firstDayOfWeek: 1, // 0 = Nedelja, 1 = Ponedeljak
        dayNames: ['Nedelja', 'Ponedeljak', 'Utorak', 'Sreda', 'Četvrtak', 'Petak', 'Subota'],
        dayNamesShort: ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub'],
        dayNamesMin: ['Ne','Po','Ut','Sr','Če','Pe','Su'],
        monthNames: ['Januar','Februar','Mart','April','May','Jun','Jul','Avgust','Septembar','Oktobar','Novembar','Decembar'],
        monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec'],
        today: 'Danas',
        clear: 'Očisti'
    });

    const validacijaTrecaStrana = () => 
    {        
        if (tickets.length == 0) 
        {
            showError("Greška", 'Mora postojati bar jedna ulaznica.');
            return false;
        }
        else
        {
            for(let i = 0; i < tickets.length; i++)
            {                
                if(!tickets[i].name)
                {
                    showError("Greška", 'Ulaznica mora sadržati naziv.');
                    return false;
                }
                else if(!/^[A-Z]{1}[a-zA-Z]{1,14}$/.test(tickets[i].name))
                {
                    showError("Greška", 'Naziv ulaznice mora početi velikim slovom i ne sme biti duže od 15 karaktera.');
                    return false;
                }
                if(!tickets[i].quantity)
                {
                    showError("Greška", 'Količina ne može biti 0.');
                    return false;
                }
            }
            return true;
        }
    }

    const handleSubmit = async (e: React.FormEvent) =>
    {
        e.preventDefault();
        const fixedTickets = tickets.map(({ id, ...rest }) => ({
            ...rest,
            time: rest.time.toString(),
            }));        

        try {
            await api.post(`${API_URL}/api/Event`, {
                organizerId: user?.id,
                title: naziv,
                description: new DOMParser().parseFromString(deskripcija, 'text/html').body.innerText,
                type: izabranaVrsta?.name ?? '',
                contact: 'kontakt',
                visibility: "Javni",
                poster: image,
                startDate: startDate,
                endDate: endDate,
                startTime: startTime?.format('HH:mm'),
                location: location,
                tickets: fixedTickets,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'draft',
            });

            } catch (err: any) {
            if (err.response) {
                console.error('Failed to create event:', err.response.data);
            } else {
                console.error('Unexpected error creating event:', err.message);
            }
            }


        navigate('/dogadjaji');
    }

    const showError = (summary: string, detail: string) => {
        toast.current?.show({severity:'error', summary: summary, detail:detail, life: 3000, closable: false});
    }

    return(
        <>
            <Toast ref={toast} />
            <form onSubmit={handleSubmit}>

            <Stepper ref={stepperRef} style={{ flexBasis: '50rem', padding: '0 1rem' }} linear>

            {/*Page 1*/}
                <StepperPanel header="Osnovne Informacije">
                    <div className='novi-dogadjaj-content-div'>
                        <h2>Osnovne informacije o događaju</h2>
                        <hr />

                        <div className='novi-dogadjaj-two-items'>
                            <div className='novi-dogadjaj-input-div'>
                                <label htmlFor="naziv">Unesite naziv događaja <span>*</span></label>
                                <InputText value={naziv} onChange={(e) => setNaziv(e.target.value)} required id='naziv' invalid={naziv != '' && !validateNaziv()}/>
                            </div>

                            <div>
                                <label htmlFor="dropDownVrsta">Izaberite vrstu događaja <span>*</span></label>
                                <Dropdown   
                                    id='dropDownVrsta'
                                    value={izabranaVrsta} 
                                    onChange={(e) => setIzabranaVrsta(e.value)} 
                                    options={vrsteDogadjaja} 
                                    optionLabel="name" 
                                    placeholder="Vrsta događaja" 
                                    // className="w-full md:w-14rem" 
                                    checkmark={true} 
                                    highlightOnSelect={false} 
                                />
                            </div>
                        </div>

                        <div className='novi-dogadjaj-input-div'>
                            <label htmlFor="">Opišite događaj <span>*</span></label>
                            <Editor required value={deskripcija} onTextChange={(e) => setDeskripcija(e.htmlValue ?? '')} style={{ height: '320px' }} />
                        </div>

                        <div className='novi-dogadjaj-input-div novi-dogadjaj-dve-kolone'>
                            <div>
                                <ImageUploader onImageUpload={setImage} imageData={image} label='Poster'/>
                            </div>
                            
                        </div>

                        <div className='novi-dogadjaj-next-button-div'>
                            <Button type='button' label="Dalje" icon="pi pi-arrow-right" iconPos="right" onClick={async () => {
                                const isValid = await validacijaPrvaStrana();
                                if (isValid) {
                                    stepperRef.current.nextCallback();
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }} />
                        </div>

                        
                    </div>
                </StepperPanel>

            {/*Page 2*/}
                <StepperPanel header="Vreme i Lokacija">
                    <div className='novi-dogadjaj-content-div'>
                        <h2>Vreme i lokacija</h2>
                        <hr />
                        <div className='novi-dogadjaj-kalendar'>
                            <div className='novi-dogadjaj-kalendar-div triple'>
                                <h3>Datum <span>*</span></h3>
                                <Tooltip target=".calendar-input" content="Izaberite početni datum, nakon toga izaberite krajnji datum" />
                                <Calendar 
                                    locale='custom'
                                    value={dates} 
                                    onChange={(e) => setDates(e.value ?? null)} 
                                    selectionMode="range" 
                                    readOnlyInput 
                                    hideOnRangeSelection
                                    required
                                    showIcon
                                    className='calendar calendar-input'
                                    minDate={new Date()}
                                    
                                />
                            </div>

                            <div className='triple'>
                                <h3>Vreme Početka <span>*</span></h3>
                                <ConfigProvider prefixCls="custom-ant">
                                    <TimePicker
                                        value={startTime}
                                        onChange={(time) => setStartTime(time)}
                                        format="HH:mm"
                                        placeholder=""
                                        suffixIcon={
                                            <div className="custom-icon-wrapper">
                                                <i className="pi pi-clock"></i>
                                            </div>
                                        }
                                        required
                                        allowClear={false}
                                    />
                                </ConfigProvider>

                                {/* <h3>Trajanje događaja:  {((endDate?.getDate() ?? 0) - (startDate?.getDate() ?? 0))} 
                                                        {((endDate?.getDate() ?? 0) - (startDate?.getDate() ?? 0)) < 1 ? ' dan' : ' dana'}</h3> */}
                            </div>

                            <div className='triple'>
                                <h3>Trajanje događaja</h3>
                                <p className='par-big'>{endDate ? daysActive + 1 : 0} {daysActive + 1 === 1 ? 'dan' : 'dana'}</p>
                            
                            </div>
                        </div>

                        <div className='novi-dogadjaj-podtermin-div'>
                            <TimeframeList timeframes={timeframes} setTimeframes={setTimeframes} />
                            {/* <div style={{display:'flex', justifyContent:'left', alignItems:'center', gap: '0px'}}>
                                <div style={{minWidth: '300px'}}>
                                    <Button type='button' label="Dodaj novi vremenski okvir" icon="pi pi-plus" onClick={addTimeframe} />
                                </div>
                                <div style={{width: '100%'}}>
                                    <InputText value={tempNaziv} onChange={(e) => setTempNaziv(e.target.value)} placeholder='Naziv vremenskog okvira'/>
                                </div>
                            </div> */}
                        </div>

                        <div className='novi-dogadjaj-map-div'>
                            <h3>Lokacija događaja <span>*</span></h3>

                            <MapComponent onLocationChange={handleLocationChange} location={location} />
                        </div>

                        <div className='novi-dogadjaj-next-button-div'>
                            <Button type='button' label="Nazad" severity="secondary" icon="pi pi-arrow-left" onClick={() => {stepperRef.current.prevCallback(); window.scrollTo({ top: 0, behavior: 'smooth' });}} />
                            <Button type='button' label="Dalje" icon="pi pi-arrow-right" iconPos="right" onClick={() => { if(validacijaDrugaStrana()) stepperRef.current.nextCallback(); window.scrollTo({ top: 0, behavior: 'smooth' });}} />
                        </div>  
                    </div>
                </StepperPanel>

            {/*Page 3*/}
                <StepperPanel header="Ulaznice">
                    <div className='novi-dogadjaj-content-div'>
                        <h2>Ulaznice</h2>
                        <hr />

                        <div className="ticket-wrapper">
                            <TicketList tickets={tickets} setTickets={setTickets} />

                            {/* <div className="ticket-buttons">
                                <Button type='button' label="+ Plaćena ulaznica" onClick={() => addTicket('paid')}  />
                                <Button type='button' label="+ Besplatna ulaznica" onClick={() => addTicket('free')}  />
                                <Button type='button' label="+ Humanitarna ulaznica" onClick={() => addTicket('donation')}  />
                            </div> */}
                        </div>  

                        <div className='novi-dogadjaj-next-button-div'>
                            <Button type='button' label="Nazad" severity="secondary" icon="pi pi-arrow-left" onClick={() => {stepperRef.current.prevCallback(); window.scrollTo({ top: 0, behavior: 'smooth' });}} />
                            <Button type='button' label="Dalje" icon="pi pi-arrow-right" iconPos="right" onClick={() => { if(validacijaTrecaStrana()) stepperRef.current.nextCallback(); window.scrollTo({ top: 0, behavior: 'smooth' });}} />
                        </div>
                    </div>
                </StepperPanel>

            {/*Page 4*/}
                <StepperPanel header="Pregled">
                    <div className="novi-dogadjaj-content-div">
                        <h2>Pregled događaja</h2>
                        <hr />

                        <div className='novi-dogadjaj-pregled-main-div'>
                            <div className='poster-div'>
                                {startDate &&(
                                    <EventImageCard 
                                        src={image?.toString()}
                                        day={startDate.getDate()}
                                        month={startDate.toLocaleString('default', { month: 'short' })}
                                    />
                                )}
                            </div>

                            <h3>{naziv}</h3>
                            <p className='pi pi-map-marker location-paragraph'> {location?.city}</p>

                            <SafeDescription deskripcija={deskripcija}/>
                            <p className='pi pi-map-marker location-paragraph map-location-p'> Lokacija</p>
                            <div style={{paddingBottom: "15px"}}>
                                {location?.lat !== undefined && location.lng !== undefined && (
                                    <ReadOnlyMap lat={location.lat} lng={location.lng} />
                                )}
                            </div>
                        </div>

                        <div className='novi-dogadjaj-next-button-div'>
                            <Button type='button' label="Nazad" severity="secondary" icon="pi pi-arrow-left" onClick={() => {stepperRef.current.prevCallback(); window.scrollTo({ top: 0, behavior: 'smooth' });}} />
                            <Button label="Sačuvaj" icon="pi pi-arrow-right" iconPos="right" type='submit' />
                        </div>
                    </div>
                </StepperPanel>
            </Stepper>
            </form>
        </>
    );
}

export default NoviDogadjaj;