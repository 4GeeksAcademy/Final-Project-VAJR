"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Pacient, Doctors, Appointments, Availability, SpecialtyType
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

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
 
# DOCTORS
  
@app.route('/doctor', methods=['POST'])
def add_doctors():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({"msg": "body can not empty"}), 400
    if 'name' not in body:
        return jsonify({"msg": 'Name is required.'}), 400
    if 'email' not in body:
        return jsonify({'msg': 'Email is required'}), 400
    # if ' password' not in body:
    #     return jsonify({'msg': 'password is required'}),400
    if 'specialities' not in body:
        return jsonify({'msg': 'Specialities is required'}), 400
    if 'biography' not in body:
        return jsonify({'msg': 'biography is required'}), 400
    if 'latitud' not in body:
        return jsonify({'msg': 'latitude is required'}), 400
    if 'longitud' not in body:
        return jsonify({'msg': 'longitude is required'}), 400
    if 'picture' not in body:
        return jsonify({'msg': 'need to upload some picture'}), 400
    if 'phone' not in body:
        return jsonify({'msg': 'phone is required'}), 400

    new_doctor = Doctors()

    new_doctor.name = body['name']
    new_doctor.email = body['email']
    # new_doctor.password=body['password']
    new_doctor.specialties = SpecialtyType[body['specialities']]
    new_doctor.biography = body['biography']
    new_doctor.latitud = body['latitud']
    new_doctor.longitud = body['longitud']
    new_doctor.picture = body['picture']
    new_doctor.phone = body['phone']
    db.session.add(new_doctor)
    db.session.commit()
    return jsonify({'msg': 'Doctor add successfully'}), 200


@app.route('/doctor', methods=['GET'])
def get_all_doctors():
    doctores = Doctors.query.all()
    new_serialise_doctors = []

    for doctor in doctores:
        new_serialise_doctors.append(doctor.serialize())
    return jsonify({'msg': new_serialise_doctors}), 200


@app.route('/doctor/<int:doctor_id>', methods=['GET'])
def get_single_doctor(doctor_id):
    doctor = Doctors.query.get(doctor_id)
    if doctor is None:
        return jsonify({'msg': 'Doctor not exist'}), 400
    return jsonify({'data': doctor.serialize()}), 200


@app.route('/doctor/<int:doctor_id>', methods=['PUT'])
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
        doctor.specialties = body['specialties']
    if 'biography' in body:
        doctor.biography = body['biography']
    if "latitud" in body:
        doctor.latitud = body['latitud']
    if 'longitud' in body:
        doctor.longitud = body['longitud']
    if 'picture' in body:
        doctor.picture = body['picture']
    if 'phone' in body:
        doctor.phone = body['phone']
    return jsonify({'msg': 'doctor update succesfully',
                    'data': doctor.serialize()}), 200


@app.route('/doctors', methods=['GET'])
def specialidad():
    speciality = request.args.get("specialty")

    query = Doctors.query

    if speciality:
        if speciality not in SpecialtyType.__members__:
            return jsonify({'msg': 'Invalid speciality'}), 400
        query = query.filter(Doctors.specialties == SpecialtyType[speciality])

        doctors = query.all()
        return jsonify([doct.serialize() for doct in doctors]), 200


# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
