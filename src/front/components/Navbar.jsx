import { Link, Navigate, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {

	const { store, dispatch } = useGlobalReducer();
	const navigate = useNavigate()

	const handleLogout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('doctor')

		dispatch({ type: 'logout' })
		navigate('doctor/login')
	}
	console.log("store: ", store)
	console.log('doctor:', store.doctor)
	return (
		<nav
			className="navbar bg-none"
			data-bs-theme="light"
			style={{ backgroundColor: "#E9F5FF" }}
		>
			<div className="container">
				<Link to="/" className="text-decoration-none">
					<i
						className="fa-solid fa-house-medical"
						style={{ color: "#1a5799", fontSize: "30px" }}
					></i>
					<span className="navbar-brand mb-0 h1 fs-3 ms-2">HiDoc</span>
				</Link>

				{!store.token ? (
					<>
						<button
							type="button"
							className="btn nav-item dropdown ms-auto me-2"
						>
							<a
								className="nav-link dropdown-toggle fs-5"
								href="#"
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								Log in
							</a>
							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
								<p className="ms-4 mb-0">
									<b>Doctors</b>
								</p>
								<li>
									<Link className="dropdown-item ms-2" to="/doctor/login">
										Log in
									</Link>
								</li>
								<li>
									<hr className="dropdown-divider" />
								</li>
								<p className="ms-4 mb-0">
									<b>Pacients</b>
								</p>
								<li>
									<Link className="dropdown-item ms-2" to="/login">
										Log in
									</Link>
								</li>
							</ul>
						</button>

						<button
							type="button"
							className="btn nav-item dropdown"
							style={{ backgroundColor: "#1A5799", color: "#E9F5FF" }}
						>
							<a
								className="nav-link dropdown-toggle fs-5"
								href="#"
								role="button"
								data-bs-toggle="dropdown"
								aria-expanded="false"
							>
								Sign up
							</a>
							<ul className="dropdown-menu dropdown-menu-end mt-2 shadow">
								<p className="ms-4 mb-0">
									<b>Doctors</b>
								</p>
								<li>
									<Link className="dropdown-item ms-2" to="/doctor/register">
										Sign up
									</Link>
								</li>
								<li>
									<hr className="dropdown-divider" />
								</li>
								<p className="ms-4 mb-0">
									<b>Pacients</b>
								</p>
								<li>
									<Link className="dropdown-item ms-2" to="/register">
										Sign up
									</Link>
								</li>
							</ul>
						</button>
					</>
				) : (

					<div className="ms-auto">
						<span className="me-3">Hello Dr, {store.doctor?.name}</span>
						<button
							className="btn btn-outline-danger"
							onClick={handleLogout}
						>
							Logout
						</button>
					</div>
				)}
			</div>
		</nav>
	);
};
