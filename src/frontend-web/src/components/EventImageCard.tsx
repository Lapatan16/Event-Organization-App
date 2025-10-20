
type EventImageProps = {
    src?: string;
    day: number;
    month: string;
};

const EventImageCard = ({ src, day, month }: EventImageProps) => {
    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <img
                src={src}
                alt="Poster nije dostupan."
                style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    display: 'block',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '30px',
                    left: '30px',
                    backgroundColor: 'white',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    boxShadow: '0 0 5px rgba(0,0,0,0.2)',
                    fontFamily: 'sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '70px',
                }}
            >
                <div style={{ fontWeight: 700, fontSize: '1.5rem', lineHeight: 1 }}>{day}</div>
                <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.2rem' }}>{month}</div>
            </div>
        </div>
    );
};

export default EventImageCard;
