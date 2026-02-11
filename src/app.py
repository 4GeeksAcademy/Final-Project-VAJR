
from api.models import StatusAppointment
from api.models import db, Pacient, Doctors, Appointments, Availability, SpecialtyType, StatusAppointment
from sendgrid.helpers.mail import Mail as SendGridMail
from sendgrid import SendGridAPIClient
from flask_mail import Mail, Message
from api.commands import setup_commands
from api.admin import setup_admin
from api.routes import api
from api.utils import APIException, generate_sitemap
from flask_swagger import swagger
from flask_migrate import Migrate
from flask import Flask, request, jsonify, url_for, send_from_directory, Blueprint
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
import datetime
from datetime import datetime, time, timedelta
import os
from api.models import StatusAppointment
import requests
import time
import json
from datetime import datetime, time, timedelta, timezone
from flask_cors import cross_origin
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import text
load_dotenv()


# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')


app = Flask(__name__)

CORS(app, origins="*")


bcrypt = Bcrypt(app)

app.url_map.strict_slashes = False

app.config["JWT_SECRET_KEY"] = os.getenv('SUPER_SECRET_TOKEN')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
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
# mail

# mail


def send_sendgrid_email(to, subject, html_content):
    message = Mail(
        from_email=os.getenv('FROM_EMAIL'),
        to_emails=to,
        subject=subject,
        html_content=html_content)
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        response = sg.send(message)
        print(f"Email enviado: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error SendGrid: {e}")
        return False


bcrypt = Bcrypt(app)
app.register_blueprint(api, url_prefix="/api")


@app.route('/api/doctor/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    # obtenemos config horario doctor
    availabilities = Availability.query.filter_by(id_doctor=doctor_id).all()
    # citas ya reservadas
    booked_appointments = Appointments.query.filter_by(
        doctor_id=doctor_id).all()
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


@app.route('/api/doctor/register', methods=['POST'])
def register_doctor():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Need to send something in body'}), 400
    if 'name' not in body:
        return jsonify({'msg': 'Name is requiered'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'Email is required'}), 400
    if 'specialties' not in body:
        return jsonify({'msg': 'specialties field is required'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'Password is required'}), 400
    if 'phone' not in body:
        return jsonify({'msg': 'Phone is required'}), 400
    if 'address' not in body:
        return jsonify({'msg': 'address is required'}), 400

    user = Doctors.query.filter_by(email=body['email']).first()

    if user != None:
        return jsonify({'msg': 'this email already have an account.'}), 400

    new_doctor = Doctors()

    new_doctor.name = body['name']
    new_doctor.phone = body['phone']
    new_doctor.email = body['email']
    new_doctor.specialties = body['specialties']
    pw_hash = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_doctor.password = pw_hash
    new_doctor.biography = body['biography']
    new_doctor.address = body['address']
    new_doctor.latitud = body['latitud']
    new_doctor.longitud = body['longitud']
    new_doctor.picture = body.get('picture', '')
    new_doctor.cal_link = body['cal_link']
    db.session.add(new_doctor)
    db.session.commit()
    return jsonify({'msg': 'User create succesfully.'}), 200


@app.route('/api/doctor/login', methods=['POST'])
def doctor_login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'All field required.'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'email is required'}), 400
    if 'password' not in body:
        return jsonify({'msg': 'password is required'}), 400

    user = Doctors.query.filter_by(email=body['email']).first()

    if user is None:
        return jsonify({'msg': 'Email or password is incorrect'}), 400
    is_hash_pw_correct = bcrypt.check_password_hash(
        user.password, body['password'])
    if is_hash_pw_correct == False:
        return jsonify({'msg': 'Email or password is incorrect'}), 400

    access_token = create_access_token(identity=user.email)
    return jsonify({'msg': 'login successfully',
                    'token': access_token,
                    'doctor': user.serialize()}), 200


@app.route('/api/doctor/private', methods=['GET'])
@jwt_required()
def private_doctor():
    user_doctor = get_jwt_identity()
    return jsonify({'msg': f'You are login in {user_doctor}'}), 200


@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # avoid cache memory
    return response

# PACIENT


@app.route('/api/pacient/register', methods=['POST'])
def loginPacient():
    request_body = request.get_json(silent=True)
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


