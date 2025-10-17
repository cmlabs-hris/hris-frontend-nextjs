'use client'

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';


// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Tipe untuk posisi
type Position = [number, number];

// Komponen helper untuk mengubah pusat peta secara dinamis
function ChangeView({ center }: { center: Position }) {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.setView(center, 15); 
        }
    }, [center, map]);
    return null;
}

interface AttendanceMapProps {
    position: Position;
}

export default function AttendanceMap({ position }: AttendanceMapProps) {
    return (
        <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <ChangeView center={position} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
                <Popup>
                    Lokasi yang dipilih.
                </Popup>
            </Marker>
        </MapContainer>
    );
}

