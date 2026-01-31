import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const DoctorCard = ({ doctor }) => {
    const { store, dispatch } = useGlobalReducer();
    const [availability, setAvailability] = useState([]);

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await fetch(`${import.meta.env.BACKEND_URL}/api/doctor/${doctor.id}/availability`);
                
                if (response.ok) {
                    const data = await response.json();
                    setAvailability(data);
                } else {
                    console.error("Error en la respuesta del servidor:", response.status);
                }
            } catch (error) {
                console.error("Error cargando disponibilidad", error);
            }
        };
        
        if (doctor && doctor.id) {
            fetchAvailability();
        }
    }, [doctor.id]);

    const nextSlot = availability.length > 0 ? availability[0].hour : "No slots";

    const handleBooking = () => {
        dispatch({
            type: "select_slot",
            payload: {
                doctor: doctor,
                hour: nextSlot,
                day: availability[0]?.day || null
            }
        });
    };

    return (
        <div className="card h-100 shadow-sm border-0 m-2" style={{ minWidth: "18rem", borderRadius: "15px" }}>
            <div className="card-body text-center">
                <div className="mb-3 d-flex justify-content-center">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                        <i className="fas fa-user-md fa-3x text-secondary"></i>
                    </div>
                </div>
                <h5 className="card-title mb-0">Dr. {doctor.name}</h5>
                <p className="text-primary small mb-3">{doctor.specialties}</p>
                <div className="text-start mb-3">
                    <p className="small text-muted mb-1">
                        <i className="fas fa-map-marker-alt text-primary me-2"></i> Tampa, FL
                    </p>
                </div>
                <div className="bg-light rounded p-2 mb-3">
                    <p className="small fw-bold mb-0">Next available today:</p>
                    <p className="text-muted small mb-0">
                        {availability.length > 0
                            ? `${availability[0].hour}`
                            : "No slots today"}
                    </p>
                </div>
                <button
                    className="btn btn-primary w-100 py-2"
                    style={{ borderRadius: "10px", backgroundColor: "#92c5f2", border: "none" }}
                    onClick={handleBooking}
                >
                    Book online
                </button>
            </div>
        </div>
    );
};