@app.route('/api/pacient/login', methods=['POST'])
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
    pw_check = bcrypt.check_password_hash(
        pacient.password, request_body['password'])
    if pw_check == False:
        return jsonify({'msg': 'Invalid email or password'}), 400

    token = create_access_token(identity=pacient.email)
    return jsonify({
        'msg': 'Login successful',
        'token': token,
        'pacient': pacient.serialize()
    }), 200


@app.route('/api/pacient', methods=['GET'])
@jwt_required()
def get_pacient():
    email = get_jwt_identity()
    pacient = Pacient.query.filter_by(email=email).first()

    if pacient is None:
        return jsonify({'msg': 'Patient not found'}), 404

    return jsonify(pacient.serialize()), 200


@app.route('/api/pacient', methods=['PUT'])
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


@app.route('/api/doctor', methods=['GET'])
def get_all_doctors():
    doctores = Doctors.query.all()
    new_serialise_doctors = []

    for doctor in doctores:
        new_serialise_doctors.append(doctor.serialize())
    return jsonify({'msg': new_serialise_doctors}), 200


@app.route('/api/doctor/<int:doctor_id>', methods=['GET'])
def get_single_doctor(doctor_id):
    doctor = Doctors.query.get(doctor_id)
    if doctor is None:
        return jsonify({'msg': 'Doctor not exist'}), 400
    return jsonify({'data': doctor.serialize()}), 200


@app.route('/api/doctor/<int:doctor_id>', methods=['PUT'])
def edit_doctor(doctor_id):
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'body can not empty'}), 400

    doctor = Doctors.query.get(doctor_id)

    if doctor is None:
        return jsonify({'msg': 'can not find this doctor'}), 400

    if 'name' in body:
        doctor.name = body['name']
    if 'email' in body:
        doctor.email = body['email']
    if 'specialties' in body:
        doctor.specialties = SpecialtyType[body['specialties']]
    if 'biography' in body:
        doctor.biography = body['biography']
    if "address" in body:
        doctor.address = body['address']
    if "latitud" in body:
        doctor.latitud = body['latitud']
    if 'longitud' in body:
        doctor.longitud = body['longitud']
    if 'picture' in body:
        doctor.picture = body['picture']
    if 'phone' in body:
        doctor.phone = body['phone']
    db.session.commit()
    if 'cal_link' in body:
        doctor.cal_link = body['cal_link']
    return jsonify({'msg': 'doctor update succesfully',
                    'data': doctor.serialize()}), 200


@app.route('/api/doctors', methods=['GET'])
def specialidad():
    speciality = request.args.get("specialty")

    query = Doctors.query

    if speciality:
        if speciality not in SpecialtyType.__members__:
            return jsonify({'msg': 'Invalid speciality'}), 400
        query = query.filter(Doctors.specialties == SpecialtyType[speciality])

        doctors = query.all()
        return jsonify([doct.serialize() for doct in doctors]), 200


