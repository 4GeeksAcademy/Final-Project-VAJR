import { Navigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const PrivateDoctorRoute = ({ children }) => {
  const { store } = useGlobalReducer();

  if (!store.token || !store.doctor) {
    return <Navigate to="/doctor/login" replace />;
  }

  return children;
};
