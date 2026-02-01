

export const StatCards = ({ title, value, color }) => {
return(
    <div className="col-md-4">
        <div className={`card-border-${color}`}>
            <div className="card-body text-center">
                <h5> {title} </h5>
                <h2> {value} </h2>
            </div>

        </div>

    </div>
)
}