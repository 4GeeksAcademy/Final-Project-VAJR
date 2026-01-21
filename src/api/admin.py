import os
import inspect
from flask_admin import Admin
from . import models
from .models import db, Pacient, Doctors, Appointments, Availability
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme


def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    admin = Admin(app, name='HIDOC', theme=Bootstrap4Theme(swatch='cerulean'))
    admin.add_view(ModelView(Pacient, db.session))
    admin.add_view(ModelView(Doctors, db.session))
    admin.add_view(ModelView(Appointments, db.session))
    admin.add_view(ModelView(Availability, db.session))
    