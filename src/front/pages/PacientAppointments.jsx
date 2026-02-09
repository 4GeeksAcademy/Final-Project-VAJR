
import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import Swal from "sweetalert2";
import Cal, { getCalApi } from "@calcom/embed-react";



export const PacientAppointments = () => {
    const { doctor_id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);

    const [selectedSlot, setSelectedSlot] = useState("");
    const [doctorAvailability, setDoctorAvailability] = useState([]);
    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({
        pacient: "",
        doctor: "",
        dateTime: "",
        reason: "",
        status: ""
    });
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };


    useEffect(() => {

        const doctorData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/${doctor_id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                        //  "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },

                });
                if (response.ok) {
                    const data = await response.json();

                    setDoctor(data.data || data);
                } else {
                    console.error("Error al obtener doctor");
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            } finally {
                setLoading(false);
            }
        };
        if (doctor_id) doctorData();
    }, [doctor_id]);

    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "light",
                cssVarsPerTheme: { light: { "cal-brand": "#092F64" }, dark: { "cal-brand": "#092F64" } },
                hideEventTypeDetails: true,
                layout: "month_view"
            });
            cal("on", {
                action: "bookingSuccessful",
                callback: (e) => {
                    console.log("Booking on Cal.com successful:", e.detail);
                    handleBookingSuccess(e.detail.booking);
                }
            });
        })();
    }, [doctor]);//para reiniciar al cambiar doctor






    const handleBookingSuccess = async (bookingDetails) => {

        const token = localStorage.getItem("token");

        if (!token) {
            Swal.fire("Log in", "You must be logged in to book", "warning");
            return navigate("/api/pacient/login");

        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    doctor_id: doctor_id,
                    dateTime: bookingDetails.startTime,
                    reason: form.reason || "General consultation",
                    cal_booking_id: bookingDetails.uid
                })
            });

            if (response.ok) {
                Swal.fire({
                    title: "Appointment registered!",
                    text: "The appointment has been successfully saved to your history.",
                    icon: "success",
                    confirmButtonText: "See my appointments",
                    confirmButtonColor: "#035aa6"
                }).then((result) => {
                    if (result.isConfirmed) navigate("/listappointments");
                });
            } else {
                const errorData = await response.json();
                Swal.fire("Error", errorData.msg || "Error al guardar en BD", "error");
            }
        } catch (error) {
            console.error("Error guardando cita:", error);
        }
    };


    return (
        <div className="container py-4">
            <div className="card shadow-sm mx-auto" style={{ maxWidth: "500px" }}>
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold" style={{ color: "#035aa6" }}>Book an appointment</h5>
                    <button type="button" className="btn-close" onClick={() => navigate(-1)}></button>
                </div>

                <div className="card-body">

                    {doctor && (
                        <div className="d-flex align-items-center mb-4 p-2 border-bottom">
                            <img
                                src={doctor.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                                alt={doctor.name}
                                className="rounded-circle me-3"
                                style={{ width: "60px", height: "60px", objectFit: "cover" }}
                            />
                            <div>
                                <h6 className="mb-0 fw-bold">Doctor</h6>
                                <h6 className="mb-0 fw-bold">{doctor.name}</h6>
                                <p><small className="text-muted">{doctor.specialties || "Especialista"}</small></p>

                            </div>
                        </div>
                    )}
                    {store.pacient && (
                        <div className="mb-3 p-2 border rounded bg-light">
                            <p className="mb-1">
                                <strong>Patient:</strong> {store.pacient.name}
                            </p>
                            <p className="mb-0">
                                <strong>Email:</strong> {store.pacient.email}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="form-label fw-semibold">Reason for the consultation:</label>
                        <textarea
                            className="form-control" rows="3" name="reason"
                            value={form.reason} onChange={handleChange} placeholder="Please briefly describe the reason for your inquiry..." required />
                    </div >

                    {!localStorage.getItem("token") ? (
                        <div className="alert alert-warning text-center">
                            <i className="fa-solid fa-lock fs-3 mb-2"></i>
                            <p className="mb-2">You must be logged in to book an appointment</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate("/api/pacient/login")}
                            >
                                Log in
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary"></div>
                            <p>Loading calendar...</p>
                        </div>
                    ) : doctor?.cal_username ? (
                        <div style={{ height: "450px" }}>
                            <Cal
                                namespace="30min"
                                calLink={`${doctor.cal_username}/30min`}
                                style={{ width: "100%", height: "100%" }}
                                config={{
                                    theme: "light",
                                    layout: "month_view",
                                    bookingData: {
                                        name: store.pacient?.name,
                                        email: store.pacient?.email
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="alert alert-warning text-center">
                            This doctor does not have a schedule yet.
                        </div>
                    )}

                </div>
            </div>
        </div>

    );
};