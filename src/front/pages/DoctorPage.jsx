import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { Biography } from "./Biography"

export const DoctorPage = () => {

    const { doctorId } = useParams()
    const { store } = useGlobalReducer

    const [doctor, setDoctor] = useState({})
    const [filtraDoctorRelate, setFiltraDoctorRelate] = useState([])

    const getDoctor = async () => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctor/${doctorId}`)
        const data = await response.json()
        setDoctor(data.data)
        if (data.data && data.data.specialties) {

            getRelatedDoc(data.data.specialties)
        }
    }

    useEffect(() => {
        if (doctorId) getDoctor()
    }, [doctorId])

    // console.log(doctor)

    // const getRelatedDoc = async (specialty) => {

    //     if (!specialty) {
    //         console.log("no receive specialty")
    //         return
    //     }

    //     console.log("Fetching related doctors for specialty:", specialty)

    //     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}?specialty=${specialty}`)

    //     const data = await response.json()
    //     console.log("backend:", data)

    //     const filtrar = data.filter(doct => doct.specialties=== specialty&& doct.id !== Number(doctorId))

    // console.log("Filtered related doctors:", filtrar)

    //     setFiltraDoctorRelate(filtrar)
    // }



const getRelatedDoc = async (specialty) => {
    if (!specialty) return;

    console.log("Fetching related doctors for specialty:", specialty);

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctors`);
    const doctorsArray = await response.json(); // <- aquí ya es array

    const filtrar = doctorsArray.filter(
        doct => doct.specialties === specialty && doct.id !== Number(doctorId)
    );

    console.log("Filtered related doctors:", filtrar);
    setFiltraDoctorRelate(filtrar);
};



    console.log(filtraDoctorRelate)


    return (
        <div>
            <div className="w-25">
                <li className="d-block">
                    <div className="d-flex ">
                        <img
                            src={doctor.picture}
                            alt="imagen"
                            style={{
                                width: "90px",
                                height: "90px",
                                borderRadius: "50%",
                                objectFit: "cover"
                            }}
                        />
                        <div className="ms-3 mbs">
                            <h4> Dr. {doctor.name} </h4>
                            <p className="text-center mt-1" style={{ color: "#468BE6" }}>{doctor.specialties}</p>
                        </div>

                    </div>
                    <div className="pb-2">
                        <div className=" mbs">
                            <p className="mb-2 fw-semibold " style={{ color: "#27fb8a" }} > New patient appts</p>
                            <p className="mb-2 fw-light ">New patient appointments • Highly recommended • Excellent wait time</p>
                        </div>
                        < Biography text={doctor.biography} />
                    </div>
                </li>
            </div>
            <h4>Other doctor in {doctor.specialties}</h4>

            <div>
                {
                    filtraDoctorRelate.map(item =>
                        <li key={item.id}>
                            <div>
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

                        </li>
                    )
                }

            </div>
        </div>
    )
}