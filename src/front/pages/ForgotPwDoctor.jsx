import { Link, useNavigate, useParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import Swal from "sweetalert2";

export const ForgotPwDoctor = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const handleForgotPw = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/doctor/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),

      });
      const data = await response.json();
if(response.ok){
          Swal.fire({
            title:"Password reset",
            text:"Email received. Please check your email.",
            icon:"success",
            confirmButtonColor: "#035aa6", 
            iconColor: "#18aded",
            confirmButtonText: "Close"
         }).then((result) => {
          if (result.isConfirmed) {
            navigate("/");}
            });
        } else {
            Swal.fire({
                title: "Error",
                text: data.msg || "User not found",
                icon: "error",
                confirmButtonColor: "#035aa6"
            });
        }
    } catch (error) {
      console.error(error);
      setMessage(" An error occurred, please try again.")
    }
  };

  return (

    <div className="vip-background">
      <div className="fondo-form">
        <div className="container mt-5 d-flex justify-content-center">
          <div className="row g-3">
            <div className="col-12 text-center text-primary">
              <h1 id="titlesigun">Forgot Password</h1>
            </div>
            <div className="col-12">
              <form onSubmit={handleForgotPw}>
                <div className="mb-3">

                  <label htmlFor="email" className="form-label">
                    <strong><i className="fa-regular fa-envelope"></i> Email:</strong>
                  </label>
                  <input type="email" className="form-control" id="email" name="email" onChange={handleChangeEmail} />
                </div>
                <p className="text-muted">
                  Enter your email and we'll send you a recovery link
                </p>
                <div className="d-flex justify-content-center pb-2 me-3">
                  <button type="submit" className="btn text-light me-3" id="btn-drop">
                    Send recovery link
                  </button>
                  <Link to="/" className="btn btn-outline-secondary"style={{ backgroundColor: "#c7e5f2", color: "#035aa6", border: "1px solid #18aded" }}>
                    
                    Back to Home
                  </Link>
                </div>
              </form>
              {message && <p>{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}