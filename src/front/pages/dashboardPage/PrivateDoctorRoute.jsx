import { Navigate } from "react-router-dom"

export const PrivateDoctorRoute = ({ children }) => {

    const token = localStorage.getItem("doctorToken")

    if(!token){
        return <Navigate to="/doctor/login" />
    }
    return children
}
