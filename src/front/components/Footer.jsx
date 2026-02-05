import { Link } from "react-router-dom";

export const Footer = () => (
    <>
        <footer className="footer mt-auto py-4 text-light">
            <div className="container">
                <div className="row justify-content-between align-items-start">
                    <div className="col-auto">
                        <div className="footer-brand mb-2">HiDoc</div>
                        <Link to="/" className="footer-link">Home</Link>
                    </div>

                    <div className="col-auto">
                        <div className="footer-heading">Top Specialties</div>
                        <div className="d-flex flex-column gap-1">
                            <Link to="/" className="footer-link">Cardiologist</Link>
                            <Link to="/" className="footer-link">Orthopedist</Link>
                            <Link to="/" className="footer-link">Dermatologist</Link>
                            <Link to="/" className="footer-link">Primary Care</Link>
                            <Link to="/" className="footer-link">Psychologist</Link>
                        </div>
                    </div>

                    <div className="col-auto">
                        <div className="footer-heading">Are you a doctor?</div>
                        <Link to="/" className="footer-link">Sign up as a doctor</Link>
                    </div>

                    <div className="col-auto">
                        <div className="footer-heading">Our Socials</div>
                        <div className="d-flex">
                            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <i className="fa-brands fa-instagram"></i>
                            </a>
                            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <i className="fa-brands fa-x-twitter"></i>
                            </a>
                            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <i className="fa-brands fa-facebook"></i>
                            </a>
                            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                                <i className="fa-brands fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        
        <div className="copyright text-center">
            From ®4GeeksAcademy by Andrea, Vanessa, Ruben and Judelin
        </div>
    </>
);