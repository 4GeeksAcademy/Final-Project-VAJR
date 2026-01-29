import { Link } from "react-router-dom";

export const FindYourDoctor = () => {


	return (
		<>
			<div className="container rounded-5" style={{ backgroundColor: "#E9F5FF" }}>
				<div className="container-fluid p-3 d-flex justify-content-center my-5">
					<img src="https://static.vecteezy.com/system/resources/previews/047/248/667/non_2x/medical-3d-medical-icon-3d-medical-symbol-3d-medical-image-free-png.png"
						alt="Doctor image"
						style={{ height: "300px" }}
						className="me-5"
					/>
					<div>
						<h1 style={{ fontSize: "25px" }} className="mt-5"><b>Don't know what doctor to look for?</b></h1>
						<p style={{ fontSize: "20px" }}>Sign up, answer a few questions and we will suggest one just for you!</p>
						<div className="d-flex ">
							<Link to="/symptom-checker">
								<button id="FindYourDoctor-button" type="button" className="btn btn-outline-info fs-5 shadow mt-3" style={{ color: "#1A5799", borderColor: "#1A5799" }}>
									<i className="fa-solid fa-comment-medical" style={{ color: "#1A5799" }}></i> Find the best doctor
								</button>
							</Link>
						</div>
					</div>

				</div>
			</div>
		</>
	);
};