@app.route('/hooks/cal-booking', methods=['POST'])
def cal_webhook_receiver():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"msg": "Payload vacío"}), 400

    trigger_event = data.get('triggerEvent')
    payload = data.get('payload', {})

    print(f"\n--- 🔔 WEBHOOK RECIBIDO: {trigger_event} ---")

    # 1. IDENTIFICACIÓN POR EL CAMPO 'type'
    # Según tus logs, el slug está en payload['type'] o en la metadata
    event_slug = payload.get('type')  # Ej: "vanessa" o "Reunión de 30 min"

    # Si el 'type' es el nombre largo, intentamos sacarlo de la metadata o el bookerUrl
    if not event_slug or " " in event_slug:
        # Cal.com a menudo guarda el slug técnico aquí:
        event_slug = payload.get('metadata', {}).get('eventSlug')

    # 2. Identificar email del paciente (el que hizo la reserva)
    attendees = payload.get('attendees', [{}])
    pacient_email = attendees[0].get('email') if attendees else None

    print(f"🔎 Buscando Doctor para el slug: '{event_slug}'")
    print(f"🔎 Buscando Paciente por email: '{pacient_email}'")

    # 3. BUSQUEDA EN DB
    # Buscamos al doctor cuyo 'cal_link' contenga el slug (ej: "ruben.../vanessa")
    doctor = None
    if event_slug:
        # Filtramos ignorando mayúsculas/minúsculas
        doctor = Doctors.query.filter(
            Doctors.cal_link.ilike(f"%/{event_slug}")).first()

    pacient = Pacient.query.filter_by(email=pacient_email).first()

    if not doctor or not pacient:
        print(
            f" ❌ ERROR: Doctor ({'No hallado' if not doctor else 'OK'}) o Paciente ({'No hallado' if not pacient else 'OK'})")
        # Devolvemos 200 para que Cal.com no reintente, pero avisamos que no procesamos
        return jsonify({"msg": "Actor no encontrado", "debug_slug": event_slug}), 200

    # --- Lógica de Creación de Cita ---
    if trigger_event == "BOOKING_CREATED":
        try:
            # Procesamos la fecha
            start_time_str = payload.get('startTime').replace('Z', '+00:00')
            dt_object = datetime.fromisoformat(start_time_str)

            new_appointment = Appointments(
                pacient_id=pacient.id,
                doctor_id=doctor.id,
                dateTime=dt_object,
                reason=f"{payload.get('title')}",
                status=StatusAppointment.confirmed
            )
            db.session.add(new_appointment)
            db.session.commit()
            print(
                f" ✅ CITA CREADA: Dr. {doctor.name} con paciente {pacient.email}")
            return jsonify({"msg": "Cita creada exitosamente"}), 201
        except Exception as e:
            db.session.rollback()
            print(f" ❌ Error en DB: {str(e)}")
            return jsonify({"msg": str(e)}), 500

    return jsonify({"msg": "Evento ignorado"}), 200

# Appointments


# listar citas pacientes
@app.route('/api/appointments/<int:id>', methods=['GET'])
@jwt_required()
def get_appointments_p(id):
    pacient_email = get_jwt_identity()

    pacient = Pacient.query.filter_by(email=pacient_email).first()

    if not pacient:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    appointment = Appointments.query.filter_by(
        id=id, pacient_id=pacient.id).first()

    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404

    return jsonify(appointment.serialize()), 200

# listar cita


@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appt_pacient():
    pacient_email = get_jwt_identity()

    pacient = Pacient.query.filter_by(email=pacient_email).first()

    if not pacient:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    appointments = Appointments.query.filter_by(pacient_id=pacient.id).all()

    if not appointments:
        return jsonify([]), 200

        # return jsonify({"msg":"Cita no encontrada"}),404
    return jsonify([a.serialize() for a in appointments]), 200


@app.route('/api/appointments/doctor/<int:id>', methods=['GET'])
@jwt_required()
def get_doctor_appointment_d(id):
    doctor_id = get_jwt_identity()
    appointment = Appointments.query.filter_by(
        id=id, doctor_id=doctor_id).first()

    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404
    return jsonify(appointment.serialize()), 200

# listar citas pacientes


