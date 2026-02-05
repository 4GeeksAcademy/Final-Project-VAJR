import './doctor-sticky-profile.css'


export const DoctorStickyProfile = ({ doctor, onClick }) => {
    if (!doctor?.name) return null
    return (
        <div className="doctor-sticky shadow-sm" >

            <div className='d-flex align-items-sm-end justify-content-sm-end'
                style={{ cursor: "pointer" }}
                onClick={onClick}
            >
                <img className='me-4' src={doctor.picture} alt={doctor.name} />
                <div className='me-3'>
                    <strong> {doctor.name} </strong>
                    <p> {doctor.specialties} </p>
                </div>
                <div className='mb- p-2 rounded'
                style={{ background: "#1a5799",
                }}
                >
                    <p style={{ color: "white"}}>View availability</p>
                </div>
            </div>
        </div>
    )
}