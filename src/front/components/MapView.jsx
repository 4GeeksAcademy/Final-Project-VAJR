import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCalApi } from "@calcom/embed-react";
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});


export const MapView = ({ doctors }) => {
    const caracasCenter = [10.4806, -66.9036];

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "light",
                styles: { branding: { brandColor: "#092F64" } },
                hideEventTypeDetails: true,
                layout: "month_view"
            });
        })();
    }, []);

    return (
        <div style={{ height: "100%", width: "100%" }}>
            <MapContainer
                key={doctors?.length || 'init'}
                center={caracasCenter}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {doctors?.map((doc) => {
                    const lat = parseFloat(doc.location?.lat);
                    const lng = parseFloat(doc.location?.lng);

                    if (!isNaN(lat) && !isNaN(lng)) {
                        return (
                            <Marker key={doc.id} position={[lat, lng]}>
                                <Popup className="custom-popup">
                                    <div className="d-flex flex-column align-items-center text-center p-2" style={{ minWidth: "150px" }}>
                                        <img
                                            src={doc.picture || "https://via.placeholder.com/150"}
                                            alt={doc.name}
                                            style={{
                                                width: "60px",
                                                height: "60px",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                                border: "2px solid #092F64",
                                                marginBottom: "8px"
                                            }}
                                        />

                                        <h6 className="mb-1 fw-bold" style={{ color: "#092F64", fontSize: "14px" }}>
                                            Dr. {doc.name}
                                        </h6>
                                        <span className="badge bg-light text-primary border mb-2">
                                            {doc.specialties || "General"}
                                        </span>
                                        <button
                                            data-cal-link={doc.cal_link}
                                            className="btn btn-sm btn-primary w-100 fw-bold"
                                            style={{ backgroundColor: "#468be6", fontSize: "12px" }}
                                        >
                                            Book Appointment
                                        </button>
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