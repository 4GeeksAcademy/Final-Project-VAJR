
import os
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from flask_bcrypt import Bcrypt
from flask import Flask, request, jsonify, url_for, send_from_directory, Blueprint
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Pacient, Doctors, Appointments, Availability
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
# from models import Person
from api.models import db, Pacient, Doctors, Appointments, Availability, SpecialtyType
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from datetime import datetime, timedelta, time

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager

from flask_cors import CORS
from flask_bcrypt import Bcrypt

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)


CORS(app)
app.config["JWT_SECRET_KEY"] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

app.json.sort_keys = False

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




# PACIENT
  
@app.route('/pacient/signup', methods=['POST'])
def pacient_signup():
    request_body = request.get_json(silent=True)
    if request_body is None:
        return jsonify({'msg': 'Body is empty'}), 400
    if 'name' not in request_body:
        return jsonify({'msg': 'Please provide a name'}), 400
    if 'email' not in request_body:
        return jsonify({'msg': 'Please provide an email'}), 400

    existing_email = Pacient.query.filter_by(
        email=request_body['email']).first()
    if existing_email:
        return jsonify({'msg': 'Email already registered'}), 400

    if 'password' not in request_body:
        return jsonify({'msg': 'Please provide a password'}), 400

    pw_hash = bcrypt.generate_password_hash(
        request_body['password']).decode('utf-8')
    new_pacient = Pacient(email=request_body['email'],
                          password=pw_hash, name=request_body['name'], is_active=True)

    pacients_phone = None
    if 'phone' in request_body and request_body['phone']:
        existing_phone = Pacient.query.filter_by(
            phone=request_body['phone']).first()
        if existing_phone:
            return jsonify({'msg': 'Phone already in use'}), 400
        pacients_phone = request_body['phone']
        new_pacient.phone = pacients_phone

    db.session.add(new_pacient)
    db.session.commit()

    token = create_access_token(identity=new_pacient.email)

    return jsonify({'msg': 'New user created successfully',
                    'token': token}), 201


@app.route('/pacient/login', methods=['POST'])
def pacient_login():
    request_body = request.get_json(silent=True)
    if request_body is None:
        return jsonify({'msg': 'The body is empty'}), 400
    if 'password' not in request_body or 'email' not in request_body:
        return jsonify({'msg': 'You must provide an email and password'}), 400

    pacient = Pacient.query.filter_by(email=request_body['email']).first()
    if pacient is None:
        return jsonify({'msg': 'Invalid email or password'}), 400

    pw_check = bcrypt.check_password_hash(
        pacient.password, request_body['password'])
    if pw_check == False:
        return jsonify({'msg': 'Invalid email or password'}), 400

    token = create_access_token(identity=pacient.email)
    return jsonify({
        'msg': 'Login successful',
        'token': token
    }), 200


@app.route('/pacient', methods=['GET'])
@jwt_required()
def get_pacient():
    email = get_jwt_identity()
    pacient = Pacient.query.filter_by(email=email).first()

    if pacient is None:
        return jsonify({'msg': 'Patient not found'}), 404

    return jsonify(pacient.serialize()), 200


