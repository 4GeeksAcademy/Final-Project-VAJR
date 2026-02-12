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

        <div className="vip-background my-5">
            <div className="fondo-form">

                <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>

                    <div className="row g-3">
                        <div className="col-12 text-center text-primary text-success">
                            <h1 id="titlesigun">Create your account</h1>
                        </div>

                        <div className="col-12">
                            <form onSubmit={handleSignupDoctor}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        <strong>Name</strong>
                                    </label>
                                    <input type="text" className="form-control" id="name" name="name" onChange={hadleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <strong> Email</strong>
                                    </label>
                                    <input type="email" className="form-control" id="email" name="email" onChange={hadleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <strong> Password</strong>
                                    </label>
                                    <input type="password" className="form-control" id="password" name="password" onChange={hadleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        <strong>Specialties</strong>
                                    </label>
                                    <div className="dropdown">
                                        <button className="btn dropdown-toggle text-light" id="btn-drop" type="button" data-bs-toggle="dropdown" aria-expanded="false" >
                                            <strong>{form.specialties || "Select a specialty"}</strong>
                                        </button>
                                        <ul className="dropdown-menu w-60">
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
                                    </div></div>

                                <div className="mb-3">
                                    <label htmlFor="biography" className="form-label">
                                        <strong>Biography</strong>
                                    </label>
                                    <label htmlFor="exampleFormControlTextarea1" className="form-label"></label>
                                    <textarea className="form-control" id="biography" name="biography" value={form.biography} onChange={hadleChange} rows="3"></textarea>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="picture" className="form-label">
                                        <strong>Picture</strong>
                                    </label><div className="mb-3">
                                        <input className="form-control" type="file" id="formFile" onChange={uploadImagen} />
                                        {uploading && <small className="text-warning">Uploading Image...</small>}
                                        {form.picture && <small className="text-success d-block">Image ready </small>}
                                    </div>

                                </div>
                                <div className="mb-3">
                                    <label htmlFor="address" className="form-label">
                                        <strong>Address</strong>
                                    </label>
                                    <input type="text" className="form-control" id="address" name="address" onChange={hadleChange} required />
                                </div>
                                <div>
                                    <label htmlFor="name" className="form-label">
                                        <strong>Latitud</strong>
                                    </label>
                                    <input type="text" className="form-control" id="latitud" name="latitud" onChange={hadleChange} required />
                                </div>
                                <div>
                                    <label htmlFor="longitud" className="form-label">
                                        <strong>Longitud</strong>
                                    </label>
                                    <input type="text" className="form-control" id="longitud" name="longitud" onChange={hadleChange} required />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="form-label">
                                        <strong>Phone</strong>
                                    </label>
                                    <input type="text" className="form-control" id="phone" name="phone" onChange={hadleChange} required />
                                </div>
                                <div>
                                    <label htmlFor="cal_link" className="form-label">
                                        <strong>Calendario link</strong>
                                    </label>
                                    <input type="text" className="form-control" id="cal_link" name="cal_link" onChange={hadleChange} required />
                                </div>
                                <div className="d-flex justify-content-center p-2">
                                    <button type="submit" className="btn text-light" id="btn-drop">Register</button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    );
};