@app.route('/api/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def update_appointments(id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"msg": "Datos inválidos"}), 400

    pacient_email = get_jwt_identity()
    pacient = Pacient.query.filter_by(email=pacient_email).first()
    if not pacient:
        return jsonify({"mgs": "User not found"})

    appointment = Appointments.query.filter_by(
        id=id, pacient_id=pacient.id).first()
    if not appointment:
        return jsonify({"msg": "Appointments not found "})
    if "dateTime" in data:
        appointment.dateTime = data["dateTime"]
    if "reason" in data:
        appointment.reason = data["reason"]

    db.session.commit()
    return jsonify(appointment.serialize()), 200


@app.route('/api/appointments/<int:id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(id):
    pacient_email = get_jwt_identity()
    pacient = Pacient.query.filter_by(email=pacient_email).first()

    if not pacient:
        return jsonify({"msg": "Paciente no encontrado"}), 404

    appointment = Appointments.query.filter_by(
        id=id,
        pacient_id=pacient.id
    ).first()

    if not appointment:
        return jsonify({"msg": "Cita no encontrada"}), 404

    appointment.status = StatusAppointment.cancelled
    db.session.commit()

    return jsonify({"msg": "Cita cancelada correctamente"}), 200


@app.route('/api/doctor/appointments', methods=['GET'])
@jwt_required()
def get_doctor_appointments():
    doctor_email = get_jwt_identity()

    doctor = Doctors.query.filter_by(email=doctor_email).first()
    if not doctor:
        return jsonify({'msg': 'doctor not found'}), 404

    appointments = Appointments.query.filter_by(doctor_id=doctor.id).all()
    return jsonify({'appointments': [app.serialize() for app in appointments]}), 200


@app.route('/api/doctor/appointments/<int:apt_id>', methods=['PUT'])
@jwt_required()
def update_appointment_status(apt_id):
    doctor_email = get_jwt_identity()

    doctor = Doctors.query.filter_by(email=doctor_email).first()
    if not doctor:
        return jsonify({'msg': 'Doctor not found'}), 404

    body = request.get_json(silent=True)
    if not body or 'status' not in body:
        return jsonify({'msg': 'Status is required'}), 400

    appointment = Appointments.query.filter_by(
        id=apt_id,
        doctor_id=doctor.id
    ).first()

    if not appointment:
        return jsonify({'msg': 'Appointment not found'}), 404

    try:
        appointment.status = StatusAppointment(body['status'].lower())
    except ValueError:
        return jsonify({
            "msg": "Invalid status",
            "allowed": [s.value for s in StatusAppointment]
        }), 400

    db.session.commit()

    return jsonify({
        'appointment': appointment.serialize()
    }), 200

# esta cita para guarda los appoint.... del doctor en la base de datos


@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    pacient_email = get_jwt_identity()
    data = request.get_json()

    pacient = Pacient.query.filter_by(email=pacient_email).first()
    if not pacient:
        return jsonify({"msg": "Patient not found"}), 404

    doctor = Doctors.query.get(data.get("doctor_id"))
    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404

    new_appointment = Appointments(
        pacient_id=pacient.id,
        doctor_id=doctor.id,
        dateTime=datetime.fromisoformat(data["dateTime"].replace("Z", "")),
        reason=data.get("reason", ""),
        status=StatusAppointment.confirmed
    )

    db.session.add(new_appointment)
    db.session.commit()

    return jsonify(new_appointment.serialize()), 201


# Available appointments for doctor profile page


@app.route('/api/doctor/<int:doctor_id>/calendar', methods=['GET'])
def get_doctor_calendar(doctor_id):
    availabilities = Availability.query.filter_by(id_doctor=doctor_id).all()
    booked_appointments = Appointments.query.filter_by(
        doctor_id=doctor_id).all()
    booked_slots = {appt.dateTime.strftime(
        "%Y-%m-%d %H:%M") for appt in booked_appointments}

    calendar_data = []
    today = datetime.now()

    for i in range(14):
        current_date = today + timedelta(days=i)
        current_day_name = current_date.strftime("%A")

        day_slots = set()

        for rule in availabilities:
            rule_days = [day.strip().lower() for day in rule.days.split(',')]

            if current_day_name.lower() in rule_days:
                slot_time = datetime.combine(
                    current_date.date(), rule.start_time)
                end_time = datetime.combine(current_date.date(), rule.end_time)

                while slot_time + timedelta(minutes=30) <= end_time:
                    slot_iso = slot_time.strftime("%Y-%m-%d %H:%M")

                    if slot_time > today and slot_iso not in booked_slots:
                        day_slots.add(slot_time.strftime("%H:%M"))

                    slot_time += timedelta(minutes=30)

        if day_slots:
            calendar_data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day_name": current_date.strftime("%a"),
                "day_number": current_date.day,
                "slots": sorted(day_slots)
            })

    return jsonify(calendar_data), 200


def local_time_to_cal_format(local_start, local_end):

    start = f"1970-01-01T{local_start}:00.000Z"
    end = f"1970-01-01T{local_end}:00.000Z"

    return start, end