@app.route('/pacient', methods=['PUT'])
@jwt_required()
def update_pacient_info():
    request_body = request.get_json(silent=True)
    if request_body is None:
        return jsonify({'msg': 'Body is empty'}), 400

    email = get_jwt_identity()
    pacient = Pacient.query.filter_by(email=email).first()
    if pacient is None:
        return jsonify({'msg': 'Pacient does not exist'}), 404

    if 'name' in request_body:
        pacient.name = request_body['name']

    if 'email' in request_body and request_body['email'] != pacient.email:
        existing_email = Pacient.query.filter_by(
            email=request_body['email']).first()
        if existing_email:
            return jsonify({'msg': 'This email is already in use by another account'}), 400
        pacient.email = request_body['email']

    if 'phone' in request_body and request_body['phone'] != pacient.phone:
        existing_phone = Pacient.query.filter_by(
            phone=request_body['phone']).first()
        if existing_phone:
            return jsonify({'msg': 'This phone is already in use by another account'}), 400
        pacient.phone = request_body['phone']

    if 'password' in request_body:
        return jsonify({'msg': 'To change password, you must provide your old and new password'}), 400
    if 'new_password' in request_body and 'old_password' in request_body:
        if not bcrypt.check_password_hash(pacient.password, request_body['old_password']):
            return jsonify({'msg': 'Old password is incorrect'}), 401
        pacient.password = bcrypt.generate_password_hash(
            request_body['new_password']).decode('utf-8')
    elif 'new_password' in request_body and 'old_password' not in request_body:
        return jsonify({'msg': 'To change password, you must provide your old password'}), 400

    db.session.commit()
    return jsonify({'msg': 'Profile updated successfully', 'data': pacient.serialize()}), 200
 
# DOCTOR
  
@app.route('/doctor', methods=['POST'])
def add_doctors():

   



# crear cita
@app.route('/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    user_id = get_jwt_identity()
    body = request.get_json(silent=True)
    if not body:
            return jsonify({"msg": "el campo esta vacio"}), 400
    doctor_id = body.get('doctor_id')
    hour = body.get('hour')
    dateTime = body.get('dateTime')
    reason = body.get('reason')
    pacients = Pacient.query.get(user_id)
    if not pacients:
        return jsonify({"msg": "el usuario no existe"}), 404
    exists_appointment = Appointments.query.filter_by(
        doctor_id=doctor_id, dateTime=dateTime).first()
    if exists_appointment:
        return jsonify({"msg": "ya existe una cita para este doctor en esta fecha"}), 400
    new_appointment = Appointments(
        pacient_id=user_id,
        doctor_id=doctor_id,
        dateTime=dateTime,
        reason=reason,
        status='confirmada'
    )
    db.session.add(new_appointment)
    db.session.commit()
    return jsonify({"msg": "Cita creada exitosamente", "id": new_appointment.id, "Name": pacients.name}), 201

#listar citas pacientes 
@app.route('/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    user_id=get_jwt_identity()
    appointments=Appointments.query.filter_by(pacient_id=user_id).all()
    return jsonify([appointment.serialize() for appointment in appointments]),200

#listar cita especifica paciente
@app.route('/appointments/<int:id>', methods=['GET'])     
@jwt_required()
def get_appointment(id):            
    user_id=get_jwt_identity()
    appointments=Appointments.query.filter_by(id=id,pacient_id=user_id).first()
    
    if not appointments:
          return jsonify({"msg":"Cita no encontrada"}),404
    return jsonify([appointment.serialize() for appointment in appointments]),200

# listar citas doctor
@app.route('/appointments/doctors', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
        doctor_id=get_jwt_identity()
        appointments=Appointments.query.filter_by(doctor_id=doctor_id).all()
        if not appointments:
            return jsonify({"msg":"No hay citas para este doctor"}),404
        return jsonify([appointment.serialize() for appointment in appointments]),200

#listar cita especifica doctor
@app.route('/appointments/doctors/<int:id>', methods=['GET'])     
@jwt_required()
def get_doctor_appointment(id):
    doctor_id=get_jwt_identity()
    appointments=Appointments.query.filter_by(id=id,doctor_id=doctor_id).first()
    
    if not appointments:
          return jsonify({"msg":"Cita no encontrada"}),404
    return jsonify([appointment.serialize() for appointment in appointments]),200

#cancelar cita paciente 
@app.route('/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(id):
    user_id=get_jwt_identity()  
    appointments=Appointments.query.filter_by(id=id,pacient_id=user_id).first()
    if not appointments:
        return jsonify({"msg":"Cita no encontrada"}),404
    appointments.status="cancelled"
    db.session.commit()
    return jsonify({"msg":"Cita cancelada exitosamente"}),200

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
