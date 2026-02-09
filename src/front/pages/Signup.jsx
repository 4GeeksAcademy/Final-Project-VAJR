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
        <div className="vip-background">
            <div className="fondo-form">

                <div className="container d-flex align-items-center justify-content-center m-2" style={{ minHeight: "100vh" }}>

                    <div className="row g-3">
                        <div className="col-12 text-center text-primary text-success">
                            <h1 id="titlesigun">Create your account</h1>
                        </div>

                        <div className="col-12">
                            <form onSubmit={handleSignupPacients}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">
                                        <strong>Name:</strong>
                                    </label>
                                    <input type="text" className="form-control" id="name" name="name" onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">
                                        <strong> Email:</strong>
                                    </label>
                                    <input type="email" className="form-control" id="email" name="email" onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">
                                        <strong> Password:</strong>
                                    </label>
                                    <input type="password" className="form-control" id="password" name="password" onChange={handleChange} required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">
                                        <strong>Phone:</strong>
                                    </label>
                                    <input type="text" className="form-control" id="phone" name="phone" onChange={handleChange} required />
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
