import { StatCards } from "./StatCards"

export const DashboardStats = ( {appointments} ) => {

    const pending = appointments.filter(a => a.status === "Pending" ).length
    const confirmed = appointments.filter(a => a.status === "confirmed" ).length
    const cancelled = appointments.filter(a  => a.status === "cancelled").length

    return(
        <div className="row mb-4">
           <StatCards title="Pending" value={pending} color="warning"/>
           <StatCards title="Confirmed" value={confirmed} color="success"/>
           <StatCards title="Cancelled" value={cancelled} color="danger"/>
        </div>
    )
}