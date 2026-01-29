"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, Pacient, Doctors, Appointments, Availability
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt

from api.models import db, Pacient

api = Blueprint('api', __name__)
app = Flask(__name__)
# Allow CORS requests to this API
CORS(api)
bcrypt = Bcrypt(app)


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
