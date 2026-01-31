import React, { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { DoctorCard } from "./DoctorCard.jsx";

export const FoundDoc = () => {
    const { store, dispatch } = useGlobalReducer();
    const BACKEND_URL = "https://ubiquitous-space-rotary-phone-vqpwppxx7q4hwrg9-3001.app.github.dev/"; 

    useEffect(() => {
        const getDoctors = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/doctor`);
                if (!response.ok) throw new Error("Error en el servidor");

                const data = await response.json();
                
                dispatch({
                    type: 'set_doctors',
                    payload: data.msg // Tu app.py usa 'msg' para la lista de doctores
                });
            } catch (error) {
                console.error("Error al obtener doctores:", error);
            }
        };

        getDoctors();
    }, []);

    return (
        <section className="container my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold" style={{ color: "#1a365d" }}>Top Rated Doctors</h2>
                <select className="form-select border-0 shadow-sm w-auto text-primary">
                    <option>All Specialties</option>
                </select>
            </div>

            {/* Scroll horizontal como en tu imagen */}
            <div className="d-flex flex-row overflow-auto pb-3 gap-3" style={{ scrollbarWidth: "none" }}>
                {store.doctors && store.doctors.length > 0 ? (
                    store.doctors.map((doc) => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))
                ) : (
                    <div className="alert alert-info w-100">Cargando especialistas disponibles...</div>
                )}
            </div>

            {/* Barra de scroll estética inferior */}
            <div className="mt-2 bg-light rounded d-flex align-items-center px-2" style={{ height: "12px", width: "100%" }}>
                <i className="fas fa-caret-left text-secondary me-2"></i>
                <div className="bg-secondary rounded-pill" style={{ height: "6px", width: "80%" }}></div>
                <i className="fas fa-caret-right text-secondary ms-2"></i>
            </div>
        </section>
    );
};