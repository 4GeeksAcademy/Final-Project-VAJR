"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from api.utils import APIException, generate_sitemap
from api.models import db, Doctors, SpecialtyType
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from flask_jwt_extended import create_access_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

# from models import Person

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
bcrypt = Bcrypt(app)

app.config['JWT_SECRET_KEY']=os.getenv('SUPER_SECRET_TOKEN')
jwt = JWTManager(app)

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

@app.route('/doctor/register', methods=['POST'])
def register_doctor():
    body=request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'Need to send something in body'}),400
    if 'name' not in body:
        return jsonify({'msg': 'Name is requiered'}),400
    if 'email' not in body:
        return jsonify({'msg': 'Email is required'}),400
    if 'specialties' not in body:
        return jsonify({'msg': 'This field is required'}),400
    if 'password' not in body:
        return jsonify({'msg': 'Password is required'}),400
    if 'phone' not in body:
        return jsonify({'msg': 'Phone is required'}),400
    
    user = Doctors.query.filter_by(email=body['email']).first()

    if user !=None:
        return jsonify({'msg': 'this email already have an account.'}),400
    
    new_doctor = Doctors()

    new_doctor.name = body['name']
    new_doctor.phone=body['phone']
    new_doctor.email=body['email']
    new_doctor.specialties=SpecialtyType[body['specialties']]
    pw_hash = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_doctor.password=pw_hash
    new_doctor.biography=''
    new_doctor.latitud = 0.0
    new_doctor.longitud = 0.0
    new_doctor.picture =''
    db.session.add(new_doctor)
    db.session.commit()
    return jsonify({'msg': 'User create succesfully.'}), 200

@app.route('/doctor/login', methods=['POST'])
def doctor_login():
    body = request.get_json(silent=True)
    if body is None:
        return jsonify({'msg': 'All field required.'}),400
    if 'email' not in body:
        return jsonify({'msg': 'email is required'}),400
    if 'password' not in body:
        return jsonify({'msg': 'password is required'}),400
    
    user = Doctors.query.filter_by(email=body['email']).first()

    if user is None:
        return jsonify({'msg': 'Email or password is incorrect'}),400
    is_hash_pw_correct = bcrypt.check_password_hash(user.password, body['password'])
    if is_hash_pw_correct == False:
        return jsonify({'msg': 'Email or password is incorrect'}), 400
    
    access_token = create_access_token(identity = user.email)
    return jsonify({'msg': 'login successfully',
                    'token': access_token})

@app.route('/doctor/private', methods=['GET'])
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
        doctor.specialties = SpecialtyType[body['specialties']]
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
    db.session.commit()
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
