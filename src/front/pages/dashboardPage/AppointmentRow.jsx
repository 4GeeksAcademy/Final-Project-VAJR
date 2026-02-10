export const AppointmentRow = ({ apt, onUpdateStatus }) => {

    const status = apt.status?.toLowerCase()

    return (
        <tr>
            <td>{apt.dateTime?.split(" ")[0]}</td>
            <td>{apt.dateTime?.split(" ")[1]}</td>
            <td>{apt.pacient_name}</td>

            <td>
                <span
                    className={`badge bg-${
                        status === "pending"
                            ? "warning"
                            : status === "confirmed"
                            ? "success"
                            : "danger"
                    }`}
                >
                    {status}
                </span>
            </td>

            <td>
                {status === "pending" && (
                    <>
                        <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => onUpdateStatus(apt.id, "confirmed")}
                        >
                            Confirm
                        </button>
                        <button
                            className="btn btn-sm btn-danger"
                            onClick={() => onUpdateStatus(apt.id, "cancelled")}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </td>
        </tr>
    )
}
