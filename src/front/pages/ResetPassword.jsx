import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export const ResetPassword =()=>{
    const [searchParams]=useSearchParams();
    const [newPassword, setNewPassword]=useState("");
    const[confirmPw, setConfirmPw]=useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const token =searchParams.get("token");//se extrae de la url
    
    if (!token) {
        Swal.fire("Error", "No token provided", "error");
        navigate("/pacient/login");
    }

    const handleResetPw= async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPw) {
            Swal.fire("Error", "Passwords do not match", "error");
            return;
        }
        try{
            const response=await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/pacient/resetpassword`, {
                method:"POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body:JSON.stringify({
                    token:token,
                    new_password: newPassword
                }),
        });
        const data = await response.json();
        if (response.ok) {
                Swal.fire("Success", "Password updated successfully!", "success","#035aa6");
                navigate("/api/pacient/login"); // 
            } else {
                Swal.fire("Error", data.msg || "Something went wrong", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Server error, try again later", "error");
        }
    };

  if (!token) return null;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card p-4 shadow" style={{ width: "400px" }}>
                <h2 className="text-center mb-4">Set New Password</h2>
                <form onSubmit={handleResetPw}>
                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={confirmPw}
                            onChange={(e) => setConfirmPw(e.target.value)}
                            required
                        />
                        
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};