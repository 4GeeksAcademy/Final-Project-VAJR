import React, { useEffect, useState } from "react"
import { Await, useNavigate } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Swal from "sweetalert2";

export const SignupDoctor = () => {
    const { store, dispatch } = useGlobalReducer()
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        specialties: "",
        biography: "",
        picture: "",
        phone: "",
        address: " ",
        latitud: " ",
        longitud: " ",
        cal_link: " ",


    })

    const hadleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    const hadleSpecialty = (value) => {
        setForm({ ...form, specialties: value })
    }

    const uploadImagen = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const data = new FormData();
        data.append("file", files[0]);
        data.append("upload_preset", "hidoctor")

        setUploading(true);
        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dvcvlvscy/image/upload", {
                method: "POST",
                body: data,
            });
            const file = await response.json();
            if (file.secure_url) {
                setForm(prevForm => ({ ...prevForm, picture: file.secure_url }));
                console.log("URL guardada en estado:", file.secure_url);
            }
        } catch (error) {
            console.error("Error subiendo la imagen", error);
        } finally {
            setUploading(false);
        }
    };

    const handleSignupDoctor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    title: "Doctor registered successfully!",
                    text: "Your account has been created. Please log in to access your dashboard.",
                    icon: "success",
                    confirmButtonText: "Go to Login",
                    confirmButtonColor: "#035aa6"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/doctor/login");
                    }
                });

            } else {
                Swal.fire({
                    title: "Error",
                    text: data.msg || "There was an issue with your registration.",
                    icon: "error",
                    confirmButtonColor: "#d33"
                });
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    return (
        <div className="container-fluid p-0" style={{ height: "100vh", overflow: "hidden" }}>
            <div className="row g-0" style={{ height: "100%" }}>


                <div className="col-md-6 d-none d-md-block" style={{ height: "100vh" }}>
                    <img
                        src="/src/front/assets/img/Doctor2.jpg"
                        alt="Doctor Presentation"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                        }}
                    />
                </div>


                <div className="col-12 col-md-6 d-flex justify-content-center bg-white"
                    style={{
                        height: "100vh",
                        overflowY: "auto",
                        padding: "60px 20px"
                    }}>

                    <div style={{ width: "100%", maxWidth: "480px" }}>
                        <div className="text-center mb-4">
                            <h1 style={{ color: "#035aa6", fontWeight: "bold", fontSize: "2.2rem" }}>Doctor Registration</h1>
                            <p className="text-muted">Complete the form to create your professional profile</p>
                        </div>

                        <form onSubmit={handleSignupDoctor}>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Full Name</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="name" onChange={hadleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Email</strong></label>
                                <input type="email" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="email" onChange={hadleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Password</strong></label>
                                <input type="password" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="password" onChange={hadleChange} required />
                            </div>

                            <div className="mb-4">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Specialty</strong></label>
                                <div className="dropdown">
                                    <button className="btn dropdown-toggle w-100 text-white"
                                        style={{ backgroundColor: "#035aa6", border: "none" }}
                                        type="button" data-bs-toggle="dropdown">
                                        {form.specialties || "Select Specialty"}
                                    </button>
                                    <ul className="dropdown-menu w-100 shadow">
                                        {[
                                            { key: "CARDIOLOGY", label: "Cardiology" },
                                            { key: "DERMATOLOGY", label: "Dermatology" },
                                            { key: "PSYCHOLOGY", label: "Psychology" },
                                            { key: "GENERAL_PRACTICE", label: "General Practice" },
                                            { key: "NEUROLOGY", label: "Neurology" },
                                            { key: "GASTROENTEROLOGY", label: "Gastroenterology" }
                                        ].map(({ key, label }) => (
                                            <li key={key}>
                                                <button
                                                    type="button"
                                                    className={`dropdown-item ${form.specialties === key ? "active" : ""}`}
                                                    onClick={() => hadleSpecialty(key)}
                                                    style={{ cursor: 'pointer' }}>
                                                    {label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Biography</strong></label>
                                <textarea className="form-control" style={{ border: "1px solid #c7e5f2" }} name="biography" value={form.biography} onChange={hadleChange} rows="3"></textarea>
                            </div>

                            <div className="mb-4">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Profile Picture</strong></label>
                                <input className="form-control" type="file" style={{ border: "1px solid #c7e5f2" }} onChange={uploadImagen} />
                                {uploading && <small style={{ color: "#18aded" }}>Uploading...</small>}
                                {form.picture && <small style={{ color: "#035aa6" }}>✓ Image ready</small>}
                            </div>


                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Phone</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="phone" onChange={hadleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Address</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="address" onChange={hadleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Latitude</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="latitud" onChange={hadleChange} required />
                            </div>

                            <div className="mb-3">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Longitude</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="longitud" onChange={hadleChange} required />
                            </div>

                            <div className="mb-5">
                                <label className="form-label" style={{ color: "#035aa6" }}><strong>Calendar Link</strong></label>
                                <input type="text" className="form-control" style={{ border: "1px solid #c7e5f2" }} name="cal_link" onChange={hadleChange} required />
                            </div>

                            <div className="mb-2 d-flex justify-content-center pb-5">
                                <button
                                    type="submit"
                                    className="btn w-50 text-white py-2 shadow"
                                    style={{
                                        backgroundColor: "#035aa6",
                                        fontSize: "1 rem",
                                        fontWeight: "bold",
                                        border: "none"
                                    }}>
                                    REGISTER DOCTOR
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
