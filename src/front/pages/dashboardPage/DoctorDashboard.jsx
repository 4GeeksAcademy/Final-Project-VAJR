import { useEffect } from "react"
import useGlobalReducer from "../../hooks/useGlobalReducer"
import { DashboardStats } from "./DashboardStats"
import { AppointmentsTable } from "./AppointmentsTable"

export const DoctorDashboard = () => {

  const { store, dispatch } = useGlobalReducer()

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctor/appointments`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("doctorToken")}`
          }
        })

        if (!res.ok) {
          console.error("Error fetching appointments", res.status)
          return
        }

        const data = await res.json()
        dispatch({
          type: "set_appointments",
          payload: data.appointments
        })
      } catch (err) {
        console.error("Network error:", err)
      }
    }

    fetchAppointments()
  }, [])

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Doctor Dashboard</h2>

      <DashboardStats appointments={store.appointments} />
      <AppointmentsTable appointments={store.appointments} />
    </div>
  )
}
