import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useEffect, useState } from "react";
import { use } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";
import HiDoc from "../assets/img/HiDoc.png"

export const ListAppointments = () => {
    const { doctor_id } = useParams();
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer();
    const [appointments, setAppointments] = useState([]);
    const [showCal, setShowCal] = useState(false);
    const [selectedDoctorSlug, setSelectedDoctorSlug] = useState("");
    const [appointmentIdToUpdate, setAppointmentIdToUpdate] = useState(null);
    const [editForm, setEditForm] = useState({ reason: "" });
    const [loading, setLoading] = useState(true);

    const pacientName = store.pacient?.name || "Paciente";
    const pacientEmail = store.pacient?.email || "";

    const colors = {
        primary: "#035aa6",
        secondary: "#c7e5f2",
        accent: "#18aded",
        white: "#ffffff",
        light: "#f8fbfd"
    };

    const downloadPDF = (appt) => {
        const doc = new jsPDF();
        const dateObj = new Date(appt.dateTime);

        //cabecara ---
        doc.setFillColor(3, 90, 166); // Blue color (#035aa6)
        doc.rect(0, 0, 210, 40, "F");

        // Doctor Icon 
        doc.addImage(HiDoc, 'PNG', 15, 8, 22, 22);
        // hiDOC
        doc.setFontSize(26);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("hiDOC", 38, 23);

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text("Medical Appointment Summary", 38, 32);

        //pacient inf
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text("PATIENT INFORMATION", 20, 55);

        doc.setFont("helvetica", "normal");
        doc.text(`Name: ${pacientName}`, 20, 65);
        doc.text(`Email: ${pacientEmail}`, 20, 72);

        //linea
        doc.setDrawColor(199, 229, 242);
        doc.line(20, 80, 190, 80);

        // ---consulta detalle---
        doc.setFont("helvetica", "bold");
        doc.text("APPOINTMENT DETAILS", 20, 95);

        doc.setFont("helvetica", "normal");
        doc.text(`Doctor: Dr. ${appt.doctor_name}`, 20, 105);
        doc.text(`Date: ${dateObj.toLocaleDateString('en-US')}`, 20, 112);
        doc.text(`Time: ${dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, 20, 119);
        doc.text(`Reason: ${appt.reason}`, 20, 126);

        // --- pie---
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.setDrawColor(230, 230, 230);
        doc.line(20, 140, 190, 140); // Decorative line

        doc.text("Please arrive 10 minutes prior to your scheduled time.", 20, 150);

        doc.setFont("helvetica", "italic");
        doc.text("Thank you for choosing hiDOC for your healthcare needs.", 20, 165);

        // descarga 
        doc.save(`hiDOC_Appt_${appt.id}.pdf`);
    }

    const getAppointments = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
            Swal.fire({
                icon: "warning",
                title: "Session Expired",
                text: "Please log in again",
                confirmButtonColor: colors.primary
            });
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
            console.log("Datos recibidos:", data);

            if (response.ok) {
                setAppointments(data);

                if (!store.pacient && data.length > 0) {
                    dispatch({
                        type: "login_pacient",
                        payload: {
                            pacient: {
                                name: data[0].pacient_name,
                                email: data[0].pacient_email
                            },
                            token: token
                        }
                    });
                }
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Could not load appointments",
                confirmButtonColor: colors.primary
            });
        } finally {
            setLoading(false);
        }
    };

    const deleteAppointments = async (id) => {
        const result = await Swal.fire({
            title: "Cancel Appointment?",
            text: "This action cannot be undone",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: colors.accent,
            cancelButtonColor: colors.secondary,
            confirmButtonText: "Yes, cancel",
            cancelButtonText: "Keep it",
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${id}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.ok) {
                    setAppointments((prev) =>
                        prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a)
                    );

                    Swal.fire({
                        icon: "success",
                        title: "Cancelled",
                        text: "Your appointment has been cancelled",
                        confirmButtonColor: colors.primary,
                        timer: 2000
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not cancel appointment",
                    confirmButtonColor: colors.primary
                });
            }
        }
    };

    const handleRescheduleAndCancel = async (appt) => {

        const result = await Swal.fire({
            title: "Reschedule Appointment?",
            text: "The current appointment will be cancelled and a new one will be created",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: colors.accent,
            cancelButtonColor: colors.secondary,
            confirmButtonText: "Yes, reschedule",
            cancelButtonText: "Keep it",
            reverseButtons: true
        });

        if (result.isConfirmed) {

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appt.id}`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (response.ok) {

                    setAppointments(prev =>
                        prev.map(a => a.id === appt.id ? { ...a, status: "cancelled" } : a)
                    );

                    setSelectedDoctorSlug(appt.cal_link);
                    setAppointmentIdToUpdate(null); // No vamos a actualizar, es una nueva cita
                    setEditForm({ reason: appt.reason });
                    setShowCal(true);

                    Swal.fire({
                        icon: "success",
                        title: "Reschedule",
                        text: "Please select a new time for your appointment",
                        confirmButtonColor: colors.primary
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Could not cancel appointment",
                    confirmButtonColor: colors.primary
                });
            }
        }
    };

    useEffect(() => {
        let cal;
        (async function initCal() {
            cal = await getCalApi();
            cal("ui", {
                theme: "light",
                hideEventTypeDetails: true,
                layout: "month_view"
            });

            cal("on", {
                action: "bookingSuccessful",
                callback: (event) => {
                    const newStartTime = event.detail?.data?.startTime;
                    if (newStartTime && appointmentIdToUpdate) {
                        handleAutoUpdate(newStartTime);
                    }
                },
            });
        })();
    }, [appointmentIdToUpdate]);

    const handleAutoUpdate = async (newDate) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${appointmentIdToUpdate}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                        dateTime: newDate,
                        reason: editForm.reason
                    })
                }
            );

            if (response.ok) {
                setShowCal(false);
                setAppointmentIdToUpdate(null);
                await getAppointments();

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Your appointment has been rescheduled",
                    confirmButtonColor: colors.primary
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "There was a problem updating your appointment",
                confirmButtonColor: colors.primary
            });
        }
    };

    useEffect(() => {
        getAppointments();
    }, []);

    const AppointmentCard = ({ appt, index }) => {
        const dateObj = new Date(appt.dateTime);
        const isToday = new Date().toDateString() === dateObj.toDateString();
        const isPast = dateObj < new Date() && !isToday;

    

        return (
            <div className="card mb-3 border-0 shadow-sm"
                style={{ borderRadius: "12px", transition: "all 0.2s ease" }}>
                <div className="card-body p-3">
                    <div className="d-flex align-items-center gap-3">
                        {/* Fecha compacta */}
                        <div className="text-center px-3 py-2 text-white"
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                                borderRadius: "10px",
                                minWidth: "70px"
                            }}>
                            <div className="fw-bold" style={{ fontSize: "1.5rem", lineHeight: "1" }}>
                                {dateObj.getDate()}
                            </div>
                            <small className="text-uppercase" style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                                {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                            </small>
                        </div>


                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h6 className="mb-1 fw-bold text-truncate" style={{ color: colors.primary, fontSize: "1rem" }}>
                                        Dr. {appt.doctor_name}
                                    </h6>
                                    <p className="mb-0 text-truncate" style={{ color: colors.accent, fontSize: "0.8rem" }}>
                                        <i className="fa-solid fa-stethoscope me-1" style={{ fontSize: "0.75rem" }}></i>
                                        {appt.specialty || "General Medicine"}
                                    </p>
                                    <small className="text-muted" style={{ fontSize: "0.75rem" }}>
                                        <i className="fa-regular fa-clock me-1"></i>
                                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        {isToday && <span className="badge ms-2" style={{ backgroundColor: colors.accent, fontSize: "0.6rem" }}>TODAY</span>}
                                    </small>
                                </div>

                                <div className="d-flex gap-1">
                                    <button
                                        className="btn btn-sm p-1" onClick={() => handleRescheduleAndCancel(appt)} disabled={isPast}
                                        style={{
                                            backgroundColor: colors.secondary, color: colors.primary, border: "none", width: "32px", height: "32px", borderRadius: "8px"
                                        }}
                                        title="Reschedule"
                                    >
                                        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: "0.8rem" }}></i>
                                    </button>
                                    <button
                                        className="btn btn-sm p-1"
                                        onClick={() => deleteAppointments(appt.id)}
                                        disabled={isPast}
                                        style={{
                                            backgroundColor: "#fee2e2",
                                            color: "#dc2626",
                                            border: "none",
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px"
                                        }}
                                        title="Cancel"
                                    >
                                        <i className="fa-solid fa-trash" style={{ fontSize: "0.8rem" }}></i>
                                    </button>
                                    <button
                                        className="btn btn-sm p-1"
                                        onClick={() => downloadPDF(appt)}
                                        style={{
                                            backgroundColor: colors.accent,
                                            color: "white",
                                            border: "none",
                                            width: "32px",
                                            height: "32px",
                                            borderRadius: "8px"
                                        }}
                                        title="Download PDF"
                                    >
                                        <i className="fa-solid fa-download" style={{ fontSize: "0.8rem" }}></i>
                                    </button>
                                </div>
                            </div>


                            <div className="mt-2 p-2"
                                style={{
                                    backgroundColor: colors.light,
                                    borderRadius: "6px",
                                    borderLeft: `3px solid ${colors.accent}`
                                }}>
                                <small className="text-muted" style={{ fontSize: "0.7rem" }}>Reason:</small>
                                <p className="mb-0 text-truncate" style={{ color: colors.primary, fontSize: "0.8rem" }}>
                                    {appt.reason}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EmptyState = () => (
        <div className="text-center py-5">
            <div className="mb-3 p-3 d-inline-block rounded-circle" style={{ backgroundColor: colors.secondary }}>
                <i className="fa-regular fa-calendar-xmark fa-3x" style={{ color: colors.primary }}></i>
            </div>
            <h5 className="mb-2" style={{ color: colors.primary }}>No appointments</h5>
            <p className="mb-3 text-muted" style={{ fontSize: "0.9rem" }}>Schedule your first appointment</p>
            <button
                className="btn btn-sm px-4 py-2"
                onClick={() => navigate("/find-doctors")}
                style={{
                    backgroundColor: colors.accent,
                    color: "white",
                    borderRadius: "20px",
                    fontWeight: "600",
                    border: "none"
                }}
            >
                <i className="fa-solid fa-plus me-2"></i>
                Book Now
            </button>
        </div>
    );

    const LoadingSkeleton = () => (
        <div className="card mb-3 border-0 shadow-sm" style={{ borderRadius: "12px" }}>
            <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="placeholder-glow">
                        <div className="placeholder rounded" style={{ width: "70px", height: "60px", backgroundColor: colors.secondary }}></div>
                    </div>
                    <div className="flex-grow-1 placeholder-glow">
                        <span className="placeholder col-5 rounded" style={{ backgroundColor: colors.secondary }}></span>
                        <span className="placeholder col-3 ms-2 rounded" style={{ backgroundColor: colors.secondary, opacity: 0.5 }}></span>
                        <span className="placeholder col-12 mt-2 rounded" style={{ backgroundColor: colors.secondary, height: "12px" }}></span>
                    </div>
                </div>
            </div>
        </div>
    );

    const activeAppointments = appointments.filter(appt => appt.status !== "cancelled");

    return (
        <div className="min-vh-100 py-4" style={{ backgroundColor: colors.white }}>
            <div className="container" style={{ maxWidth: "800px" }}>


                <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: "15px", backgroundColor: colors.primary }}>
                    <div className="card-body p-3 text-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-white bg-opacity-25 rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                                    <i className="fa-solid fa-user fa-lg"></i>
                                </div>
                                <div>
                                    <h5 className="mb-0 fw-bold">{pacientName}</h5>
                                    <small style={{ opacity: 0.8 }}>{pacientEmail}</small>
                                </div>
                            </div>
                            <div className="text-center px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: "10px" }}>
                                <small style={{ fontSize: "0.7rem", opacity: 0.9 }}>TODAY</small>
                                <div className="fw-bold" style={{ fontSize: "1.2rem", lineHeight: "1" }}>
                                    {new Date().getDate()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h4 className="mb-0 fw-bold" style={{ color: colors.primary }}>My Appointments</h4>
                        <small className="text-muted">{activeAppointments.length} upcoming</small>
                    </div>
                    <button
                        className="btn btn-sm px-3 py-2 d-flex align-items-center gap-2"
                        onClick={() => navigate("/api/pacient/appointments")}
                        style={{
                            backgroundColor: colors.accent,
                            color: "white",
                            borderRadius: "20px",
                            fontWeight: "600",
                            border: "none"
                        }}
                    >
                        <i className="fa-solid fa-plus"></i>
                        <span className="d-none d-sm-inline">New</span>
                    </button>
                </div>

                {/* Lista de citas */}
                {loading ? (
                    <>
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                    </>
                ) : activeAppointments.length === 0 ? (
                    <div className="card border-0 shadow-sm" style={{ borderRadius: "15px" }}>
                        <EmptyState />
                    </div>
                ) : (
                    <div>
                        {activeAppointments.map((appt, index) => (
                            <AppointmentCard key={appt.id} appt={appt} index={index} />
                        ))}
                    </div>
                )}

                {showCal && (
                    <div className="modal show d-block" style={{ backgroundColor: "rgba(3, 90, 166, 0.5)" }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                            <div className="modal-content border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
                                <div className="modal-header border-0 text-white py-3" style={{ backgroundColor: colors.primary }}>
                                    <h6 className="modal-title fw-bold mb-0">
                                        <i className="fa-solid fa-calendar-pen me-2"></i>
                                        Reschedule
                                    </h6>
                                    <button
                                        type="button" className="btn-close btn-close-white" onClick={() => setShowCal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body p-0">
                                    <div className="p-3 border-bottom" style={{ backgroundColor: colors.secondary }}>
                                        <label className="form-label fw-bold small" style={{ color: colors.primary }}>
                                            Reason for rescheduling
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm border-0"
                                            placeholder="e.g., Conflict with schedule"
                                            value={editForm.reason}
                                            onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                                            style={{ borderRadius: "8px" }}
                                        />
                                    </div>
                                    <div style={{ height: "400px" }}>
                                        <Cal
                                            calLink={selectedDoctorSlug}
                                            style={{ width: "100%", height: "100%" }}
                                            config={{
                                                layout: "month_view",
                                                theme: "light",
                                                name: pacientName,
                                                email: pacientEmail,
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer py-2" style={{ backgroundColor: colors.secondary }}>
                                    <button
                                        type="button"
                                        className="btn btn-sm px-3"
                                        onClick={() => setShowCal(false)}
                                        style={{
                                            backgroundColor: colors.white, color: colors.primary, borderRadius: "8px", fontWeight: "600"
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0.5rem 1rem rgba(3, 90, 166, 0.1) !important;
                }
                .btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
            `}</style>
        </div>
    );
};
