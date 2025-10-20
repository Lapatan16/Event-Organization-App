import "./EventList.css";
import type { Event } from "../types/Event";
import { useNavigate } from "react-router-dom";

type EventListProps = {
    byName: string;
    events: Array<Event>;
};

type EventPreview = {
    id: string;
    image: string;
    naziv: string;
    datum: string;
    vreme: string;
    lokacija: string;
    aktivno: string;
    cenaTiketa: string;
    brojProdatihTiketa: number;
};

const EventList = ({ byName, events }: EventListProps) => {
    const mappedDogadjaji: EventPreview[] = events.map((event) => ({
        id: event.id,
        image: event.poster,
        naziv: event.title,
        datum: new Date(event.startDate).toLocaleDateString('sr-RS'),
        vreme: event.startTime,
        lokacija: event.location?.city ?? "Nepoznata lokacija",
        aktivno:
            event.status === 'draft'
                ? "Skica"
                : event.status === "published"
                ? "Aktivan"
                : "Istekao",
        cenaTiketa: `${event.tickets.reduce((sum, ticket) => sum + ((ticket.price ?? 0) * (ticket.sold ?? 0)), 0)} RSD`,
        brojProdatihTiketa: event.tickets.reduce((sum, ticket) => sum + (ticket.sold ?? 0), 0),
    }));

    const navigate = useNavigate();

    const filteredDogadjaji = mappedDogadjaji.filter((d) =>
        byName === "" || d.naziv.toLowerCase().includes(byName.toLowerCase())
    );

    return (
        <div className="main-div-event-list">
            {filteredDogadjaji.map((dogadjaj, index) => (
                <div key={index} className="item">
                    <div className="left">
                        <div className="image">
                            <img src={dogadjaj.image} alt="Nema slike" />
                        </div>

                        <div className="text">
                            <h3>{dogadjaj.naziv}</h3>
                            <p>📆 {dogadjaj.datum} {dogadjaj.vreme}</p>
                            <p>📌 {dogadjaj.lokacija}</p>
                            <p className={dogadjaj.aktivno}>
                                {dogadjaj.aktivno === 'Aktivan'
                                    ? '🟢'
                                    : dogadjaj.aktivno === 'Istekao'
                                    ? '🔴'
                                    : '🟠'}{" "}
                                {dogadjaj.aktivno}
                            </p>
                        </div>
                    </div>

                    <div className="right">
                        <div className="buttons">
                            <button id="vise" onClick={() => navigate(`/dogadjaji/${dogadjaj.id}`)}>
                                Upravljaj
                            </button>
                        </div>
                        <div className="tickets" style={{ fontSize: "18px" }}>
                            <span>💳 {dogadjaj.cenaTiketa}</span>
                            <span>🎫 {dogadjaj.brojProdatihTiketa}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EventList;
