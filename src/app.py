
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
ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(
    os.path.realpath(__file__)), '../dist/')

app = Flask(__name__)
app.url_map.strict_slashes = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
CORS(app)
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
