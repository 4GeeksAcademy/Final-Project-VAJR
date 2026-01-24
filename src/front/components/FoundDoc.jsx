import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const FoundDoc = () => {
    const { store, dispatch } = useGlobalReducer();
    const [selectedSpecialty, setSelectedSpecialty] = useState("All");

    const specialties = ["All", ...new Set(store.doctors?.map(doc => doc.specialties).filter(s => s))];
    const filteredDoctors = selectedSpecialty === "All" 
        ? store.doctors 
        : store.doctors.filter(doc => doc.specialties === selectedSpecialty);

    return (
        <div className="container py-5" style={{ backgroundColor: "#F8F9FA" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold" style={{ color: "#092F64", fontSize: "1.5rem" }}>Top-rated primary care doctors</h3>
                <select 
                    className="form-select w-auto shadow-sm" 
                    style={{ borderRadius: "8px", borderColor: "#468BE6", color: "#1A5799" }}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                    {specialties.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                </select>
            </div>

            <div className="d-flex overflow-auto pb-4 custom-scrollbar" style={{ gap: "1.25rem" }}>
                {filteredDoctors && filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))
                ) : (
                    <p className="text-muted italic">No doctors found for this specialty.</p>
                )}
            </div>
        </div>
    );
};

const DoctorCard = ({ doctor }) => {
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/${doctor.id}/availability`);
                if (resp.ok) {
                    const data = await resp.json();
                    setSlots(data.slice(0, 3));
                }
            } catch (error) { console.error(error); }
        };
        fetchSlots();
    }, [doctor.id]);

    return (
        <div className="card card-doc border-0 shadow-sm" style={{ 
            minWidth: "260px",
            maxWidth: "260px",
            borderRadius: "12px", 
            backgroundColor: "#FFFFFF" 
        }}>
            <div className="card-body p-3 d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                    <img 
                        src={doctor.picture || "https://via.placeholder.com/64"} 
                        className="rounded-circle me-3" 
                        style={{ width: "64px", height: "64px", objectFit: "cover", border: "2px solid #E9F5FF" }} 
                    />
                    <div className="overflow-hidden">
                        <h6 className="mb-0 fw-bold text-truncate" style={{ color: "#1F1F1F", fontSize: "1rem" }}>
                            Dr. {doctor.name}
                        </h6>
                        <p className="mb-1 text-truncate" style={{ color: "#468BE6", fontSize: "0.85rem" }}>
                            {doctor.specialties}
                        </p>
                        <div className="small" style={{ color: "#1A5799" }}>
                            <i className="fa-solid fa-star text-warning"></i> 4.96 <span className="text-muted">(27)</span>
                        </div>
                    </div>
                </div>

                <div className="mb-3" style={{ fontSize: "0.85rem", color: "#313131" }}>
                    <div className="mb-1"><i className="fa-solid fa-location-dot me-2" style={{ color: "#468BE6" }}></i>{doctor.location || "Tampa, FL"}</div>
                    <div className="text-success fw-medium"><i className="fa-solid fa-calendar-check me-2"></i>New patient appts</div>
                </div>

                <div className="mt-auto">
                    <p className="fw-bold mb-2" style={{ fontSize: "0.8rem", color: "#1F1F1F" }}>Next available today:</p>
                    <div className="d-flex gap-2 mb-3">
                        {slots.length > 0 ? slots.map((slot, i) => (
                            <button key={i} className="btn btn-sm px-2 fw-semibold" style={{ 
                                backgroundColor: "#E9F5FF", 
                                color: "#1A5799", 
                                border: "1px solid #93BFEF",
                                fontSize: "0.75rem"
                            }}>
                                {slot.hour}
                            </button>
                        )) : <span className="text-muted small italic">Check tomorrow</span>}
                    </div>
                    <button className="btn w-100 fw-bold py-2" style={{ 
                        backgroundColor: "#93bfef", 
                        color: "#1F1F1F", 
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        border: "none"
                    }}>
                        Book online
                    </button>
                </div>
            </div>
        </div>
    );
};