import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
  const { store, dispatch } = useGlobalReducer();
  const { token, userType, pacient, doctor } = store;

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  const isLoggedIn = isTokenValid(token);
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "logout" });
    window.location.reload();
  };

  const getUserName = () => {
    if (userType === 'doctor' && doctor) return "Doctor";
    if (userType === 'pacient' && pacient) return "Pacient";
    return 'Profile';
  };

  // ============== DOCTOR NAVBAR ==============
  const DoctorNavbar = () => (
    <>
      {/* Doctor Profile Dropdown */}
      <button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
        <a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown">
          <i className="fa-solid fa-user-md"></i> {getUserName()}
        </a>
        <ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
          <li>
            <Link className="dropdown-item" to="/doctor/profile">
              <i className="fa-solid fa-id-card"></i> Professional Profile
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
            </button>
          </li>
        </ul>
      </button>
    </>
  );

  // ============== PATIENT NAVBAR ==============
  const PatientNavbar = () => (
    <>
      {/* Patient Profile Dropdown */}
      <button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
        <a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown">
          <i className="fa-solid fa-user"></i> {getUserName()}
        </a>
        <ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
          <li>
            <Link className="dropdown-item" to="/api/listappointments">
              <i className="fa-solid fa-address-card"></i> My Account
            </Link>
          </li>
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button className="dropdown-item text-danger" onClick={handleLogout}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
            </button>
          </li>
        </ul>
      </button>
    </>
  );

  // ==============(Not Logged In) ==============
  const PublicNavbar = () => (
    <>
      {/* Login Dropdown */}
      <button type="button" className="btn nav-item dropdown ms-auto me-2">
        <a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown">
          Log in
        </a>
        <ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
          <p className="ms-3 mb-0"><b>Doctors</b></p>
          <li><Link to="/doctor/login" className="dropdown-item">Log in</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <p className="ms-3 mb-0"><b>Patients</b></p>
          <li><Link to="/api/pacient/login" className="dropdown-item">Log in</Link></li>
        </ul>
      </button>

      {/* Sign up Dropdown */}
      <button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
        <a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown">
          Sign up
        </a>
        <ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
          <p className="ms-3 mb-0"><b>Doctors</b></p>
          <li><Link to="/api/doctor/register" className="dropdown-item">Sign up</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <p className="ms-3 mb-0"><b>Patients</b></p>
          <li><Link to="/api/pacient/signup" className="dropdown-item">Sign up</Link></li>
        </ul>
      </button>
    </>
  );

  // ============== MAIN RENDER ==============
  return (
    <nav className="navbar bg-none" style={{ backgroundColor: "#E9F5FF" }}>
      <div className="container">
        <Link to="/" className="text-decoration-none">
          <i className="fa-solid fa-house-medical" style={{ color: "#1a5799", fontSize: "30px" }}></i>
          <span className="navbar-brand mb-0 h1 fs-3 ms-2">HiDoc</span>
        </Link>

        <div className="d-flex align-items-center ms-auto">
          {!isLoggedIn ? (
            <PublicNavbar />
          ) : userType === 'doctor' ? (
            <DoctorNavbar />
          ) : (
            <PatientNavbar />
          )}
        </div>
      </div>
    </nav>
  );
};