@app.route('/api/doctor/<int:doctor_id>/sync-cal', methods=['POST'])
def sync_doctor_schedule_to_cal(doctor_id):
    print(f"\n🚀 SINCRONIZACIÓN QUIRÚRGICA - Doc ID: {doctor_id}")

    CAL_API_KEY = os.getenv("CAL_API_KEY")
    params = {"apiKey": CAL_API_KEY}

    # 1. Obtener disponibilidad de tu DB local (PostgreSQL)
    local_availability = Availability.query.filter_by(
        id_doctor=doctor_id).all()
    print(f"🔎 Reglas locales encontradas: {len(local_availability)}")

    try:
        # 2. Obtener el ID del horario 'ruben'
        get_resp = requests.get(
            "https://api.cal.com/v1/schedules", params=params)
        schedules = get_resp.json().get('schedules', [])
        print(schedules)
        target_schedule = next(
            (s for s in schedules if s.get('name') == "ruben"), None)
        print(target_schedule)

        if not target_schedule:
            return jsonify({"msg": "No se encontró el horario 'ruben'"}), 404

        schedule_id = target_schedule['id']
        existing_rules = target_schedule.get('availability', [])

        if existing_rules:
            print(
                f"🧹 Borrando {len(existing_rules)} reglas antiguas para evitar conflictos...")
            for old_rule in existing_rules:
                requests.delete(
                    f"https://api.cal.com/v1/availabilities/{old_rule['id']}", params=params)

            print("⏳ Esperando propagación de borrado...")
            time.sleep(2)

        # 4. INSERCIÓN LIMPIA: Solo los campos estrictamente necesarios
        day_mapping = {
            "Sunday": 0, "Monday": 1, "Tuesday": 2, "Wednesday": 3,
            "Thursday": 4, "Friday": 5, "Saturday": 6
        }

        success_count = 0
        for rule in local_availability:
            # Mapear días
            active_days = [day_mapping[d.capitalize()]
                           for d in day_mapping if d.lower() in rule.days.lower()]

            if active_days:
                # PAYLOAD MÍNIMO: Sin 'date', sin 'eventTypeId', sin nada extra.
                # Usamos formato HH:MM (algunos DBs de Cal preferen esto en el POST)
                start, end = local_time_to_cal_format(
                    rule.start_time.strftime("%H:%M"),
                    rule.end_time.strftime("%H:%M")
                )
                payload = {
                    "scheduleId": schedule_id,
                    "days": active_days,
                    "startTime": start,
                    "endTime": end,
                }

                print(f"📤 Enviando: {json.dumps(payload)}")
                post_resp = requests.post(
                    "https://api.cal.com/v1/availabilities", json=payload, params=params)

                if post_resp.status_code in [200, 201]:
                    print(f"   ✅ Éxito: Días {active_days}")
                    success_count += 1
                else:
                    print(f"   ❌ Error: {post_resp.text}")

        return jsonify({"msg": f"Sincronización terminada. {success_count} reglas creadas."}), 200

    except Exception as e:
        print(f"❌ Error crítico: {str(e)}")
        return jsonify({"msg": f"Error: {str(e)}"}), 500


@app.route('/api/doctor/<int:doctor_id>/edit-availability', methods=['PUT'])
def edit_doctor_availability(doctor_id):
    data = request.json
    print(f"📥 Recibiendo edición para Doc ID: {doctor_id}")

    # 1. Buscar si el doctor ya tiene una disponibilidad creada
    # Usamos .filter_by(id_doctor=...) porque así se llama tu FK en el modelo
    availability = Availability.query.filter_by(id_doctor=doctor_id).first()

    try:
        if not availability:
            print("✨ Creando nueva disponibilidad local...")
            availability = Availability(id_doctor=doctor_id)
            db.session.add(availability)

        # 2. Actualizar los campos según tu modelo
        # Importante: convertimos el string "08:00" a un objeto 'time' de Python
        availability.days = data.get('days')
        availability.start_time = datetime.strptime(data.get('start'), "%H:%M").time()
        availability.end_time = datetime.strptime(data.get('end'), "%H:%M").time()

        db.session.commit()
        print(f"✅ DB Local actualizada para Doc {doctor_id}")

        # 3. Disparar la sincronización automática
        # Llamamos a tu función de sincronización que ya funciona
        return sync_doctor_schedule_to_cal(doctor_id)

    except Exception as e:
        db.session.rollback()
        print(f"❌ Error al editar: {str(e)}")
        return jsonify({"msg": f"Error al guardar: {str(e)}"}), 500

# this only runs if `$ python src/main.py` is execute
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
