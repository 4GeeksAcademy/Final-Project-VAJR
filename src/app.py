"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Pacient, Doctors, Appointments, Availability
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime, timedelta, time

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace(
        "postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

@api.route('/doctor/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    # obtenemos config horario doctor
    availabilities = Availability.query.filter_by(id_doctor=doctor_id).all()
    # citas ya reservadas
    booked_appointments = Appointments.query.filter_by(
        doctors_id=doctor_id).all()
    # guardar horas ocupadas
    booked_hours = [appt.appointment_hour for appt in booked_appointments]

    all_slots = []

    for entry in availabilities:
        start_dt = datetime.combine(datetime.today(), entry.start_time)
        end_dt = datetime.combine(datetime.today(), entry.end_time)
        # genero intervalos de 30min
        current_slot = start_dt
        while current_slot + timedelta(minutes=30) <= end_dt:
            time_str = current_slot.strftime("%H:%M")
            # si ya existe una cita a esa hora el slot lo deberia omitir
            if time_str not in booked_hours:
                all_slots.append({
                    "day": entry.days,
                    "hour": time_str,
                    "availability_id": entry.id
                })

            current_slot += timedelta(minutes=30)

    return jsonify(all_slots), 200


@app.route('/api/availability', methods=['POST'])
def de_set_availability():
    data = request.json
    # Lo que espero: {"doctor_id": 1, "days": "Monday", "start": "09:00", "end": "17:00"}

    new_availability = Availability(
        days=data['days'],
        # convertir str en obj time de python
        start_time=time.fromisoformat(data['start']),
        end_time=time.fromisoformat(data['end']),
        id_doctor=data['doctor_id']
    )

    db.session.add(new_availability)
    db.session.commit()

    return jsonify({"msg": "Schedule set successfully"})

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object


@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints


@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
