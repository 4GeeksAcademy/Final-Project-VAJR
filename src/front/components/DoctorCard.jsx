import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DoctorCard = ({ doctor }) => {
    if (!doctor) return null;



    const { dispatch } = useGlobalReducer();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAvailability = async () => {
            if (!doctor.id) return;
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/doctor/${doctor.id}/availability`);

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setSlots(data.slice(0, 3));
                    }
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAvailability();
    }, [doctor.id]);

    const handleBooking = (slot) => {
        dispatch({
            type: "select_slot",
            payload: { doctor, hour: slot.hour, day: slot.day }
        });
        alert(`Selected: ${slot.hour} with Dr. ${doctor.name}`);
    };

    return (
        <div className="card border-0 shadow-sm h-100" style={{ minWidth: "260px", maxWidth: "260px", borderRadius: "12px" }}>
            <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                    <img
                        src={doctor.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                        className="rounded-circle me-3"
                        style={{ width: "64px", height: "64px", objectFit: "cover", border: "2px solid #E9F5FF" }}
                        alt="doctor"
                    />
                    <div className="overflow-hidden">
                        <h6 className="mb-0 fw-bold text-truncate" style={{ color: "#1F1F1F" }}>
                            Dr. {doctor.name || "Professional"}
                        </h6>
                        <p className="mb-1 text-truncate" style={{ color: "#468BE6", fontSize: "0.85rem" }}>
                            {doctor.specialties || "General Medicine"}
                        </p>
                    </div>
                </div>

                <div className="mb-3" style={{ fontSize: "0.85rem", color: "#313131" }}>
                    <div className="mb-1 text-truncate">
                        <i className="fa-solid fa-location-dot me-2 text-primary"></i>
                        {typeof doctor.location === 'object' ? "Tampa, FL" : doctor.location || "Tampa, FL"}
                    </div>
                </div>

                <div className="mt-auto">
                    <p className="fw-bold mb-2 small text-dark">Next available today:</p>
                    <div className="d-flex gap-2 mb-3 justify-content-center">
                        {loading ? (
                            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        ) : slots.length > 0 ? (
                            slots.map((slot, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleBooking(slot)}
                                    className="btn btn-sm px-2 fw-semibold"
                                    style={{ backgroundColor: "#E9F5FF", color: "#1A5799", border: "1px solid #93BFEF", fontSize: "0.75rem", justifyContent: "center" }}
                                >
                                    {slot.hour}
                                </button>
                            ))
                        ) : (
                            <span className="text-muted small italic">No slots</span>
                        )}
                    </div>
                    <button
                        className="btn w-100 fw-bold py-2 shadow-sm"
                        style={{ backgroundColor: "#93bfef", color: "#1F1F1F", borderRadius: "8px", border: "none" }}
                        onClick={() => navigate(`/doctor/${doctor.id}`)} // Redirigimos la ruta al perfil del doc(judelin)
                    >
                        Book online
                    </button>
                </div>
            </div>
        </div>
    );
};