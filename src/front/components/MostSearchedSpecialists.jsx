import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const MostSearchedSpecialists = () => {
    const navigate = useNavigate();

    return (
        <div className="container-fluid p-2" style={{ backgroundColor: "#ffffff" }}>
            <h2 className="ms-5" style={{ color: "#092F64" }}><strong>Top-searched specialties</strong></h2>
            <div className="d-flex justify-content-center my-5">
                <button
                    className="btn mx-3 p-4 rounded-4 fs-4 specialties-button"
                    style={{ backgroundColor: "#E9F5FF", width: "210px" }}
                    onClick={() => navigate('/find-doctors?specialty=Cardiology')}
                >
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/heart-health-3d-icon-png-download-7343436.png"
                        alt="Heart" style={{ height: "100px" }} className="mb-4" /> <br />
                    <strong>Cardiologist</strong>
                </button>
                <button
                    className="btn mx-3 p-4 rounded-4 fs-4 specialties-button"
                    style={{ backgroundColor: "#E9F5FF", width: "210px" }}
                    onClick={() => navigate('/find-doctors?specialty=Orthopedics')}
                >
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/broken-bone-3d-icon-png-download-6561286.png"
                        alt="Heart" style={{ height: "100px" }} className="mb-4" /> <br />
                    <strong>Orthopedist</strong>
                </button>
                <button
                    className="btn mx-3 p-4 rounded-4 fs-4 specialties-button"
                    style={{ backgroundColor: "#E9F5FF", width: "210px" }}
                    onClick={() => navigate('/find-doctors?specialty=Dermatology')}
                >
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/skin-3d-icon-png-download-12223055.png"
                        alt="Heart" style={{ height: "100px" }} className="mb-4" /> <br />
                    <strong>Dermatologist</strong>
                </button>
                <button
                    className="btn mx-3 p-4 rounded-4 fs-4 specialties-button"
                    style={{ backgroundColor: "#E9F5FF", width: "210px" }}
                    onClick={() => navigate('/find-doctors?specialty=General%20Practice')}
                >
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/medicine-bottle-3d-icon-png-download-4995342.png"
                        alt="Heart" style={{ height: "100px" }} className="mb-4" /> <br />
                    <strong>General Practice</strong>
                </button>
                <button
                    className="btn mx-3 p-4 rounded-4 fs-4 specialties-button"
                    style={{ backgroundColor: "#E9F5FF", width: "210px" }}
                    onClick={() => navigate('/find-doctors?specialty=Psychology')}
                >
                    <img src="https://cdn3d.iconscout.com/3d/premium/thumb/brain-operating-3d-icon-png-download-8176333.png"
                        alt="Heart" style={{ height: "100px" }} className="mb-4" /> <br />
                    <strong>Psychologist</strong>
                </button>
            </div>
        </div>
    );
}