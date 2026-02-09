import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Cal, { getCalApi } from "@calcom/embed-react";
import "../index.css";

export const PacientAppointments = () => {
    const navigate = useNavigate();
    const { store } = useGlobalReducer();
    const [specialties, setSpecialties] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState("");
    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({ reason: "" });
    const [loading, setLoading] = useState(true);

    // Inicializar Cal.com globalmente
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


    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("on", {
                action: "bookingSuccessful",
                callback: async (event) => {
                   
                    Swal.fire({
                        title: "¡Cita Agendada!",
                        text: "Tu cita se ha registrado correctamente.",
                        icon: "success",
                        confirmButtonText: "Ver mis citas",
                        confirmButtonColor: "#035aa6",
                        showCancelButton: false,
                        allowOutsideClick: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate("/pacient/listappointments");
                        }
                    });
                },
            });
        })();
    }, [navigate]);

    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor`, {
                    mode: 'cors',
                    headers: { 'Accept': 'application/json' }
                });
                if (!response.ok) throw new Error("Error fetching doctors");
                const data = await response.json();
                const doctors = Array.isArray(data.msg) ? data.msg : data.data || [];
                setDoctorsList(doctors);
                setSpecialties([...new Set(doctors.map((d) => d.specialties))]);
            } catch (error) {
                console.error("Fetch doctors error:", error);
                Swal.fire("Error", "Cannot load doctors. Please check your connection.", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

 
    useEffect(() => {
        if (!selectedDoctorId) {
            setDoctor(null);
            return;
        }
        const doctorData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/${selectedDoctorId}`, {
                    mode: 'cors',
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDoctor(data.data || data);
                }
            } catch (error) {
                console.error("Error fetching doctor:", error);
            } finally {
                setLoading(false);
            }
        };
        doctorData();
    }, [selectedDoctorId]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleBookClick = (e) => {
        if (!doctor?.cal_link) {
            e.preventDefault();
            Swal.fire({ 
                icon: "info", 
                title: "Not Available", 
                text: "This doctor hasn't linked their calendar yet", 
                confirmButtonColor: "#035aa6" 
            });
            return;
        }
        if (!form.reason.trim()) {
            e.preventDefault();
            Swal.fire({ 
                icon: "warning", 
                title: "Missing Information", 
                text: "Please enter a reason for the appointment", 
                confirmButtonColor: "#035aa6" 
            });
            return;
        }
    };

    const filteredDoctors = selectedSpecialty
        ? doctorsList.filter((d) => d.specialties === selectedSpecialty)
        : [];

    return (
        <div className="appt-root">
            <div className="appt-container">
                <div className="appt-wrapper">
                    
                    {/* Header */}
                    <div className="appt-header">
                        <div className="appt-header-body">
                            <div className="appt-header-content">
                                <div className="appt-header-info">
                                    <div className="appt-header-icon">
                                        <i className="fa-solid fa-calendar-plus"></i>
                                    </div>
                                    <div className="appt-header-text">
                                        <h5>Book Appointment</h5>
                                        <small>Select specialty and doctor</small>
                                    </div>
                                </div>
                                <button type="button" className="appt-btn-close" onClick={() => navigate(-1)}>
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                        </div>
                    </div>

           
                    <div className="appt-card">
                        <div className="appt-card-body">
                            
                            {/* Specialty */}
                            <div className="appt-form-group">
                                <label className="appt-label">
                                    <i className="fa-solid fa-stethoscope"></i>
                                    Specialty
                                </label>
                                <select
                                    className="appt-select"
                                    value={selectedSpecialty}
                                    onChange={(e) => {
                                        setSelectedSpecialty(e.target.value);
                                        setSelectedDoctorId("");
                                        setDoctor(null);
                                    }}
                                >
                                    <option value="">Select specialty</option>
                                    {specialties.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                    
                            {selectedSpecialty && (
                                <div className="appt-form-group">
                                    <label className="appt-label">
                                        <i className="fa-solid fa-user-doctor"></i>
                                        Doctor
                                    </label>
                                    <select
                                        className="appt-select"
                                        value={selectedDoctorId}
                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                    >
                                        <option value="">Select a doctor</option>
                                        {filteredDoctors.map((doc) => (
                                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                     
                            {doctor && (
                                <div className="appt-doctor-info appt-slide-up">
                                    <img
                                        src={doctor.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png "}
                                        alt={doctor.name}
                                        className="appt-doctor-avatar"
                                    />
                                    <div>
                                        <h6 className="appt-doctor-name">{doctor.name}</h6>
                                        <p className="appt-doctor-specialty">{doctor.specialties}</p>
                                    </div>
                                </div>
                            )}

                  
                            <div className="appt-form-group">
                                <label className="appt-label">
                                    <i className="fa-solid fa-clipboard-list"></i>
                                    Reason for appointment
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    className="appt-input"
                                    placeholder="e.g., Check-up, follow-up"
                                    value={form.reason}
                                    onChange={handleChange}
                                />
                            </div>

                       
                            {doctor && (
                                <div className="appt-d-grid">
                                    <button
                                        data-cal-link={doctor.cal_link}
                                        data-cal-config={`{"layout":"month_view","theme":"light","name":"${store.pacient?.name || ''}","email":"${store.pacient?.email || ''}"}`}
                                        className="appt-btn-primary"
                                        onClick={handleBookClick}
                                    >
                                        <i className="fa-solid fa-calendar-check appt-me-2"></i>
                                        Select Date & Time
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};