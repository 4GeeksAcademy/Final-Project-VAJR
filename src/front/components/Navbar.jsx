// import { Link } from "react-router-dom";
// import { jwtDecode } from "jwt-decode"
// import useGlobalReducer from "../hooks/useGlobalReducer";


// export const Navbar = () => {
// 	const { store } = useGlobalReducer();
// 	const token = store.token;

// 	// const token = localStorage.getItem("token")

// 	const verifyToken = (token) => {

// 		if (!token) return false

// 		try {
// 			const decoded = jwtDecode(token)
// 			const TimeNow = Date.now() / 1000
// 			return decoded.exp > TimeNow
// 		}
// 		catch (erorr) {
// 			return (false)
// 		}

// 	}

// 	return (
// 		<nav className="navbar bg-none" data-bs-theme="light" style={{ backgroundColor: "#E9F5FF" }}>
// 			<div className="container">
// 				<Link to="/" className="text-decoration-none">
// 					<i className="fa-solid fa-house-medical" style={{ color: "#1a5799", fontSize: "30px" }}></i>
// 					<span className="navbar-brand mb-0 h1 fs-3 ms-2">HiDoc</span>
// 				</Link>
// 				<div className="mx-auto d-none d-md-block">
// 					<Link
// 						to="/find-doctors"
// 						className="text-decoration-none fw-bold"
// 						style={{
// 							color: "#000",
// 							fontSize: "1.3rem",
// 							letterSpacing: "0.5px",
// 							transition: "color 0.2s ease"
// 						}}
// 						onMouseEnter={(e) => e.target.style.color = "#092F64"}
// 						onMouseLeave={(e) => e.target.style.color = "#1A5799"}
// 					>
// 						Medical Network
// 					</Link>
// 				</div>
// 				{!verifyToken(token) ? (
// 					<>
// 						<button type="button" className="btn nav-item dropdown ms-auto me-2">
// 							<a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
// 								Log in
// 							</a>
// 							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
// 								<p className="ms-3 mb-0"><b>Doctors</b></p>
// 								<li>
// 									<Link to="/doctor/login" className="dropdown-item ms-2">Log in</Link>
// 								</li>
// 								<li><hr className="dropdown-divider" /></li>
// 								<p className="ms-3 mb-0"><b>Pacients</b></p>
// 								<li>
// 									<Link to="/api/pacient/login" className="dropdown-item ms-2">Log in</Link>
// 								</li>
// 							</ul>
// 						</button>
// 						<button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
// 							<a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
// 								Sign up
// 							</a>
// 							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
// 								<p className="ms-3 mb-0"><b>Doctors</b></p>
// 								<li>
// 									<Link to="/api/doctor/register" className="dropdown-item ms-2">Sign up</Link>
// 								</li>
// 								<li><hr className="dropdown-divider" /></li>
// 								<p className="ms-3 mb-0"><b>Pacients</b></p>
// 								<li>
// 									<Link to="/api/pacient/signup" className="dropdown-item ms-2">Sign up</Link>
// 								</li>
// 							</ul>
// 						</button>
// 					</>) : (
// 					<button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
// 						<li>
// 							<Link className="dropdown-item ms-2" to="/api/listappointments">
// 								<i className="fa-solid fa-calendar-check"></i> My Appointments
// 							</Link>
// 						</li>

// 						<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
// 							<li><Link className="dropdown-item ms-2" to="/profile"><i className="fa-solid fa-address-card"></i> My Account</Link></li>
// 							<li><hr className="dropdown-divider" /></li>
// 							<li><button className="dropdown-item ms-2" onClick={() => {
// 								localStorage.removeItem("token")
// 								window.location.reload()
// 							}}><i className="fa-solid fa-arrow-right-from-bracket"></i> Log out</button></li>
// 						</ul>
// 					</button>
// 				)}
// 			</div>
// 		</nav>
// 	);
// };

import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate();

	const token = store.token;
	const doctor = store.doctor;
	const pacient = store.pacient;

	const verifyToken = (token) => {
		if (!token) return false;
		try {
			const decoded = jwtDecode(token);
			const TimeNow = Date.now() / 1000;
			return decoded.exp > TimeNow;
		} catch (error) {
			return false;
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("doctor");
		dispatch({ type: 'logout' });
		navigate("/");
	};

	return (
		<nav
			className="navbar bg-none"
			data-bs-theme="light"
			style={{ backgroundColor: "#E9F5FF" }}
		>
			<div className="container">
				<Link to="/" className="text-decoration-none">
					<i className="fa-solid fa-house-medical" style={{ color: "#1a5799", fontSize: "30px" }}></i>
					<span className="navbar-brand mb-0 h1 fs-3 ms-2">HiDoc</span>
				</Link>

				<div className="mx-auto d-none d-md-block">
					<Link
						to="/find-doctors"
						className="text-decoration-none fw-bold"
						style={{
							color: "#000",
							fontSize: "1.3rem",
							letterSpacing: "0.5px",
							transition: "color 0.2s ease"
						}}
						onMouseEnter={(e) => e.target.style.color = "#092F64"}
						onMouseLeave={(e) => e.target.style.color = "#1A5799"}
					>
						Medical Network
					</Link>
				</div>

				{!verifyToken(token) ? (
					<>

						<button type="button" className="btn nav-item dropdown ms-auto me-2">
							<a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								Log in
							</a>
							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
								<p className="ms-3 mb-0"><b>Doctors</b></p>
								<li><Link to="/doctor/login" className="dropdown-item ms-2">Log in</Link></li>
								<li><hr className="dropdown-divider" /></li>
								<p className="ms-3 mb-0"><b>Pacients</b></p>
								<li><Link to="/api/pacient/login" className="dropdown-item ms-2">Log in</Link></li>
							</ul>
						</button>

						<button type="button" className="btn nav-item dropdown" style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}>
							<a className="nav-link dropdown-toggle fs-5" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
								Sign up
							</a>
							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
								<p className="ms-3 mb-0"><b>Doctors</b></p>
								<li><Link to="/doctor/register" className="dropdown-item ms-2">Sign up</Link></li>
								<li><hr className="dropdown-divider" /></li>
								<p className="ms-3 mb-0"><b>Pacients</b></p>
								<li><Link to="/api/pacient/signup" className="dropdown-item ms-2">Sign up</Link></li>
							</ul>
						</button>
					</>
				) : (
					<>

						<div className="ms-auto d-flex align-items-center gap-2">
							{doctor && (
								<span className="me-2 p-2 rounded" style={{ background: "#1A5799", color: "white" }}>
									Hello Dr, {doctor.name}
								</span>
							)}
							{pacient && (
								<span className="me-2 p-2 rounded" style={{ background: "#1A5799", color: "white" }}>
									Hello {pacient.name}
								</span>
							)}

							<div className="dropdown">
								<button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
									Menu
								</button>
								<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
									{pacient && (
										<li>
											<Link className="dropdown-item ms-2" to="/api/listappointments">
												<i className="fa-solid fa-calendar-check"></i> My Appointments
											</Link>
										</li>
									)}
									<li>
										<Link className="dropdown-item ms-2" to="/profile">
											<i className="fa-solid fa-address-card"></i> My Account
										</Link>
									</li>
									<li><hr className="dropdown-divider" /></li>
									<li>
										<button className="dropdown-item ms-2" onClick={handleLogout}>
											<i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
										</button>
									</li>
								</ul>
							</div>
						</div>
					</>
				)}
			</div>
		</nav>
	);
};
