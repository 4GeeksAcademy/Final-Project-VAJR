from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Float,Integer,Enum,dateTime
from sqlalchemy.orm import Mapped, mapped_column,List,relationship
import enum 

db = SQLAlchemy()


class Pacient(db.Model):
    __tablename__ = "pacient"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    phone: Mapped[float] = mapped_column(Float, unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)
    appointments: Mapped[List["Appointments"]] = relationship(back_populates = "pacient_id")

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }

    class SpecialtyType(enum.Enum):
        CARDIOLOGY = "Cardiology"
        DERMATOLOGY = "Dermatology"
        PEDIATRICS = "Pediatrics"
        GENERAL_PRACTICE = "General Practice"
        NEUROLOGY = "Neurology"

    class Doctors(db.Model):
        __tablename__ = 'doctors'
        id: Mapped[int] = mapped_column(Integer, primary_key=True)
        name: Mapped[str] = mapped_column(String(100))
        email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
        password: Mapped[str] = mapped_column(nullable=False)
        specialties: Mapped[SpecialtyType] = mapped_column(Enum(SpecialtyType), nullable=False)
        biography: Mapped[str] = mapped_column(String,(250))
        latitud: Mapped[float] = mapped_column(Float)
        longitud: Mapped[float] = mapped_column(Float)
        picture: Mapped[str] = mapped_column(String(500))
        appointments: Mapped[List["Appointments"]] = relationship(back_populates = "doctors_id")
        availability: Mapped[List["Availability"]] = relationship(back_populates = "doctors_id")

    class statusAppointment(enum.Enum):
        confirmada = "confirm"
        cancelada = "cancelled"
        revisado  = "checked"

    class Appointments(db.Model) :
        __tablename__ = 'appointments'
        id:Mapped[int]=mapped_column(Integer, primary_key=True)
        pacient_id:Mapped[int]=mapped_column(Integer, db.ForeignKey('pacient.id'), nullable=False)
        doctors_id:Mapped[int]=mapped_column(Integer, db.ForeignKey('doctors.id'), nullable=False)
        dateTime:Mapped[dateTime]=mapped_column(db.DateTime, nullable=False)
        appointment_hour:Mapped[str]=mapped_column(String(10), nullable=False)
        reason:Mapped[str]=mapped_column(String(120), nullable=False)
        status: Mapped[statusAppointment] = mapped_column(Enum(statusAppointment), nullable=False)
        pacient: Mapped[List["Pacient"]] = relationship(back_populates = "appointments")
        doctors: Mapped[List["Doctors"]] = relationship(back_populates = "appointments")

    class Availability(db.Model): 
        __tablename__ = 'availability'
        id: Mapped[int] = mapped_column(Integer,primary_key=True)
        days: Mapped[str] = mapped_column(String)
        start_time:Mapped[float] = mapped_column(Float)
        end_time: Mapped[float] = mapped_column(Float)
        id_doctor: Mapped[int] = mapped_column(ForeingKey("doctor.id"))
        doctors: Mapped[List["Doctors"]] = relationship(back_populates = "availability")



    
