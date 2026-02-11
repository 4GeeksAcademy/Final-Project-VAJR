import Swal from "sweetalert2";
import { useState } from "react";

export const DoctorProfileCard = ({ doctor }) => {

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/   \/$/, '');
    if (!doctor) return null

    const handleSyncCal = async () => {
        setSyncing(true);
        try {
            
            const response = await fetch(`${backendUrl}/api/doctor/${doctor.id}/sync-cal`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    title: "Sincronizado",
                    text: "El horario se ha enviado correctamente a Cal.com",
                    icon: "success",
                    confirmButtonColor: "#092F64"
                });
            } else {
                Swal.fire("Error", data.msg || "No se pudo sincronizar", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Fallo de conexión con el servidor", "error");
        } finally {
            setSyncing(false);
        }
    };

    const handleUpdateSchedule = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Availability Schedule',
            html:
                `<div class="text-start">
                    <p class="small text-muted mb-3 text-center">Set the working days and hours for your availability.</p>
                    <label class="form-label fw-bold">Working days</label>
                    <input id="swal-days" class="swal2-input" placeholder="Ej: Monday Tuesday Friday" value="Monday Tuesday Wednesday Thursday Friday">
                    
                    <label class="form-label mt-3 fw-bold">Start Time (24h)</label>
                    <input id="swal-start" type="time" class="swal2-input" value="08:00">
                    
                    <label class="form-label mt-3 fw-bold">End Time (24h)</label>
                    <input id="swal-end" type="time" class="swal2-input" value="18:00">
                </div>`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar y Sincronizar',
            confirmButtonColor: '#092F64',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const days = document.getElementById('swal-days').value;
                const start = document.getElementById('swal-start').value;
                const end = document.getElementById('swal-end').value;
                if (!days || !start || !end) {
                    Swal.showValidationMessage('Por favor completa todos los campos');
                }
                return { days, start, end };
            }
        });

        if (formValues) {
            setSyncing(true);
            try {
                // Esta petición PUT hace todo: crea/edita en DB local y sincroniza con Cal.com
                const response = await fetch(`${backendUrl}/api/doctor/${doctor.id}/edit-availability`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formValues)
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire({
                        title: "¡Éxito!",
                        text: "Tu horario ha sido guardado y sincronizado correctamente.",
                        icon: "success",
                        confirmButtonColor: "#092F64"
                    });
                } else {
                    Swal.fire("Error", data.msg || "No se pudo procesar la solicitud", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Fallo de conexión con el servidor", "error");
            } finally {
                setSyncing(false);
            }
        }
    };

    return (
        <div className="doctor-profile-card">
            <img
                src={doctor.picture}
                alt="Doctor"
                className="doctor-avatar"
            />

            <h5 className="mt-3">Dr. {doctor.name}</h5>
            <p className="text-primary">{doctor.specialties}</p>

            <div className="d-grid gap-2">
                {/* BOTÓN DE EDICIÓN */}
                <button
                    onClick={handleUpdateSchedule}
                    className="btn btn-outline-primary mb-2"
                    disabled={syncing}
                >
                    <i className="fa-solid fa-pen-to-square me-2"></i>
                    {syncing ? "Procesando..." : "Edit availability"}
                </button>

                {/* BOTÓN DE SINCRONIZACIÓN INICIAL (Ahora hace lo mismo) */}
                <button
                    onClick={handleUpdateSchedule}
                    disabled={syncing}
                    className="btn btn-dark"
                >
                    <i className="fa-solid fa-rotate me-2"></i>
                    {syncing ? "Sincronizando..." : "Schedule Sync"}
                </button>

                <small className="text-muted" style={{ fontSize: "0.7rem" }}>
                    * Configura o actualiza tu horario para habilitar las citas online.
                </small>
            </div>
        </div>

    )
} 