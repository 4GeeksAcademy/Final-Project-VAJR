import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
// Importaremos estos componentes que crearemos a continuación
// import { MapView } from "../components/MapView"; 
// import { DoctorSearchCard } from "../components/DoctorSearchCard";

export const DoctorsList = () => {
    const { store } = useGlobalReducer();

    return (
        <div className="container-fluid p-0" style={{ marginTop: "65px" }}>
            <div className="row g-0">
                
                {/* COLUMNA IZQUIERDA: Listado de Doctores */}
                <div className="col-lg-7 col-xl-8 vh-100 overflow-auto p-4 bg-light">
                    <div className="mb-4">
                        <h2 className="fw-bold" style={{ color: "#092F64" }}>Doctors in Venezuela</h2>
                        <p className="text-muted">Find and book appointments with top-rated specialists.</p>
                    </div>

                    {/* Aquí mapearemos los doctores del store */}
                    <div className="d-flex flex-column gap-3">
                        {store.doctors && store.doctors.length > 0 ? (
                            store.doctors.map((doc) => (
                                // Por ahora usamos un placeholder hasta crear el componente real
                                <div key={doc.id} className="card p-3 shadow-sm border-0">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h5>Dr. {doc.name}</h5>
                                            <p className="text-primary mb-0">{doc.specialties}</p>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <span className="badge bg-success">Available</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2">Loading doctors...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Mapa Interactivo (Sticky) */}
                <div className="col-lg-5 col-xl-4 d-none d-lg-block border-start vh-100 sticky-top">
                    {/* Placeholder del Mapa */}
                    <div className="bg-secondary h-100 d-flex align-items-center justify-content-center text-white">
                        <div className="text-center">
                            <i className="fa-solid fa-map-location-dot fa-3x mb-3"></i>
                            <p>Map View Area</p>
                            <small>(Waiting for MapView component)</small>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};