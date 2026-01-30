import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCalApi } from "@calcom/embed-react";

export const DoctorSearchCard = ({ doctor }) => {
    const navigate = useNavigate();

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
        <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "16px" }}>
            <div className="row g-0 align-items-center">
                <div className="col-md-8 p-4 d-flex align-items-center bg-white">
                    <img
                        src={doctor.picture || "https://via.placeholder.com/150"}
                        className="rounded-circle me-4 shadow-sm"
                        style={{ width: "100px", height: "100px", objectFit: "cover", border: "3px solid #f0f7ff" }}
                        alt={doctor.name}
                    />
                    <div className="overflow-hidden">
                        <h4 className="mb-1 fw-bold text-truncate" style={{ color: "#092F64" }}>
                            Dr. {doctor.name}
                        </h4>
                        <p className="mb-2 text-primary fw-bold text-uppercase small">
                            {doctor.specialties}
                        </p>
                        <div className="small text-muted mb-2">
                            <i className="fa-solid fa-star text-warning me-1"></i>
                            <span className="fw-bold text-dark">4.9</span> (120 reviews)
                        </div>
                        <p className="text-muted small mb-0">
                            <i className="fa-solid fa-location-dot me-2 text-danger"></i>
                            {typeof doctor.location === 'object' ? "Caracas, Venezuela" : doctor.location}
                        </p>
                    </div>
                </div>

                <div className="col-md-4 p-4 text-center">
                    <div className="d-grid gap-2">
                        <button
                            data-cal-link={doctor.cal_link}
                            className="btn btn-primary fw-bold w-100"
                            style={{ backgroundColor: "#092F64", borderRadius: "10px" }}
                        >
                            Book Appointment
                        </button>

                        <button
                            className="btn btn-outline-secondary btn-sm fw-bold border-0"
                            onClick={() => navigate(`/doctor/${doctor.id}`)}
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};