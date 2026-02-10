import { useEffect } from "react"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { DashboardStats } from "./DashboardStats"
import { AppointmentsTable } from "./AppointmentsTable"
import './doctorDashboard.css'
import { DoctorProfileCard } from "./DoctorProfileCard"


export const DoctorDashboard = () => {

  const { store, dispatch } = useGlobalReducer()
  const doctor = store.doctor

  const updateAppointmentStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctor/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      })

      if (!res.ok) {
        console.error("Failed update", res.status)
        return
      }

      const data = await res.json()
      const updateAppointment = data.appointment

      if (!updateAppointment) {
        console.error("No appointment returned from backend", data)
        return
      }

      dispatch({
        type: "set_appointments",
        payload: store.appointments.map(apt =>
          apt.id === updateAppointment.id ? updateAppointment : apt
        )
      })

    } catch (error) {
      console.error('Error updating appointment ', error)
    }
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}doctor/appointments`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: "set_appointments",
          payload: data.appointments,
        });
      }
    };

    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="container-dashboard">

      <div className="profile-doc">
        <DoctorProfileCard
          doctor={doctor}
        />
      </div>

      <div className="container-stat mt-5">
        <h2 className="mb-4">Performance overview</h2>

        <DashboardStats appointments={store.appointments} />
        <AppointmentsTable appointments={store.appointments}
          onUpdateStatus={updateAppointmentStatus}
        />
      </div>
    </div>

  )
}
