import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const PrivateDoctorRoute = ({ children }) => {
  const { store } = useGlobalReducer();
  const token = store.token;

  if (!token) {
    return <Navigate to="/doctor/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp < now) {
      localStorage.removeItem("token");
      localStorage.removeItem("doctor");
      return <Navigate to="/doctor/login" replace />;
    }
  } catch (err) {
    return <Navigate to="/doctor/login" replace />;
  }

  return children;
};
