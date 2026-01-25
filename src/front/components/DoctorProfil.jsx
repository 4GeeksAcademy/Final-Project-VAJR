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
        <div className="doctor-card row">

            <ul className="doctor-card-ul d-flex justify-content-between">
                {
                    store.doctors.map((item) =>
                    (
                        <li className="p-3 doctor" style={{ width: "338px", borderRadius: "10px" }} key={item.id}>
                            <div className="d-flex ">
                                <img
                                    src={item.picture}
                                    alt="imagen"
                                    style={{
                                        width: "90px",
                                        height: "90px",
                                        borderRadius: "50%",
                                        objectFit: "cover"
                                    }}
                                />
                                <div className="ms-3">
                                    <h4> Dr. {item.name} </h4>
                                    <p className="text-center" style={{ color: "#468BE6" }}>{item.specialties}</p>
                                </div>

                            </div>
                            <div>
                                <div className="text-center">
                                    <p>Location??</p>
                                    <p style={{ color: "#03eb48" }} >New patient appts</p>
                                    <p>Next available today:</p>
                                </div>
                                <p>Check tomorrow</p>
                            </div>
                            <h5 className="button-card-doctor text-center" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>Book online</h5>


                        </li>
                    )
                    )
                }
            </ul>

        </div>
    )
}