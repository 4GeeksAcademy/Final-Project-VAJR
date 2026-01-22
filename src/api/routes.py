"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint,request
from api.models import db, Pacient,Doctors,Appointments,Availability
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from datetime import datetime,timedelta,time

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/api/doctor/<int:doctor_id>/availability', methods=['GET'])
def get_doctor_availability(doctor_id):
    #obtenemos config horario doctor
    availabilities = Availability.query.filter_by(id_doctor=doctor_id).all()
    #citas ya reservadas
    booked_appointments = Appointments.query.filter_by(doctors_id=doctor_id).all()
    #guardar horas ocupadas
    booked_hours =[appt.appointment_hour for appt in booked_appointments]

    all_slots = [],

    for entry in availabilities :
        start_dt = datetime.combine(datetime.today(),entry.start_time)
        end_dt = datetime.combine(datetime.today(),entry.end_time)
        #genero intervalos de 30min 
        current_slot = start_dt
        while current_slot + timedelta(minutes=30) <= end_dt:
            time_str = current_slot.strftime("%H:%M")
            #si ya existe una cita a esa hora el slot lo deberia omitir
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
        #convertir str en obj time de python 
        start_time = time.fromisoformat(data['start']),
        end_time = time.fromisoformat(data['end']),
        id_doctor = data['id_doctor']
    )

    db.session.add(new_availability)
    db.session.commit()

    return jsonify({"msg": "Schedule set successfully"})