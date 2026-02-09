import { useEffect, useState } from "react";
import "./calendar-style.css";

export const DocttoCalendar = ({ doctorId }) => {
    const [calendarDays, setCalendarDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedDays, setExpandedDays] = useState({});

    useEffect(() => {
        const fetchCalendar = async () => {
            if (!doctorId) return;
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const url = `${backendUrl.replace(/\/$/, '')}/api/doctor/${doctorId}/calendar`;

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const limitedData = data.slice(0, 4).map((day, index) => ({
                        ...day,
                        id: index,
                        allSlots: day.slots.sort(),
                        slots: day.slots.sort().slice(0, 4)
                    }));
                    console.log(data)
                    setCalendarDays(limitedData);
                }
            } catch (error) {
                console.error("Error fetching calendar:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, [doctorId]);

    const toggleDayExpansion = (dayId) => {
        setExpandedDays(prev => ({
            ...prev,
            [dayId]: !prev[dayId]
        }));
    };

    const handleSlotClick = (date, time) => {
        return
    };

    if (loading) return (
        <div className="d-flex justify-content-center p-3">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (calendarDays.length === 0) return (
        <div className="text-center text-muted p-3">
            No availability found.
        </div>
    );

    return (
        <div className="calendar-wrapper w-100 border rounded bg-white p-2">
            <div
                className="d-flex overflow-auto pb-2 gap-3"
                style={{ scrollbarWidth: "thin" }}
            >
                {calendarDays.map((day) => {
                    const isExpanded = expandedDays[day.id];
                    const hasMoreSlots = day.allSlots.length > 4;
                    const slotsToShow = isExpanded ? day.allSlots : day.slots;

                    return (
                        <div
                            key={day.id}
                            className="day-column d-flex flex-column align-items-center"
                            style={{ minWidth: "100px" }}
                        >
                            <div className="text-center mb-3 w-100 p-2 bg-light rounded">
                                <div className="fw-bold text-uppercase" style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                                    {day.day_name}
                                </div>
                                <div className="fs-5 fw-bold text-dark">
                                    {day.day_number}
                                </div>
                            </div>

                            <div className="d-flex flex-column gap-2 w-100">
                                {slotsToShow.map((time, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSlotClick(day.date, time)}
                                        className="btn btn-sm fw-semibold"
                                        style={{
                                            backgroundColor: "#1A5799",
                                            color: "#E9F5FF",
                                            border: "none",
                                            padding: "8px 0",
                                            fontSize: "0.85rem"
                                        }}
                                    >
                                        {time}
                                    </button>
                                ))}

                                {/* Show More / Show Less Button */}
                                {hasMoreSlots && (
                                    <button
                                        onClick={() => toggleDayExpansion(day.id)}
                                        className="btn btn-sm fw-semibold"
                                        style={{
                                            backgroundColor: "transparent",
                                            color: "#1A5799",
                                            border: "1px solid #1A5799",
                                            padding: "6px 0",
                                            fontSize: "0.8rem"
                                        }}
                                    >
                                        {isExpanded ? "Show Less" : `+${day.allSlots.length - 4} More`}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};