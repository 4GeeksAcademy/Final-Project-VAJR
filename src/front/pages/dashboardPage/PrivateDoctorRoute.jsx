import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const PrivateDoctorRoute = ({ children }) => {
  const { store, dispatch } = useGlobalReducer();
  const token = store.token;

  if (!token) {
    return <Navigate to="/doctor/login" replace />;
  }

  try {
    const { exp } = jwtDecode(token);
    const now = Date.now() / 1000;

    if (exp < now) {
      dispatch({ type: "logout" });
      localStorage.clear();
      return <Navigate to="/doctor/login" replace />;
    }
  } catch {
    dispatch({ type: "logout" });
    localStorage.clear();
    return <Navigate to="/doctor/login" replace />;
  }

  return children;
};