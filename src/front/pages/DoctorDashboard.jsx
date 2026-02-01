import { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer"



export const DoctorDashboard = () => {

const { store, dispatch } = useGlobalReducer()

useEffect(()=>{
    fetch(`${import.meta.env.VITE_BACKEND_URL}doctor/appointments`, {
        headers:{
            Authorization: `Bearer ${localStorage.getItem(doctorToken)}`
        }
    })
    .then(res => res.json())
    .then(data => {
        dispatch({
            type: "set_appointments",
            payload: data.appointments
        })
    })
},[])

    return(
        <div className="container mt-5">
            <h2 className="mb-4"> Doctor dashboard </h2>

            <DashboardStats  appointment={store.appointments}/>
            <AppointmentsTable appointment={store.appointments} />

        </div>
    )
}