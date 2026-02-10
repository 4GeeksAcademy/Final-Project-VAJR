import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { jwtDecode } from "jwt-decode";
import SweetAlert from "sweetalert2";

export const LoginDoctor = () => {
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


  const handleLoginDoctor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userType", "doctor");

        const decoded = jwtDecode(data.token);
        console.log("Decoded token:", decoded);

        const doctorFromToken = {
          email: decoded.sub,
          id: decoded.user_id || decoded.id || null,
          name: decoded.name || decoded.sub || "Doctor"
        };

        dispatch({
          type: "login_doctor",
          payload: {
            doctor: data.doctor || doctorFromToken,
            token: data.token
          }
        });

        SweetAlert.fire({
          icon: "success",
          title: "Welcome back!",
          timer: 1000,
          showConfirmButton: false
        });

        navigate("/");
      } else {
        SweetAlert.fire({
          title: data.msg,
          icon: "error",
          confirmButtonText: "Try Again"
        })
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Error de conexion con el servidor");
    }
  };

  return (
    <div className="vip-background">
      <div className="fondo-form">
        <div className="container mt-5 d-flex justify-content-center">
          <div className="row g-3">
            <div className="col-12 text-center text-primary">
              <h1 id="titlesigun">Doctor Access</h1>
            </div>

            <div className="col-12">
              <form onSubmit={handleLoginDoctor}>

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
                {/*botones */}
                <div className="d-flex justify-content-center pb-2">
                  <button type="submit" className="btn text-light" id="btn-drop">
                    Sign in
                  </button>
                </div>
                <div className="d-flex justify-content-center pb-2">
                  <button type="button" className="btn btn-link ">
                    <Link to="/api/doctor/forgotpassword">
                      Forgot Password
                    </Link>
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

