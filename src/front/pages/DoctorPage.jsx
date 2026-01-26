import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { Biography } from "./Biography"
import { DocttoCalendar } from "./DoctorCalendar"

export const DoctorPage = () => {

    const { doctorId } = useParams()
    const { store } = useGlobalReducer()

    const [doctor, setDoctor] = useState({})
    const [filtraDoctorRelate, setFiltraDoctorRelate] = useState([])

    const getDoctor = async () => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}doctor/${doctorId}`)
        const data = await response.json()
        setDoctor(data.data)
    }

    const getRelatedDoctor = async () => {
        try {
            if (!doctor.specialties) return;

            const specialtyNameMap = {
                "Cardiology": "CARDIOLOGY",
                "Dermatology": "DERMATOLOGY",
                "Pediatrics": "PEDIATRICS",
                "General Practice": "GENERAL_PRACTICE",
                "Neurology": "NEUROLOGY"
            }

            const specialtyEnumName = specialtyNameMap[doctor.specialties];

            const url = `${import.meta.env.VITE_BACKEND_URL}doctors?specialty=${specialtyEnumName}`;
            // console.log("Fetching related doctors from:", url);

            const response = await fetch(url);
            const data = await response.json();
            console.log("API response for related doctors:", data);

            const doctorsArray = Array.isArray(data) ? data : (Array.isArray(data.msg) ? data.msg : []);

            if (!Array.isArray(doctorsArray)) {
                console.log("Related doctors data is not an array:", doctorsArray);
                setFiltraDoctorRelate([]);
                return;
            }

            const related = doctorsArray.filter(d => d.id !== doctor.id);
            setFiltraDoctorRelate(related);

        } catch (error) {
            console.error("error fetching related doctor:", error);
            setFiltraDoctorRelate([]);
        }
    };

    useEffect(() => {

        if (doctorId)
            getDoctor()

    }, [doctorId])

    useEffect(() => {
        if (doctor?.specialties) {
            getRelatedDoctor()
        }

    }, [doctor])

    // console.log(doctor)


    console.log(filtraDoctorRelate)

    return (
        <div className="">
            <div className="w-25 mt-5 p-3 ms-3 d flex">
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
            <hr />
            <h4 className="ms-3 mt-2">Other doctor in {doctor.specialties}</h4>
            <hr />
            <div className="w-25 mt-3">
                {
                    filtraDoctorRelate.map(item =>

                        <li className=" ms-3 pt-2 ps-3" key={item.id}>
                            <div className="d-flex">
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
                                    <p className="text-center mt-1" style={{ color: "#468BE6" }}>{item.specialties}</p>
                                </div>
                            </div>
                            <div className="pb-2">
                                <div className=" mbs">
                                    <p className="mb-2 fw-semibold " style={{ color: "#27fb8a" }} > New patient appts</p>
                                    <p className="mb-2 fw-light ">New patient appointments • Highly recommended • Excellent wait time</p>
                                </div>
                                < Biography text={item.biography} />
                            </div>
                            <hr />
                        </li>
                    )
                }
            </div>
        </div>
    )
}
