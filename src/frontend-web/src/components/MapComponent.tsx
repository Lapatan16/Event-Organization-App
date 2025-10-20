import React, { useState, useEffect } from "react";
import { InputText } from "primereact/inputtext";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type Props = {
    onLocationChange: (data: {
        lat: number;
        lng: number;
        address: string;
        city: string;
    }) => void;
    location: {
        lat: number;
        lng: number;
        address: string;
        city: string;
    } | null;
};

const LocationMarker = ({
    position,
    setPosition,
    setSearchQuery,
    onLocationChange,
}: {
    position: { lat: number; lng: number } | null;
    setPosition: React.Dispatch<
        React.SetStateAction<{ lat: number; lng: number } | null>
    >;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    onLocationChange: (data: { lat: number; lng: number; address: string; city: string }) => void;
}) => {
    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });

            try {
                const res = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                    params: {
                        lat,
                        lon: lng,
                        format: "json",
                        addressdetails: 1,
                    },
                    headers: {
                        'Accept-Language': 'sr-Latn',
                    },
                });

                const address = res.data.display_name;
                const addrDetails = res.data.address;
                const city = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.hamlet || "";

                setSearchQuery(address);
                onLocationChange({ lat, lng, address, city });
            } catch (err) {
                console.error("Reverse geocoding failed:", err);
            }
        },
    });

    return position ? <Marker position={position} /> : null;
};

const ChangeMapView = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coords, map.getZoom());
    }, [coords, map]);
    return null;
};

const MapComponent: React.FC<Props> = ({ onLocationChange, location }) => {
    const [center, setCenter] = useState<[number, number]>([44.7866, 20.4489]);
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (location) {
            setCenter([location.lat, location.lng]);
            setPosition({ lat: location.lat, lng: location.lng });
            setSearchQuery(location.address);
        }
    }, [location]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (debounceTimer) clearTimeout(debounceTimer);
        setDebounceTimer(
            setTimeout(async () => {
                if (value.trim().length === 0) return setSuggestions([]);

                try {
                    const res = await axios.get("https://nominatim.openstreetmap.org/search", {
                        params: {
                            q: value,
                            format: "json",
                            addressdetails: 1,
                            limit: 5,
                        },
                        headers: {
                            'Accept-Language': 'sr-Latn',
                        },
                    });

                    setSuggestions(res.data);
                } catch (err) {
                    console.error("Suggestion fetch failed:", err);
                }
            }, 400)
        );
    };

    const handleSuggestionSelect = (item: any) => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const addr = item.display_name;
        const addrDetails = item.address || {};
        const city = addrDetails.city || addrDetails.town || addrDetails.village || addrDetails.hamlet || "";

        setCenter([lat, lng]);
        setPosition({ lat, lng });
        setSuggestions([]);
        setSearchQuery(addr);

        onLocationChange({ lat, lng, address: addr, city });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
    };

    return (
        <div style={{ position: "relative" }}>
            <div style={{ position: "relative", marginBottom: suggestions.length > 0 ? '220px' : '10px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <i
                        className="pi pi-search"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '10px',
                            transform: 'translateY(-50%)',
                            color: '#999',
                            pointerEvents: 'none',
                        }}
                    />
                    <InputText
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Pretraži lokaciju"
                        spellCheck={false}
                        style={{
                            width: '100%',
                            paddingLeft: '30px',
                            paddingRight: searchQuery ? '24px' : undefined,
                        }}
                    />
                    {searchQuery && (
                        <i
                            className="pi pi-times"
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                color: '#999',
                            }}
                            onClick={handleClearSearch}
                        />
                    )}
                </div>

                {suggestions.length > 0 && (
                    <ul
                        style={{
                            listStyle: "none",
                            margin: 0,
                            padding: 0,
                            position: "absolute",
                            width: "100%",
                            background: "#fff",
                            border: "1px solid #ccc",
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onClick={() => handleSuggestionSelect(item)}
                                style={{
                                    padding: "8px",
                                    borderBottom: "1px solid #eee",
                                    cursor: "pointer",
                                }}
                            >
                                {item.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <MapContainer center={center} zoom={13} style={{ height: "400px", width: "100%" }}>
                <TileLayer
                    attribution="© OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeMapView coords={center} />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    setSearchQuery={setSearchQuery}
                    onLocationChange={onLocationChange}
                />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
