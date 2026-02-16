import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";


export const Signup = () => {
    const navigate = useNavigate();
    const { store, dispatch } = useGlobalReducer()
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
    })
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSignupPacients = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pacient/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    title: "You have registered successfully.!",
                    text: "Your account has been created. Please log in to access your dashboard.",
                    icon: "success",
                    confirmButtonText: "Go to Login",
                    confirmButtonColor: "#035aa6"
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigate("/api/pacient/login");
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
            console.error("Error en login:", error);
            alert("Error de conexion con el servidor");
        }

    };

    return (
        <div className="container-fluid p-0" style={{ height: "100vh", overflow: "hidden" }}>
            <div className="row g-0" style={{ height: "100%" }}>

                <div className="col-md-6 d-none d-md-block" style={{ height: "100vh" }}>
                    <img
                        src="/src/front/assets/img/paciente2.jpg"
                        alt="Patient Presentation"
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
                            <h1 style={{ color: "#035aa6", fontWeight: "bold", fontSize: "2.2rem" }}>Patient Registration</h1>
                            <p className="text-muted">Create your account</p>
                        </div>


                        <div className="col-12">
                            <form onSubmit={handleSignupPacients}>

                                <div className="mb-3 text-primary">
                                    <label htmlFor="name" className="form-label">
                                        <strong>Full Name</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="name"
                                        name="name"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3 text-primary">
                                    <label htmlFor="email" className="form-label">
                                        <strong>Email</strong>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3 text-primary">
                                    <label htmlFor="password" className="form-label">
                                        <strong>Password</strong>
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3 text-primary">
                                    <label htmlFor="phone" className="form-label">
                                        <strong>Phone</strong>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="mb-5 d-flex justify-content-center pt-3">
                                    <button
                                        type="submit" className="btn w-50 text-white py-2 shadow"
                                        style={{
                                            backgroundColor: "#035aa6",
                                            fontSize: "1 rem",
                                            fontWeight: "bold",
                                            border: "none"
                                        }} >
                                        REGISTER PATIENT
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};
