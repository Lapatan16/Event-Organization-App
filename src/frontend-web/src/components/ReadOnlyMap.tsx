import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

type Props = {
    lat: number;
    lng: number;
    zoom?: number;
};

const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
};

const ReadOnlyMap: React.FC<Props> = ({ lat, lng, zoom = 13 }) => {
    const center: [number, number] = [lat, lng];

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '400px', width: '100%' }}
            // All interactions allowed
            dragging={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            boxZoom={true}
            keyboard={true}
            zoomControl={true}
        >
            <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center} />
            <ChangeMapView coords={center} />
        </MapContainer>
    );
};

export default ReadOnlyMap;
