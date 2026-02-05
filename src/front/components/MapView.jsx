import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
export const MapView = ({ doctors }) => {
    console.log("Datos de doctores:", window.location.href);
    return (
        <div style={{ height: "100%", width: "100%", minHeight: "500px" }}>
            <MapContainer
                center={[10.4806, -66.9036]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {doctors?.map((doc) => {
                    const lat = parseFloat(doc.latitud);
                    const lng = parseFloat(doc.longitud);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                            <Marker 
                                key={doc.id} 
                                position={[lat, lng]} 
                                icon={customIcon} 
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong>Dr. {doc.name}</strong><br/>
                                        <small className="text-primary">{doc.specialties}</small>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }
                    return null;
                })}
            </MapContainer>
        </div>
    );
};