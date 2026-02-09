
export const AppointmentRow = ({ apt,  onUpdateStatus }) =>{
    return(
       <tr>
        <td> {apt.appointment_date} </td>
        <td> {apt.appointment_hour} </td>
        <td> {apt.pacient_name} </td>

        <td>
            <span
            className={ `badge bg-${apt.status==="Pending" ? "warning"
                :
                apt.status==="Confirmed" ? "success"
                :
                "danger"
            }`}
            >
                {apt.status}
            </span>
        </td>
        <td>
            {
                apt.status === "Pending" && (
                    <>
                        <button className="btn btn-sm btn-success me-2"
                        onClick={() => onUpdateStatus(apt.id, "Confirmed")}
                        > Confirm </button>
                        <button className="btn btn-sm btn-danger"
                        onClick={() => onUpdateStatus(apt.id, "Cancelled")}
                        >Cancel</button>
                    </>
                )
            }
        </td>
       </tr>
    )
}