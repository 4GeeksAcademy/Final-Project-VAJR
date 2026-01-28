import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";

export const DoctorSearchCard = ({ doctor }) => {
    const navigate = useNavigate();

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "light",
                layout: "month_view",
                // ESTAS LÍNEAS HACEN LA MAGIA:
                hideEventTypeDetails: true,
                styles: {
                    branding: {
                        brandColor: "#092F64", // Usa tu azul corporativo
                    },
                },
            });
        })();
    }, []);

    return (
        <div className="card mb-4 shadow-sm border-0 overflow-hidden" style={{ borderRadius: "16px", minHeight: "250px" }}>
            <div className="row g-0">
                <div className="col-md-5 p-4 d-flex flex-column border-end bg-white">
                    <div className="d-flex align-items-start mb-3">
                        <img
                            src={doctor.picture || "https://via.placeholder.com/150"}
                            className="rounded-circle me-3 shadow-sm"
                            style={{ width: "90px", height: "90px", objectFit: "cover", border: "3px solid #f0f7ff" }}
                            alt={doctor.name}
                        />
                        <div className="overflow-hidden">
                            <h5 className="mb-1 fw-bold text-truncate" style={{ color: "#092F64" }}>
                                Dr. {doctor.name}
                            </h5>
                            <p className="mb-2 text-primary small fw-bold text-uppercase" style={{ letterSpacing: "0.5px" }}>
                                {doctor.specialties}
                            </p>
                            <div className="small text-muted mb-3">
                                <i className="fa-solid fa-star text-warning me-1"></i>
                                <span className="fw-bold text-dark">4.9</span> (120 reviews)
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <p className="text-muted small mb-3">
                            <i className="fa-solid fa-location-dot me-2 text-danger"></i>
                            {typeof doctor.location === 'object' ? "Caracas, Venezuela" : doctor.location}
                        </p>
                        <button
                            className="btn btn-outline-primary w-100 fw-bold py-2"
                            style={{ borderRadius: "10px" }}
                            onClick={() => navigate(`/doctor/${doctor.id}`)}
                        >
                            Ver Perfil Completo
                        </button>
                    </div>
                </div>

                {/* LADO DERECHO: API de Reservas (Cal.com) */}
                <div className="col-md-7 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: "280px" }}>
                    <div className="w-100 h-100 overflow-hidden">
                        <Cal
                            calLink={doctor.cal_link || "jamie"}
                            style={{ width: "100%", height: "100%" }}
                            config={{ layout: "month_view" }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};