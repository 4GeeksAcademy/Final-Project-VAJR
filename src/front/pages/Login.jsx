import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import Swal from "sweetalert2";

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { store, dispatch } = useGlobalReducer();

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  }
  const DEFAULT_DOCTOR_ID = 1;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pacient/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      if (!text) {
        Swal.fire({ icon: "error", title: "Server Error", text: "The server did not return a valid response.", confirmButtonColor: "#d33" });
        return;
      }

      const data = JSON.parse(text);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        dispatch({
          type: "login_pacient",
          payload: { pacient: data.pacient, token: data.token }
        });

        Swal.fire({
          icon: "success",
          title: "Welcome back!",
          timer: 1000,
          showConfirmButton: false
        });

        navigate("/api/listappointments");
      } else {
        Swal.fire({ title: "Error", text: data.msg || "Incorrect email or password", icon: "error", confirmButtonColor: "#d33" });
      }

    } catch (error) {
      console.error("Error en login:", error);
      alert("Error de conexión: ", error.message);
    }
  };

  return (
    <div className="vip-background">
      <div className="fondo-form">
        <div className="container mt-5 d-flex justify-content-center">
          <div className="row g-3">
            <div className="col-12 text-center text-primary">
              <h1 id="titlesigun">Patient Access</h1>
            </div>
            <div className="col-12">
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <strong><i className="fa-regular fa-envelope"></i> Email:</strong>
                  </label>
                  <input type="email" className="form-control" id="email" name="email" onChange={handleChangeEmail} />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <strong><i className="fa-solid fa-key"></i> Password:</strong>
                  </label>
                  <input type="password" className="form-control" id="password" name="password" onChange={handleChangePassword} />
                </div>
                <div className="d-flex justify-content-center pb-2">
                  <button type="submit" className="btn text-light" id="btn-drop">
                    Sign in
                  </button>
                </div>
                <div className="d-flex justify-content-center pb-2">

                  <Link to="/api/pacient/forgotpassword">
                    Forgot Password
                  </Link>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
