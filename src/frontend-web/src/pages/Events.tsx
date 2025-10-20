import { useEffect, useState } from "react";
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import api from "../services/api";

import EventList from "../components/EventList";
import type { Event } from "../types/Event";
import './Events.css';
import { API_URL } from "../services/config";
import Spinner from "../utils/Spinner";

type PodStranica = 'aktivni' | 'skica' | 'istekli' | 'prikaziSve';

const Events = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [aktivnaPodStranica, setAktivnaPodStranica] = useState<PodStranica>('aktivni');
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const pageSize = 5;

    useEffect(() => {
        setLoading(true);

        // map tab to API parameter
        let statusParam = "";
        switch (aktivnaPodStranica) {
            case "aktivni":
                statusParam = "published";
                break;
            case "skica":
                statusParam = "draft";
                break;
            case "istekli":
                statusParam = "expired";
                break;
            default:
                statusParam = ""; // for prikaziSve
        }

        const url = `${API_URL}/api/Event/by-category?pageNumber=${currentPage}&pageSize=${pageSize}${
            statusParam ? `&category=${statusParam}` : ""
        }`;

        api.get(url)
            .then(res => res.data)
            .then((data) => {
                setEvents(data.items);
                setTotalItems(data.totalItems);
                setLoading(false);
            })
            .catch(err => {
                console.error("Greška pri dohvatanju događaja:", err);
                setLoading(false);
            });
    }, [currentPage, aktivnaPodStranica]); // refetch on tab/page change

    if (loading) return <Spinner />;

    return (
        <div className="event-page">
            <div className="event-mini-nav-bar">
                <div className="event-button-div">
                    <button
                        className={`event-mini-navigacija event-prvi ${aktivnaPodStranica === 'aktivni' ? 'event-active' : ''}`}
                        onClick={() => {
                            setAktivnaPodStranica("aktivni");
                            setCurrentPage(1);
                        }}>Aktivni
                    </button>
                </div>

                <div className="button-div">
                    <button
                        className={`event-mini-navigacija ${aktivnaPodStranica === 'skica' ? 'event-active' : ''}`}
                        onClick={() => {
                            setAktivnaPodStranica("skica");
                            setCurrentPage(1);
                        }}>Skica
                    </button>
                </div>

                <div className="event-button-div">
                    <button
                        className={`event-mini-navigacija ${aktivnaPodStranica === 'istekli' ? 'event-active' : ''}`}
                        onClick={() => {
                            setAktivnaPodStranica("istekli");
                            setCurrentPage(1);
                        }}>Istekli
                    </button>
                </div>

                <div className="event-button-div">
                    <button
                        className={`event-mini-navigacija event-poslednji ${aktivnaPodStranica === 'prikaziSve' ? 'event-active' : ''}`}
                        onClick={() => {
                            setAktivnaPodStranica("prikaziSve");
                            setCurrentPage(1);
                        }}>Prikaži sve
                    </button>
                </div>

                <div className="event-search-events-div">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText
                            spellCheck={false}
                            id="eventSearch"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Pretraži događaj po imenu"
                            style={{ width: "100%" }} />
                    </IconField>
                </div>
            </div>

            <div className="event-content">
                <EventList byName={search} events={events} />
            </div>

            <div className="event-pagination">
                <Paginator
                    first={(currentPage - 1) * pageSize}
                    rows={pageSize}
                    totalRecords={totalItems}
                    onPageChange={(e) => setCurrentPage(Math.floor(e.first / e.rows) + 1)}
                />
            </div>
        </div>
    );
};

export default Events;
