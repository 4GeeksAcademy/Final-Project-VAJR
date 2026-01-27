import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const MapView = ({ doctors }) => {
    // Coordenadas para centrar el mapa en Caracas (basado en tu DB)
    const venezuelaCenter = [10.4806, -66.9036];

    return (
        <MapContainer 
            center={venezuelaCenter} 
            zoom={12} 
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {doctors?.map((doc) => (
                // Solo ponemos el marcador si el doctor tiene coordenadas válidas
                doc.latitud && doc.longitud && (
                    <Marker key={doc.id} position={[doc.latitud, doc.longitud]}>
                        <Popup>
                            <div className="text-center">
                                <h6 className="fw-bold mb-1">Dr. {doc.name}</h6>
                                <p className="small mb-0 text-primary">{doc.specialties}</p>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
};