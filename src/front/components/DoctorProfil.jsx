import { useEffect } from "react"
import useGlobalReducer from "../hooks/useGlobalReducer"
export const DoctorProfile = () => {

    const { store, dispatch } = useGlobalReducer()

    const getDoctor = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctor`)
            if (!response.ok) {
                throw new Error(`${response.status}`)
            }
            const data = await response.json()
            const doctor = data.msg

            dispatch({
                type: 'set_doctor',
                payload: { doctor }
            })

        } catch (error) {
            console.error("Error finding the doctor:", error)
        }
    }

    useEffect(() => {
        getDoctor()
    }, [])

    console.log(store.doctors)
    return (

        <div> from home DoctorProfile</div>
    )
}