

export const DoctorProfileCard = ({ doctor }) => {

    if (!doctor) return null

    return (
        <div className="doctor-profile-card">
            <img
                src={doctor.picture}
                alt="Doctor"
                className="doctor-avatar"
            />

            <h5 className="mt-3">Dr. {doctor.name}</h5>
            <p className="text-primary">{doctor.specialties}</p>

            <button
                className="btn btn-outline-primary btn-sm mt-3 w-100"
            
            >
                Send schedule
            </button>
        </div>

    )
} 