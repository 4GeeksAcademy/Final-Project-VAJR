"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.emailp import send_email
from api.models import db, Pacient, Doctors, Appointments, Availability,StatusAppointment
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import secrets
from flask_cors import cross_origin
import os
import datetime
from datetime import time, timedelta, timezone
from sendgrid import SendGridAPIClient
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

api = Blueprint("api", __name__)

# Allow CORS requests to this API
CORS(api, resources={r"/*": {"origins": "*"}})
bcrypt = Bcrypt()

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

@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
"message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
}
    return jsonify(response_body), 200

@api.route('/pacient/signup', methods=['POST'])
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

    pw_hash = bcrypt.generate_password_hash(request_body['password']).decode('utf-8')
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
    return jsonify({'msg': 'New user created successfully', 'token': token}), 201

#appointments

@api.route('/api/appointments/', methods=['POST'])
@jwt_required()
def create_appointment():
    email_pacient = get_jwt_identity()


    if not email_pacient:
        return jsonify({"msg": "Missing or invalid token"}), 401
    
    body = request.get_json(silent=True)
    if not body:
            return jsonify({"msg": "el campo esta vacio"}), 400
    
    doctor_id = body.get('doctor_id')
    dateTime_raw = body.get('dateTime')
    reason = body.get('reason')
    cal_booking_id = body.get('cal_booking_id')

    if not doctor_id or not dateTime or not reason:
        return jsonify({"msg": "Faltan campos requeridos"}), 400
    
    pacient = Pacient.query.filter_by(email=email_pacient).first()
    if not pacient:
        return jsonify({"msg": "el usuario no existe"}), 404

    try:
        # Convertir la fecha ISO de Cal.com a objeto datetime de Python
        clean_date = dateTime_raw.replace('Z', '')
        dt_object = datetime.fromisoformat(clean_date)
    
        new_appointment = Appointments(
            pacient_id=pacient.id,
            doctor_id=doctor_id,
            dateTime=dt_object,
            reason=reason,
            status=StatusAppointment.confirmed,
            cal_booking_id = cal_booking_id
        )
        db.session.add(new_appointment)
        db.session.commit()

        return jsonify({"msg": "Appointment created successfully.", "Appointment":new_appointment.serialize()}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear cita: {str(e)}")
        return jsonify({'msg': 'Error interno al procesar la cita'}), 500

@api.route('/appointments/<int:id>', methods=['PUT'])
@jwt_required()
def update_appointment(id):
    data = request.json
    appointment = Appointments.query.get(id)
    
    if "dateTime" in data:
        appointment.dateTime = datetime.strptime(data["dateTime"], "%Y-%m-%dT%H:%M:%S.%fZ")
    if "reason" in data:
        appointment.reason = data["reason"]
        
    db.session.commit()
    return jsonify({"msg": "Cita actualizada"}), 200



@api.route("/pacient/forgotpassword",  methods=['POST'])
def forgot_pw_pacient():
    data=request.get_json(silent=True);
    email=data.get("email");

    if not email:
        return jsonify({"msg": "Required email"}), 400
    
    pacient=Pacient.query.filter_by(email=email).first()

    if not pacient:
            return jsonify({"msg": "The email address is not registered"}), 404

    token = secrets.token_urlsafe(32)
    #guardar
    pacient.reset_token=token
    pacient.reset_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.session.commit()

    reset_link=f"{os.getenv('FRONTEND_URL')}/api/pacient/resetpassword?token={token}"
    try:
     send_sendgrid_email(
        to=email,
        subject="Password Recovery",
       html_content=f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>Hello, {pacient.name}</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to continue:</p>
            <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
            </div>
            """)
    except Exception as e:
      
       return jsonify({"error": "Email could not be sent"}), 500
    return jsonify({"message": "Email received. Please check your email."}), 200

@api.route("/pacient/resetpassword", methods=["POST", "OPTIONS"])
def resetpassword():
    # Manejar solicitud preflight de CORS
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"msg": "Required information"}), 400

    token = data.get("token")
    new_password = data.get("new_password") or data.get("password")
    
    if not token or not new_password:
        return jsonify({"msg": "Token and new password are required."}), 400
     
    pacient = Pacient.query.filter_by(reset_token=token).first()
    if not pacient:
        return jsonify({"msg": "El enlace es inválido o ya ha sido usado."}), 404
    
    if not pacient.reset_expires or pacient.reset_expires.replace(tzinfo=datetime.timezone.utc) < datetime.datetime.now(datetime.timezone.utc):
        return jsonify({"valid": False, "msg": "El token ha expirado"}), 400
    
    pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    pacient.password = pw_hash
    
    pacient.reset_token = None
    pacient.reset_expires = None
    
    db.session.commit()
    return jsonify({"msg": "Password updated successfully."}), 200
           

 #doctor rese
@api.route("/doctor/forgotpassword",  methods=['POST','OPTIONS'])
def forgot_pw_doctor():
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    data=request.get_json(silent=True);
    email=data.get("email");

    if not email:
        return jsonify({"msg": "Email requerido"}), 400
    
    doctor=Doctors.query.filter_by(email=email).first()

    if not doctor:
        return jsonify({"msg": "The email address is not registered"}), 404

    token = secrets.token_urlsafe(32)
    #guardar
    doctor.reset_token=token
    doctor.reset_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.session.commit()

    reset_link=f"{os.getenv('FRONTEND_URL')}/api/doctor/resetpassword?token={token}"
    try:
     send_sendgrid_email(
        to=email,
        subject="Password Recovery",
       html_content=f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2>Hello, {doctor.name}</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to continue:</p>
            <a href="{reset_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 1 hour. If you did not request this, you can ignore this email.</p>
            </div>
            """)
    except Exception as e:
      
       return jsonify({"error": "Email could not be sent"}), 500
    return jsonify({"message": "Email received. Please check your email."}), 200

@api.route("/doctor/resetpassword", methods=["POST", "OPTIONS"])
def resetpassword_doct():
    # Manejar solicitud preflight de CORS
    if request.method == "OPTIONS":
        return jsonify({}), 200
    
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"msg": "Required information"}), 400

    token = data.get("token")
    new_password = data.get("new_password") or data.get("password")
    
    if not token or not new_password:
        return jsonify({"msg": "Token and new password are required."}), 400
     
    doctor = Doctors.query.filter_by(reset_token=token).first()
    if not doctor:
        return jsonify({"msg": "El enlace es inválido o ya ha sido usado."}), 404
    
    if not doctor.reset_expires or doctor.reset_expires.replace(tzinfo=datetime.timezone.utc) < datetime.datetime.now(datetime.timezone.utc):
        return jsonify({"valid": False, "msg": "El token ha expirado"}), 400
    
    pw_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    doctor.password = pw_hash
    
    doctor.reset_token = None
    doctor.reset_expires = None
    
    db.session.commit()
    return jsonify({"msg": "Password updated successfully."}), 200