import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import { use } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";


export const ListAppointments = () => {
    const { doctor_id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);
    const [DoctorAvailability, setDoctorAvailability] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ dateTime: "", reason: "" })
    const [doctorToReschedule, setDoctorToReschedule] = useState(null);
    const [showCal, setShowCal] = useState(false);
    const [selectedDoctorSlug, setSelectedDoctorSlug] = useState("");
    const [appointmentIdToUpdate, setAppointmentIdToUpdate] = useState(null);
    const [form, setForm] = useState({
        pacient: "",
        doctor: "",
        dateTime: "",
        reason: "",
        status: ""
    });



    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };


    //lista general de paciente 
    const getAppointments = async () => {

        const token = localStorage.getItem("token");
        console.log("Token enviado:", token);

        if (!token) {
            alert("Debes iniciar sesión");
            navigate("/api/pacient/login");
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setAppointments(data);
                //setAppointments([]);
            } else {
                alert(data.msg || "Error en al obtener cita") //cambiar a alertSwe
            }

        } catch (error) {
            console.error("Error de conexion:", error);
        }
    };

    const startEditing = (appt) => {
        setEditingId(appt.id);
        setEditForm({ dateTime: appt.dateTime, reason: appt.reason });
    };



    const handleReschedule = (appt) => {
        if (appt.doctor_cal_username) {
            setSelectedDoctorSlug(appt.doctor_cal_username);
            setAppointmentIdToUpdate(appt.id);
            setEditForm({ reason: appt.reason });
            setShowCal(true);
        } else {
            Swal.fire("Error", "This doctor does not have Cal.com configured.", "warning");
        }
    };

    const deleteAppointments = async (id) => {
        const confirm = await Swal.fire({
            title: 'You are sure?',
            text: "The appointment will be permanently cancelled.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#035aa6',
            cancelButtonColor: '#c7e5f2',
            confirmButtonText: 'Yes, cancel'
        });

        if (confirm.isConfirmed) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                });
                const data = await response.json();

                if (response.ok) {

                    setAppointments(appointments.filter(a => a.id !== id));
                    Swal.fire("Cancelled", "Your appointment has been deleted.", "success");
                } else {
                    alert(data.msg || "Error en al eliminar ") //cambiar a alertSwe
                }
            } catch (error) {
                console.error("Error de conexión:", error);

            }
        }
    };


    const handleAutoUpdate = async (newDate) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appointmentIdToUpdate}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    dateTime: newDate,
                    reason: editForm.reason
                })
            });

            if (response.ok) {
                setShowCal(false);
                getAppointments();
                Swal.fire("Updated!", "Your appointment has been moved successfully.", "success");
            }
        } catch (error) {
            console.error("Error actualizando:", error);
        }
    };

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "light",
                hideEventTypeDetails: true, // Ayuda a evitar el error de markdownToSafeHTML
                layout: "month_view"
            });
            cal("on", {
                action: "bookingSuccessful",
                callback: (e) => {
                    console.log("Successful reservation detected:", e.detail);
                    const newStartTime = e.detail.booking.startTime;
                    handleAutoUpdate(newStartTime);
                },
            });
        })();
    }, [appointmentIdToUpdate, editForm.reason]);

    useEffect(() => {
        getAppointments();

    }, []);


    return (
        <div className="container mt-5" style={{ maxWidth: "800px" }}>

            {appointments.length > 0 && (
                <div className="card mb-4 border-0 shadow-sm" style={{ backgroundColor: "#c7e5f2", color: "#035aa6", borderRadius: "15px" }}>
                    <div className="card-body p-4">
                        <h3 className="mb-0 fw-bold">{appointments[0].pacient_name}</h3>
                        <p className="mb-0 opacity-75">{appointments[0].pacient_email}</p>
                    </div>
                </div>
            )}

            <h2 className="mb-4 fw-bold" style={{ color: "#035aa6" }}>My Appointments</h2>

            {appointments.length === 0 ? (
                <div>
                    <p className="text-muted">You have no appointments.</p>
                    <button className="btn btn-primary" onClick={() => navigate("/")}>Book now</button>
                </div>
            ) : (
                appointments.map((appt, index) => (
                    <div key={appt.id} className="d-flex justify-content-between align-items-center p-3 mb-3 border rounded bg-white shadow-sm">
                        <div>
                            <small className="text-muted">Appointment #{index + 1}</small>
                            <h6 className="fw-bold">Dr. {appt.doctor_name}</h6>
                            <p className="mb-1 text-muted">Reason: {appt.reason}</p>
                            <small className="text-secondary">{new Date(appt.dateTime).toLocaleString()}</small>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-primary btn-sm px-3" onClick={() => handleReschedule(appt)}>
                                <i className="fa-solid fa-clock-rotate-left"></i> Reschedule
                            </button>
                            <button className="btn btn-outline-danger btn-sm px-3" onClick={() => deleteAppointments(appt.id)}>
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))
            )}


            {showCal && (
                <div className="modal d-block shadow" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "15px" }}>
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Modificar Cita</h5>
                                <button className="btn-close" onClick={() => setShowCal(false)}></button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="p-4 border-bottom bg-light">
                                    <label className="form-label fw-bold">¿Por qué motivo deseas modificar la cita?</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ej: Seguimiento de tratamiento"
                                        value={editForm.reason}
                                        onChange={(e) => setEditForm({ reason: e.target.value })}
                                    />
                                    <small className="text-primary">Después de escribir el motivo, elige la nueva fecha abajo:</small>
                                </div>
                                <div style={{ height: "500px", overflowY: "auto" }}>
                                    <Cal
                                        namespace="30min"
                                        calLink={selectedDoctorSlug}
                                        style={{ width: "100%", height: "100%" }}
                                        config={{
                                            layout: "month_view",
                                            theme: "light",
                                            name: store.pacient?.name,
                                            email: store.pacient?.email,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}