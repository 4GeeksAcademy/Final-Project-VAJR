import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { DoctorCard } from "./DoctorCard.jsx";

export const FoundDoc = () => {
    const { store, dispatch } = useGlobalReducer();
    const [loading, setLoading] = useState(false);

    const specialties = ["CARDIOLOGY", "PEDIATRICS", "DERMATOLOGY", "GENERAL PRACTICE"];

    const fetchDoctors = async (specialty = null) => {
        setLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const url = specialty
                ? `${backendUrl}/doctors?specialty=${specialty}`
                : `${backendUrl}/doctor`;

            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                const payload = specialty ? data : data.msg;

                dispatch({ type: "set_doctors", payload: payload || [] });
            } else {
                console.error("Error response from server");
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold" style={{ color: "#092F64" }}>Top Rated Doctors</h3>
                <select
                    className="form-select w-auto shadow-sm"
                    style={{ borderRadius: "8px", color: "#1A5799" }}
                    onChange={(e) => {
                        const val = e.target.value;
                        fetchDoctors(val === "All" ? null : val);
                    }}
                >
                    <option value="All">All Specialties</option>
                    {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                </div>
            ) : (
                <div className="d-flex overflow-auto pb-4 custom-scrollbar" style={{ gap: "1.25rem" }}>
                    {store.doctors && store.doctors.length > 0 ? (
                        store.doctors.map((doctor, index) => (
                            <DoctorCard key={doctor.id || index} doctor={doctor} />
                        ))
                    ) : (
                        <div className="alert alert-info w-100">No doctors found.</div>
                    )}
                </div>
            )}
        </div>
    );
};