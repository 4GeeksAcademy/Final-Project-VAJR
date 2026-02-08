import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { FoundDoc } from "../components/FoundDoc.jsx";
import { FindYourDoctor } from "../components/FindYourDoctor";
import { MostSearchedSpecialists } from "../components/MostSearchedSpecialists.jsx";
import { Link } from "react-router-dom";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	return (
		<div>
			<div className="container-fluid p-3 d-flex justify-content-center" style={{ backgroundColor: "#E9F5FF" }}>
				<div>
					<h1 style={{ fontSize: "50px" }} className="mt-5"><b>Find the right care, right now</b></h1>
					<p className="fs-5">More than 10+ specialties available, and 1,000+ verified doctors signed up</p>
					<div className="d-flex justify-content-center">
						<Link to={'/find-doctors'} id="BookNow-button" type="button" className="btn btn-outline-info fs-3 shadow mt-3" style={{ color: "#1A5799", borderColor: "#1A5799" }}>
							<i className="fa-solid fa-magnifying-glass" style={{ color: "#E9F5FF" }}></i> Book now
						</Link>
					</div>
				</div>
				<img src="https://cdn.dribbble.com/userupload/7843601/file/original-1c817c79717d27c25a72dd4e6e0d5af6.png"
					alt="Doctor image"
					style={{ height: "300px" }}
					className="ms-5"
				/>
			</div>
			<div>
				<FoundDoc />
			</div>
			<FindYourDoctor />
			<MostSearchedSpecialists />
		</div>
	);
};