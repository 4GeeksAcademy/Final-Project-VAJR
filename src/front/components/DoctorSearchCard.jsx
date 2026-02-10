import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCalApi } from "@calcom/embed-react";
import "./DoctorSearchCard.css";

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
    
    const getLocationString = (loc) => {
        if (!loc) return "Location not available";
        return typeof loc === 'object' ? "Caracas, Venezuela" : loc;
    };

    const specialty = doctor.specialties || "Specialist";

    return (
        <div className="card doctor-card mb-4 shadow-sm border-0">
            <div className="row g-0 align-items-center h-100">
                <div className="col-md-8 p-4 d-flex align-items-center">
                    <div className="doctor-img-container me-5">
                        <img
                            src={doctor.picture || "https://via.placeholder.com/150"}
                            className="doctor-img"
                            alt={`Dr. ${doctor.name}`}
                        />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                        <h4 className="doc-name text-truncate">
                            Dr. {doctor.name}
                        </h4>
                        
                        <div>
                            <span className="doc-specialty">
                                {specialty}
                            </span>
                        </div>
                        
                        <div className="doc-stats mb-2">
                            <i className="fa-solid fa-star text-warning"></i>
                            <span className="fw-bold text-dark">4.9</span> 
                            <span className="text-muted small ms-1">(120 reviews)</span>
                        </div>
                        
                        <p className="doc-location mb-0 text-truncate">
                            <i className="fa-solid fa-location-dot me-2 text-danger opacity-75"></i>
                            {getLocationString(doctor.location)}
                        </p>
                    </div>
                </div>

                <div className="col-md-4 border-start-md d-flex align-items-stretch bg-light bg-opacity-25">
                    <div className="p-4 d-flex flex-column justify-content-center w-100">
                        <button
                            data-cal-link={doctor.cal_link}
                            className="btn-book-appointment mb-2"
                        >
                            <i className="fa-regular fa-calendar-check"></i>
                            Book Appointment
                        </button>
                        <button
                            className="btn btn-sm btn-view-profile w-100"
                            onClick={() => navigate(`/doctorpage/${doctor.id}`)}
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};