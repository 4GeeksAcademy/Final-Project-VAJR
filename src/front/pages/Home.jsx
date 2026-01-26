import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	return (
		<div>
			<div className="container-fluid p-3 d-flex justify-content-center" style={{backgroundColor: "#E9F5FF"}}>
				<div>
					<h1 style={{fontSize: "50px"}} className="text-center mt-5"><b>Find the right care, right now</b></h1>
					<p className="text-center fs-5">More than 10+ specialties available, and over 1,000+ verified doctors signed up</p>
					<div className="d-flex justify-content-center">
						
						<button type="button" className="btn fs-3 shadow mt-3" style={{backgroundColor: "#1A5799", color: "#E9F5FF"}}>
							<i className="fa-solid fa-magnifying-glass" style={{color: "#e9f5ff"}}></i> Book now
						</button>
					</div>
				</div>
				<img src="https://cdn.dribbble.com/userupload/7843601/file/original-1c817c79717d27c25a72dd4e6e0d5af6.png" 
				alt="Doctor image" 
				style={{height: "300px"}}
				className="ms-5"
				/>
			</div>
		</div>
	);
};