import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getCalApi } from "@calcom/embed-react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import Swal from "sweetalert2";
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
    const { store } = useGlobalReducer();
    const [showSlots, setShowSlots] = useState(false);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

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
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                setSelectedDoctor(doc);
                                                setLoadingSlots(true);
                                                try {
                                                    const backendUrl = import.meta.env.VITE_BACKEND_URL;
                                                    const res = await fetch(`${backendUrl}/api/doctor/${doc.id}/availability`);
                                                    if (res.ok) {
                                                        const data = await res.json();
                                                        setSlots(data || []);
                                                        setShowSlots(true);
                                                    } else {
                                                        Swal.fire('Error', 'No se pudieron cargar los horarios.', 'error');
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    Swal.fire('Error', 'Error de conexión al cargar horarios.', 'error');
                                                } finally {
                                                    setLoadingSlots(false);
                                                }
                                            }}
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