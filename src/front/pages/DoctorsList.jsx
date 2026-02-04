import React, { useEffect } from "react"; 
import useGlobalReducer from "../hooks/useGlobalReducer";
import { MapView } from "../components/MapView.jsx";
import { DoctorSearchCard } from "../components/DoctorSearchCard";

export const DoctorsList = () => {
    const { store, dispatch } = useGlobalReducer();
useEffect(() => {
    const fetchDoctors = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/doctor`); 

            if (response.ok) {
                const data = await response.json();
                dispatch({ 
                    type: "set_doctors", 
                    payload: data.msg 
                });
            }
        } catch (error) {
            console.error("Error conectando:", error);
        }
    };
    fetchDoctors();
}, []);

    return (
        <div className="container-fluid p-0" style={{ marginTop: "65px" }}>
            <div className="row g-0">
                <div className="col-lg-7 col-xl-8 vh-100 overflow-auto p-4 bg-light">
                    <div className="mb-4">
                        <h2 className="fw-bold" style={{ color: "#092F64" }}>All </h2>
                        <p className="text-muted">Find and book appointments with top-rated specialists.</p>
                    </div>
                    <div className="d-flex flex-column gap-3">
                        {store.doctors && store.doctors.length > 0 ? (
                            store.doctors.map((doc) => (
                                <DoctorSearchCard key={doc.id} doctor={doc} />
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Searching for specialists in the database...</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-lg-5 col-xl-4 d-none d-lg-block border-start vh-100 sticky-top">
                    <MapView doctors={store.doctors || []} />
                </div>
            </div>
        </div>
    );
};