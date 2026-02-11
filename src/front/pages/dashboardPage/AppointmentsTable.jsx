import { AppointmentRow } from "./AppointmentRow"

export const AppointmentsTable= ({ appointments , onUpdateStatus}) => {

    return(
        <div className="card">
            <div className="card-body">
                <h5>Appointments</h5>
                <table className="table mt-3">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Hour</th>
                            <th>Patient</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        { appointments?.map(apt =>(
                            <AppointmentRow key={apt.id} apt={apt}
                             onUpdateStatus={onUpdateStatus}
                            />
                        )) }
                    </tbody>
                </table>
            </div>
        </div>
    )
}