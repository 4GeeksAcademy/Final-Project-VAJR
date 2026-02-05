import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";

export const SymptomChecker = () => {
    
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const resultsRef = useRef(null)

    const [suggestedDoctors, setSuggestedDoctors] = useState("")
    const [selectedSymptom, setSelectedSymptom] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const symptomDatabase = {
        "Headache": {
            specialists: ["Neurologist", "General Practitioner"],
            urgency: "medium"
        },
        "Dizziness": {
            specialists: ["Neurologist", "General Practitioner"],
            urgency: "medium"
        },
        "ChestPain": {
            specialists: ["Cardiologist", "Emergency Medicine"],
            urgency: "high" 
        },
        "Rash": {
            specialists: ["Dermatologist", "Allergist"],
            urgency: "low"
        },
        "JointPain": {
            specialists: ["Rheumatologist", "Orthopedist"],
            urgency: "medium"
        },
        "Cough": {
            specialists: ["Pulmonologist", "General Practitioner"],
            urgency: "medium"
        },
        "AbdominalPain": {
            specialists: ["Gastroenterologist", "General Practitioner"],
            urgency: "medium"
        },
        "Nausea": {
            specialists: ["Gastroenterologist", "General Practitioner"],
            urgency: "medium"
        },
        "BlurryVision": {
            specialists: ["Ophthalmologist", "Neurologist"],
            urgency: "high"
        },
        "Anxiety": {
            specialists: ["Psychiatrist", "Psychologist"],
            urgency: "medium"
        },
        "Fatigue": {
            specialists: ["General Practitioner", "Endocrinologist"],
            urgency: "low"
        },
        "WeightLoss": {
            specialists: ["Endocrinologist", "Nutritionist"],
            urgency: "low"
        },
        "BackPain": {
            specialists: ["Ortopaedic Surgeon", "Neurologist"],
            urgency: "low"
        },
        "Otalgia": {
            specialists: ["Otolaryngologist", "General Practitioner"], 
            urgency: "low"
        },
        "Pruritus": {
            specialists: ["Dermatologist", "Allergist"],
            urgency: "low"
        },
        "Trauma": {
            specialists: ["Orthopedic Surgeon", "Neurosurgeon"],
            urgency: "low"
        },
    }

    const symptomsList = [
        { label: "Headache", value: "Headache" },
        { label: "Dizziness", value: "Dizziness" },
        { label: "Chest Pain", value: "ChestPain" },
        { label: "Skin Rash", value: "Rash" },
        { label: "Joint Pain", value: "JointPain" },
        { label: "Cough", value: "Cough" },
        { label: "Abdominal Pain", value: "AbdominalPain" },
        { label: "Nausea", value: "Nausea" },
        { label: "Blurry Vision", value: "BlurryVision" },
        { label: "Anxiety", value: "Anxiety" },
        { label: "Fatigue", value: "Fatigue" },
        { label: "Unexplained Weight Loss", value: "WeightLoss" },
        { label: "Back Pain", value: "BackPain" },
        { label: "Ear Pain", value: "Otalgia" },
        { label: "Skin Itching", value: "Pruritus" },
        { label: "Trauma", value: "Trauma" },
    ]

    useEffect(() => {
        const verifyToken = (token) => {
            if (!token) return false
            try {
                const decoded = jwtDecode(token)
                const TimeNow = Date.now() / 1000
                return decoded.exp > TimeNow
            } catch (error) {
                return false
            }
        };
        if (!verifyToken(token)) {
            navigate("/login")
        }
    }, [token, navigate])

    const getDoctorSpecialty = (mainSymptom) => {
        const data = symptomDatabase[mainSymptom]
        
        if (!data) {
            alert("Please select a symptom first.")
        }

        return {
            doctor: data.specialists[0],
            alternatives: data.specialists.slice(1),
            urgency: data.urgency
        }
    }

    useEffect(() => {
        if (suggestedDoctors && resultsRef.current) {
            resultsRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            })
        }
    }, [suggestedDoctors])

    const handleSearch = () => {
        if (!selectedSymptom) {
            alert("Please select a symptom first.")
            return
        }

        setIsLoading(true)
        
        setTimeout(() => {
            const result = getDoctorSpecialty(selectedSymptom)
            setSuggestedDoctors(result)
            setIsLoading(false)
        }, 1000)
    }

    return (
        <div className="container mt-5">
            <h1 className="text-center fw-bold mb-2">What is the main issue you want to address?</h1>
            <p className="text-center text-muted fs-5 mb-4">Choose your main symptom below to begin your consultation.</p>
        
            {selectedSymptom === "ChestPain" && (
                <div className="alert alert-danger text-center mb-4 shadow-sm">
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    <strong>Warning:</strong> Chest pain may require immediate attention. If severe, call emergency services.
                </div>
            )}

            <div className="d-flex justify-content-center mb-5">
                <div className="rounded-4 shadow-sm p-4" 
                    style={{ 
                        backgroundColor: "#E3F2FD", 
                        width: "100%", 
                        maxWidth: "450px",
                        minHeight: "550px"
                    }}>
                    
                    {symptomsList.map((s) => (
                        <div className="form-check mb-3" key={s.value}>
                            <input 
                                className="custom-radio" 
                                type="radio" 
                                name="symptomsCheck" 
                                id={s.value}
                                value={s.value}
                                checked={selectedSymptom === s.value}
                                onChange={(e) => setSelectedSymptom(e.target.value)}
                                style={{ 
                                    cursor: "pointer",
                                    width: "20px",
                                    height: "20px"
                                }}
                            />
                            <label 
                                className="radio-label ms-2 fs-4" 
                                htmlFor={s.value}
                            >
                                {s.label}
                            </label>
                        </div>
                    ))}

                    <div className="d-flex justify-content-center mt-4">
                        <button 
                            id="FindYourSpecialist-button"
                            type="button" 
                            className="btn btn-primary btn-lg px-4 py-2 rounded-3 shadow-sm"
                            style={{ 
                                backgroundColor: "#1A5799",
                                border: "none"
                            }}
                            onClick={handleSearch} 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-magnifying-glass me-2"></i>
                                    Find the right specialist
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {suggestedDoctors && (
                <div ref={resultsRef} className="d-flex justify-content-center mt-4 mb-5">
                    <div className={`alert ${suggestedDoctors.urgency === 'high' ? 'alert-danger' : 'alert-primary'} fs-5 shadow-sm`} 
                        role="alert" 
                        style={{ maxWidth: "450px", width: "100%" }}>
                        
                        <div className="d-flex align-items-center">
                            <i className={`fa-solid ${suggestedDoctors.urgency === 'high' ? 'fa-triangle-exclamation' : 'fa-user-doctor'} me-3 fs-2`}></i>
                            <div>
                                <h5 className="alert-heading mb-1">
                                    {suggestedDoctors.urgency === 'high' ? 'Urgent Care Needed' : 'Recommended Specialist'}
                                </h5>
                                <p className="mb-0">
                                    You should see a <strong>{suggestedDoctors.doctor}</strong> <br />
                                    {suggestedDoctors.alternatives && suggestedDoctors.alternatives.length > 0 && (
                                        <span className="d-block text-muted small mt-1">
                                            Also consider: {suggestedDoctors.alternatives.join(", ")}
                                        </span>
                                    )}
                                    Urgency: <strong>{suggestedDoctors.urgency}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}