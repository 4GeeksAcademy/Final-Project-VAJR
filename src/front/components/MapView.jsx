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
    const centerPosition = [10.4806, -66.9036];

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <MapContainer
                center={[10.4806, -66.9036]}
                zoom={12}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {doctors?.map((doc) => (
                    doc.latitud && doc.longitud && (
                        <Marker key={doc.id} position={[parseFloat(doc.latitud), parseFloat(doc.longitud)]}>
                            <Popup>
                                <strong>Dr. {doc.name}</strong>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};