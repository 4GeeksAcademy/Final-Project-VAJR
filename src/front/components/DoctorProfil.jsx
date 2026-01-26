import { useEffect } from "react"
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLocationDot, faCalendar } from "@fortawesome/free-solid-svg-icons"

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

        <div className="doctor-card mt-4">
            
                <ul className="doctor-card-ul d-flex justify-content-between overflow-auto overflow-x-auto flex-sm-nowrap">
                    {
                        store.doctors.map((item) =>
                        (
                            <Link to={`/doctorpage/${item.id}`} className="text-decoration-none"  style={{ color: "#121212" }}>
                            
                            <li className="p-3 doctor flex-shrink-0" style={{ width: "338px", borderRadius: "10px" }} key={item.id}>
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
                                    <div className="ms-3 mbs">
                                        <h4> Dr. {item.name} </h4>
                                        <p className="text-center mt-1" style={{ color: "#468BE6" }}>{item.specialties}</p>
                                    </div>

                                </div>
                                <div className="pb-2">
                                    <div className="text-center mbs">
                                        <p className="mb-2 "><span style={{ color: "#468BE6" }}><FontAwesomeIcon icon={faLocationDot} /></span> Location??</p>
                                        <p className="mb-2 fw-semibold " style={{ color: "#27fb8a" }} > <span><FontAwesomeIcon icon={faCalendar} /> </span> New patient appts</p>
                                        <p className="mb-2 ">Next available today:</p>
                                    </div>
                                    <p>Check tomorrow</p>
                                </div>
                                <h5 className="button-card-doctor text-center" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>Book online</h5>


                            </li>
                            </Link>
                        )
                        )
                    }
                </ul>
        </div>
    )
}