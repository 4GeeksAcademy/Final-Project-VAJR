import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { MapView } from "../components/MapView.jsx";
import { DoctorSearchCard } from "../components/DoctorSearchCard";

// 1. IMPORTAMOS EL CSS AQUÍ
import "./DoctorsList.css"; 

export const DoctorsList = () => {
    const { store, dispatch } = useGlobalReducer();
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("Todas");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/doctor`); 
                if (response.ok) {
                    const data = await response.json();
                    dispatch({ 
                        type: "set_doctors", 
                        payload: Array.isArray(data.msg) ? data.msg : [] 
                    });
                }
            } catch (error) {
                console.error("Error conectando:", error);
            }
        };
        fetchDoctors();
    }, []);

    const uniqueSpecialties = ["Todas", ...new Set(store.doctors?.map(doc => doc.specialties).filter(s => s))];

    const filteredDoctors = store.doctors?.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === "Todas" || doc.specialties === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    }) || [];

    return (
        <div className="doctors-layout-wrapper">
            <div className="search-header w-100">
                <div className="row align-items-center">
                    <div className="col-md-4 mb-3 mb-md-0">
                        <h4 className="search-title">Doctors Network</h4>
                        <small className="search-subtitle">
                            {store.doctors.length === 0 ? "Conectando..." : `${filteredDoctors.length} doctores disponibles`}
                        </small>
                    </div>
                    <div className="col-md-8">
                        <div className="row g-2">
                            <div className="col-md-7">
                                <div className="input-group modern-search-bar">
                                    <span className="input-group-text border-0 bg-transparent ps-2">
                                        <i className="fa-solid fa-magnifying-glass search-icon"></i>
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control form-control-clean" 
                                        placeholder="Buscar por nombre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
            
                            <div className="col-md-5">
                                <div className="input-group modern-search-bar">
                                    <span className="input-group-text border-0 bg-transparent ps-2">
                                        <i className="fa-solid fa-stethoscope search-icon"></i>
                                    </span>
                                    <select 
                                        className="form-select form-select-clean" 
                                        value={selectedSpecialty}
                                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                                    >
                                        {uniqueSpecialties.map((spec, index) => (
                                            <option key={index} value={spec}>
                                                {spec === "Todas" ? "Todas las especialidades" : spec}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row g-0 doctors-content-area">
                <div className="col-lg-7 col-xl-8 doctors-list-column p-4">
                    <div className="mx-auto" style={{ maxWidth: "900px" }}>
                        
                        {store.doctors && store.doctors.length === 0 ? (
                            <div className="text-center py-5 mt-5">
                                <div className="spinner-border loading-spinner" role="status"></div>
                                <p className="mt-3 text-muted">Cargando base de datos médica...</p>
                            </div>
                        ) : filteredDoctors.length > 0 ? (
                            <div className="d-flex flex-column gap-3">
                                {filteredDoctors.map((doc) => (
                                    <DoctorSearchCard key={doc.id} doctor={doc} />
                                ))}
                                <div style={{ height: "80px" }}></div>
                            </div>
                        ) : (
                            <div className="empty-state-card mt-5">
                                <div className="mb-3 p-3 rounded-circle d-inline-block bg-light">
                                    <i className="fa-solid fa-user-doctor fa-3x text-muted opacity-50"></i>
                                </div>
                                <h4 className="fw-bold text-dark">No hay resultados</h4>
                                <p className="text-muted">Intenta con otro nombre o especialidad.</p>
                                <button 
                                    className="btn-pill-primary"
                                    onClick={() => {setSearchTerm(""); setSelectedSpecialty("Todas")}}
                                >
                                    Ver todos
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-lg-5 col-xl-4 d-none d-lg-block map-column">
                    <MapView doctors={filteredDoctors} />
                </div>
            </div>
        </div>
    );
};