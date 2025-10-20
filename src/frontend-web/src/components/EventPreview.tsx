import { useState } from "react";
import type { Event } from "../types/Event";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import ReadOnlyMap from '../components/ReadOnlyMap';
import SafeDescription from '../components/SafeDescription';
import EventImageCard from '../components/EventImageCard';
import EditEventDialog from '../components/EditEventDialog';
import { Toast } from "primereact/toast";
import { useRef } from "react";

import "./EventPreview.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});



type Props = {
    event: Event;
    setEvent: (event: Event) => void;
};

const EventPreview = ({ event, setEvent }: Props) => {
  const [editVisible, setEditVisible] = useState(false);
  const toast = useRef<Toast>(null);

  const handleChange = () =>
  {
    if(event.status !== 'draft')
    {
      toast.current?.show({ severity: "info", summary: "Događaj je objavljen", detail: "Nije moguće menjati objavljen događaj" });
    }
    else
    {
      setEditVisible(true)
    }
  }

  if (!event) return <p>Učitavanje...</p>;

  return (
    <div className="event-container">
      <Toast ref={toast} />
       <h1 className="event-title">{event.title}</h1>
       <div className='poster-div'>
          {event.startDate &&(
               <EventImageCard 
                    src={event.poster?.toString()}
                    day={new Date(event.startDate).getDate()} 
                    month={new Date(event.startDate).toLocaleString('default', { month: 'short' })}
               />
          )}
       </div>

       <h3>{event.title}</h3>
       <p className='pi pi-map-marker location-paragraph'> {event?.location?.city}</p>

        <div className="my-taview">
          <SafeDescription deskripcija={event.description || ""}/>
          <p className='pi pi-map-marker location-paragraph map-location-p'> Lokacija</p>
          <div>
              {event.location?.lat !== undefined && event.location.lng !== undefined && (
                  <ReadOnlyMap lat={event?.location?.lat} lng={event?.location?.lng} />
              )}
          </div>
          <div className="update-btn">
              <button onClick={() => handleChange()}>Izmeni</button>
          </div>
        </div>
    
       {/* <TabView className="my-tabview">
          <TabPanel  header='Detalji'>
              
          </TabPanel>

          <TabPanel  header='Ulaznice'>
              <ListaUlaznica ticket={event?.tickets || []}/>
          </TabPanel>      

          <TabPanel  header='Program'>
              {loadingPrograms ? (
                <p>Učitavanje programa...</p>
              ) : programList.length === 0 ? (
                <p>Nema programa za ovaj događaj.</p>
              ) : (
                <div className="program-list">
                  {programList.map((prog) => {
                    const date = prog.date ? new Date(prog.date) : null;
                    const start = prog.startTime ? new Date(prog.startTime) : null;
                    const end = prog.endTime ? new Date(prog.endTime) : null;

                    return (
                      <div key={prog.id} className="program-card">
                        <h4>
                          {date
                            ? date.toLocaleDateString("sr-RS", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })
                            : "Nepoznat datum"}
                        </h4>

                        <p>
                          Počinje u:{" "}
                          {start
                            ? start.toLocaleTimeString("sr-RS", {
                                hour: "2-digit",
                                minute: "2-digit"
                              }) + "h"
                            : "Nepoznato"}
                        </p>

                        <p>
                          Završava se u:{" "}
                          {end
                            ? end.toLocaleTimeString("sr-RS", {
                                hour: "2-digit",
                                minute: "2-digit"
                              }) + "h"
                            : "Nepoznato"}
                        </p>

                        <p className="program-name">{prog.name}</p>
                        {prog.description && <p>{prog.description}</p>}
                      </div>
                    );
                  })}
                </div>

              )}
          </TabPanel>  
      </TabView> */}
     
      <EditEventDialog
        visible={editVisible}
        onHide={() => setEditVisible(false)}
        event={event}
        onUpdate={(updatedEvent) => setEvent(updatedEvent)}
      />
    </div>
  );
};

export default EventPreview;
