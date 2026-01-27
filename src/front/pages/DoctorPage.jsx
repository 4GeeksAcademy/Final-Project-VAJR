import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import useGlobalReducer from "../hooks/useGlobalReducer"
import { Biography } from "./Biography"
import { DocttoCalendar } from "./DoctorCalendar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCalendar } from "@fortawesome/free-regular-svg-icons"
import { DoctorMap } from "./DoctorMap"

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
        <>
            <div className="profile-doctor" style={{ background: "#e9f5ff87" }}>
                <div className=" p-3 ms-5 " >
                    <li className="d-block ms-5 mt-5">
                        <div className="d-flex ">
                            <img
                                src={doctor.picture}
                                alt="imagen"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover"
                                }}
                            />
                            <div className="ms-3 mbs">
                                <h4 className="fs-3"> Dr. {doctor.name} </h4>
                                <p className=" mt-1" style={{ color: "#468BE6" }}>{doctor.specialties}</p>
                                <p className="fw-lighter"> {doctor.address} </p>
                            </div>
                        </div>
                        <div className="pt-4 fw-light">
                            <p>< Biography text={doctor.biography} /> </p>
                        </div>

                        <div className="d-flex gap-5 flex-sm-row mt-4 ">
                            <span className="fw-semibold ">Highlights</span>
                            <span className="fw-semibold ms-3"> About </span>
                            <span className="fw-semibold ms-3"> Insurances </span>
                            <span className="fw-semibold ms-3"> Location </span>
                            <span className="fw-semibold ms-3">FAQs</span>
                        </div>
                    </li>
                    <div className="mt-5  ms-5 d-flex">
                        <div className="me-2 fs-2" style={{ color: "#1A5799" }}><FontAwesomeIcon icon={faCalendar} /></div>
                        <div className="mt-2">
                            <span className="fs-5 fw-medium ">New patient appointments </span>
                            <p className="fw-light">Appointments available for new patients on <span className="fw-semibold">HiDoc</span></p>
                        </div>
                    </div>
                    <hr className="ms-5" />
                    <div className="ms-5 d-flex mt-5">
                        <img className=""
                            src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MyA0MiI+CiAgPHBhdGggZD0iTTIwLjg0IDcuOTNjLjIyLS4zIDEuMDEtLjMgMS4yMyAwIDEuMjggMS42NyA0LjUzIDMuNzQgMTEuMiAzLjgyLjA3LS4xNy4xMy0uMzUuMTYtLjUzbC4xNi0uODIuMTUuODJjLjEuNS4zNS45OC43MiAxLjM2LjM3LjM4Ljg0LjY1IDEuMzcuNzhhMi44OCAyLjg4IDAgMCAwLTIuMDkgMi4xNWwtLjA4LjQ1djEuMThBMjAuMSAyMC4xIDAgMCAxIDIxLjYgMzQuNWEuMzYuMzYgMCAwIDEtLjI4IDBBMjAuMSAyMC4xIDAgMCAxIDkuMjYgMTcuMTRWMTIuMWMwLS4yLjE2LS4zNi4zNi0uMzYgNi42OS0uMDcgOS45NS0yLjE1IDExLjIyLTMuODJaIiBmaWxsPSIjRkRGQUVFIi8+CiAgPHBhdGggZD0iTTIyLjEyIDExLjA4Yy0uMjQtLjI3LTEuMS0uMjgtMS4zNCAwLTEuMSAxLjI0LTMuNjIgMi42Ni04LjQ3IDIuNzItLjIgMC0uMzYuMTctLjM2LjM3djMuODFhMTUuNTggMTUuNTggMCAwIDAgOS4zNyAxMy40NWMuMDkuMDMuMi4wMy4yOCAwYTE1LjYgMTUuNiAwIDAgMCA5LjItMTMuNDV2LTMuODFjMC0uMi0uMTYtLjM2LS4zNi0uMzctNC43NS0uMDYtNy4yMy0xLjQ4LTguMzItMi43MloiIGZpbGw9IiNGRUQzMzciLz4KICA8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMzLjU5IDEwLjA0Yy4xNyAwIC4zMi4xMy4zNS4zbC4xNi44MmMuMDguNDMuMy44NC42MiAxLjE3LjMyLjMzLjc0LjU3IDEuMi42OWEuMzYuMzYgMCAwIDEgMCAuN2MtLjQ2LjExLS44OC4zNS0xLjIuNjhhMi4zIDIuMyAwIDAgMC0uNjIgMS4xN2wtLjE2LjgyYS4zNi4zNiAwIDAgMS0uNyAwbC0uMTYtLjgyYTIuMyAyLjMgMCAwIDAtLjYyLTEuMTcgMi41NyAyLjU3IDAgMCAwLTEuMi0uNjkuMzYuMzYgMCAwIDEgMC0uN2MuNDYtLjExLjg4LS4zNSAxLjItLjY4LjMyLS4zMy41NC0uNzQuNjItMS4xN2wuMTYtLjgzYS4zNi4zNiAwIDAgMSAuMzUtLjI5Wm0wIDEuODhhMy4wNiAzLjA2IDAgMCAxLTEuMyAxLjQ1IDMuMjIgMy4yMiAwIDAgMSAxLjMgMS40NCAzLjA2IDMuMDYgMCAwIDEgMS4zLTEuNDQgMy4yMiAzLjIyIDAgMCAxLTEuMy0xLjQ1WiIgZmlsbD0iI0ZGOEE1NiIvPgogIDxwYXRoIGQ9Im0yMS4xMyA4LjE1LjA4LS4wNWEuOC44IDAgMCAxIC4yNS0uMDNjLjEgMCAuMTguMDEuMjUuMDNsLjA4LjA1YzEuMzIgMS43MyA0LjU0IDMuNzUgMTAuODcgMy45NC4xNi0uMjEuMjktLjQ1LjM2LS43LTYuNDMtLjEzLTkuNS0yLjE1LTEwLjY2LTMuNjhhLjg4Ljg4IDAgMCAwLS40My0uMjkgMS41MSAxLjUxIDAgMCAwLS45NSAwIC44OC44OCAwIDAgMC0uNDIuMjljLTEuMTkgMS41NS00LjMyIDMuNi0xMC45NCAzLjY4YS43Mi43MiAwIDAgMC0uNzIuNzJ2NS4wM2EyMC40NiAyMC40NiAwIDAgMCAxMi4yNyAxNy43Yy4xOC4wNy40LjA3LjU3IDBhMjAuNDYgMjAuNDYgMCAwIDAgMTIuMjgtMTcuN1YxNmwtLjA4LjRhLjM2LjM2IDAgMCAxLS42NC4xNHYuNmExOS43NSAxOS43NSAwIDAgMS0xMS44NCAxNy4wM0ExOS43NSAxOS43NSAwIDAgMSA5LjYyIDE3LjEzdi01LjAyYzYuNzYtLjA4IDEwLjE0LTIuMTcgMTEuNS0zLjk2WiIgZmlsbD0iIzMzMyIvPgogIDxwYXRoIGQ9Ik0yMi4yNSAyNS4zYy4yIDAgLjM2LS4xNi4zNi0uMzV2LTIuMjhjMC0uMi4xNi0uMzYuMzYtLjM2aDIuMjdjLjIgMCAuMzYtLjE2LjM2LS4zNnYtMS41NmMwLS4yLS4xNi0uMzYtLjM2LS4zNmgtMi4yN2EuMzYuMzYgMCAwIDEtLjM2LS4zNlYxNy40YzAtLjItLjE2LS4zNS0uMzYtLjM1aC0xLjU2Yy0uMiAwLS4zNi4xNi0uMzYuMzV2Mi4yN2MwIC4yLS4xNi4zNi0uMzYuMzZIMTcuN2MtLjIgMC0uMzYuMTYtLjM2LjM2djEuNTZjMCAuMi4xNi4zNi4zNi4zNmgyLjI3Yy4yIDAgLjM2LjE2LjM2LjM2djIuMjhjMCAuMi4xNi4zNi4zNi4zNmgxLjU2WiIgZmlsbD0iIzMzMyIvPgo8L3N2Zz4K"
                            style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                color: "#1A5799"
                            }}
                        />
                        <div className="mt-1">
                            <p className="fs-5 fw-medium">In-network insurances</p>
                            <p> AmeriHealth, Ambether, Aetna, UnitedHealthOne </p>
                            <p className=" fw-medium">(10+) more in-network plans</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 doctor-section-profile">
                <h4> About Dr. {doctor.name}</h4>
                <h5 className="mt-3 fw-medium" >Clientele seen</h5>
                <div className="ms-3">
                    {
                        doctor.specialties === "Pediatrics" ?
                            (
                                <div className=" mt-3 d-flex justify-content-sm-between flex-sm-wrap about-stection-customer">
                                    <li className="fw-light">Newborns (0-12 months)</li>
                                    <li className="fw-light">Infants (1-3 years)</li>
                                    <li className="fw-light">Children (4-12 years)</li>
                                    <li className="fw-light">Adolescents (13-17 years)</li>
                                </div>
                            )
                            :
                            (
                                <div className="mt-3 d-flex justify-content-sm-between flex-sm-wrap about-stection-customer">
                                    <li className="fw-light">Young adults (18-24)</li>
                                    <li className="fw-light">  Individuals Adults (25-64)</li>
                                    <li className="fw-light"> Seniors (65+) </li>
                                    <li className="fw-light">Individuals</li>
                                </div>
                            )
                    }
                </div>
                <div className="mt-4">
                    <h5 className="fw-medium"> Languages spoken </h5>
                    <p className="fw-light"> English, Spanish</p>
                </div>
                <div className="mt-4">
                    <h5 className="fw-medium">Getting to know Dr. {doctor.name}</h5>
                    <p>< Biography text={doctor.biography} /> </p>
                </div>

                <div className="mt-4">
                    <h5 className="fw-medium"> Is this doctor in your insurance network? </h5>
                    <p>Check if your insurance is part of the list</p>
                    <p className="fw-semibold mt-4">In-network insurances</p>
                    <div className="mt-4" style={{ width: "60%" }}>
                        <div className="d-flex justify-content-sm-between">
                            <div >
                                <img src="https://brandlogos.net/wp-content/uploads/2023/09/aetna-logo_brandlogos.net_ufcp5.png"
                                    style={{
                                        width: "90px",
                                        height: "auto",
                                    }}
                                />
                                <span className="ms-3">Aetna</span>
                            </div>
                            <div >
                                <img src="https://tse2.mm.bing.net/th/id/OIP.UN0zdQ4I5J_FteSR_bvUeAHaHa?cb=defcache2defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3"
                                    style={{
                                        width: "40px",
                                        height: "auto",
                                    }}
                                />
                                <span className="ms-3">Ambether</span>
                            </div>
                        </div>

                        <div className="mt-3 d-flex justify-content-sm-between">
                            <div >
                                <img src="https://w7.pngwing.com/pngs/283/333/png-transparent-logo-brand-product-design-font-employee-reporting-relationship-text-logo-amerihealth.png"
                                    style={{
                                        width: "90px",
                                        height: "auto",
                                    }}
                                />
                                <span className="ms-3">AmeriHealth</span>
                            </div>
                            <div >
                                <img src="https://tse3.mm.bing.net/th/id/OIP.VBv0dU0sdj6jEhACMTtIoAHaEK?cb=defcache2defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3"
                                    style={{
                                        width: "90px",
                                        height: "auto",
                                    }}
                                />
                                <span className="ms-3">Medicare</span>
                            </div>
                        </div>

                        <div className="d-flex mt-4">
                            <p>150+ more in-network plans</p>
                            <button type="button" className="modal-insurance ms-2" data-bs-toggle="modal" data-bs-target="#staticBackdrop"> View all</button>
                        </div>
                        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="staticBackdropLabel">In-network insurances</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                    </div>
                                    <div className="modal-body">
                                        <p> OMNIA </p>
                                        <p>Quest Behavioral Health</p>
                                        <p> Advantage EPO with Blue HPN </p>
                                        <p>OMNIA Gold - Standard Gold Off Exchange</p>
                                        <p>OMNIA Silver HSA - Standard Silver Off</p>
                                        <p>Independence Blue Cross</p>
                                        <p>Health Fund CDHP by Dell</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <h5 className="mt-5">Office location</h5>

                <div className="mt-4" >

                    <div className="">
                        <DoctorMap doctor={doctor} />
                    </div>

                    <div className="">


                    </div>



                </div>
            </div>
        </>
    )
}



