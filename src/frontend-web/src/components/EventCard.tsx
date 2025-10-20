import  './EventCard.css'


type EventCardProps = {
  title: string;
  showMoreIcon?: boolean;
};

const EventCard = ({ title, showMoreIcon = true }: EventCardProps) => {
  return (
    <div className="event-card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {showMoreIcon && <span className="more-icon">⋮</span>}
      </div>

      <div className="card-content">
        <span className="bar-icon">📊</span>
        <p className="card-text">Trenutno nema podataka</p>
      </div>
    </div>
  );
};

export default EventCard;