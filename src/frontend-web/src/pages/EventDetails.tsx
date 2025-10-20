import { useEffect, useState } from 'react';
import type { Event } from '../types/Event';
import { useParams } from 'react-router-dom';
import { VerticalTabs } from '../components/VerticalTabs';
import { VerticalTab } from '../components/VerticalTab';
import { API_URL } from '../services/config';
import EventPreview from '../components/EventPreview'
import "./EventDetails.css"
import EventResursi from '../components/EventResursi';
import EventProgram from '../components/EventProgram';
import Spinner from '../utils/Spinner';
import { Button } from 'primereact/button';
import EventsTickets from '../components/EventsTickets';
import api from '../services/api';


const EventDetails = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [event, setEvent] = useState<Event>();
    const { id } = useParams();

    const publishEvent = async () => {
        if (!event?.id) return;

        try {
            await api.put(`${API_URL}/api/Event/${event.id}/publish`);

            // If no error thrown, update local state
            setEvent({ ...event, status: 'published' });
            } catch (err: any) {
            if (err.response) {
                console.error('Failed to publish event:', err.response.data);
            } else {
                console.error('Unexpected error publishing event:', err.message);
            }
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            try {
            const res = await api.get(`${API_URL}/api/Event/${id}`);
            const data: Event = res.data;

            const mappedEvent: Event = {
                id: data.id,
                organizerId: data.organizerId,
                title: data.title,
                description: data.description,
                type: data.type,
                contact: data.contact,
                visibility: data.visibility,
                poster: data.poster,
                startDate: data.startDate,
                endDate: data.endDate,
                startTime: data.startTime,
                program: data.program,
                location: data.location,
                resources: data.resources,
                tickets: data.tickets,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
                status: data.status,
            };

            setEvent(mappedEvent);
            } catch (err: any) {
            if (err.response) {
                console.error('Failed to fetch event:', err.response.data);
            } else {
                console.error('Unexpected error:', err.message);
            }
            }
        };

        fetchEvent();
    }, [id]);


    const handleEventChange = (value: Event)=>
    {
        setEvent(value);
    }

    if (!event) return <Spinner />;

    // to do izmeniti da se stavlja u aktivne dogadjaje !!!

    return (
        <div className='event-details'>
            <VerticalTabs 
                activeIndex={activeIndex} 
                onTabChange={setActiveIndex}
                extraContent=
                {
                    <Button
                        label={event.status === 'published' || event.status == 'expired' ? 'Objavljeno' : 'Objavi događaj'}
                        icon="pi pi-check"
                        className="p-button-sm p-button-success"
                        disabled={event.status === 'published' || event.status == 'expired'}
                        onClick={publishEvent}
                        style={{ width: "100%" }}
                    />
                }
            >

                <VerticalTab label='Pregled'>
                    <div className='event-details-content-div'>
                        
                        <EventPreview event={event} setEvent={handleEventChange}></EventPreview>
                    </div>
                </VerticalTab>

                <VerticalTab label='Resursi'>
                    <div className='event-details-content-div'>
                        
                        <EventResursi event={event} setEvent={handleEventChange}/>
                    </div>
                </VerticalTab>

                <VerticalTab label='Ulaznice'>
                    <div className='event-details-content-div'>
                       
                        <EventsTickets 
                            existingTickets={event.tickets ?? []}
                            eventId={event.id!}
                            event={event}
                        />
                    </div>
                </VerticalTab>

                <VerticalTab label='Program'>
                    <div className='event-details-content-div'>
                        <EventProgram event={event}/>
                    </div>
                </VerticalTab>
            </VerticalTabs>
        </div>
    );
};

export default EventDetails;
