import enum
from datetime import datetime, time
from typing import List, Optional
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Float, Integer, Enum, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


db = SQLAlchemy()


class SpecialtyType(enum.Enum):
    CARDIOLOGY = "Cardiology"
    DERMATOLOGY = "Dermatology"
    PEDIATRICS = "Pediatrics"
    GENERAL_PRACTICE = "General Practice"
    NEUROLOGY = "Neurology"


class StatusAppointment(enum.Enum):
    confirmed = "confirmed"
    cancelled = "cancelled"
    pending = "Pending"


class Pacient(db.Model):
    __tablename__ = "pacient"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), unique=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    appointments: Mapped[List["Appointments"]
                         ] = relationship(back_populates="pacient")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone
        }


class Doctors(db.Model):
    __tablename__ = 'doctors'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(120), nullable=False)
    specialties: Mapped[SpecialtyType] = mapped_column(
        Enum(SpecialtyType), nullable=False)
    biography: Mapped[str] = mapped_column(String(250))
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitud: Mapped[float] = mapped_column(Float)
    longitud: Mapped[float] = mapped_column(Float)
    picture: Mapped[Optional[str]] = mapped_column(String(500))
    phone: Mapped[str] = mapped_column(String(50), unique=True)
    appointments: Mapped[List["Appointments"]
                         ] = relationship(back_populates="doctor")
    availability: Mapped[List["Availability"]
                         ] = relationship(back_populates="doctor")
    cal_link = db.Column(db.String(200), nullable=True)
    appointments: Mapped[List["Appointments"]] = relationship(back_populates="doctor")
    availability: Mapped[List["Availability"]] = relationship(back_populates="doctor")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "specialties": self.specialties.value,
            "biography": self.biography,
            "picture": self.picture,
            "address": self.address,
            "location": {
                "lat": self.latitud,
                "lng": self.longitud
            },
            "phone": self.phone,

            "cal_link": self.cal_link,
            
        }


class Appointments(db.Model):
    __tablename__ = 'appointments'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pacient_id: Mapped[int] = mapped_column(
        ForeignKey('pacient.id'), nullable=False)
    doctor_id: Mapped[int] = mapped_column(
        ForeignKey('doctors.id'), nullable=False)
    dateTime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    reason: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[StatusAppointment] = mapped_column(
        Enum(StatusAppointment), nullable=False)
    pacient: Mapped["Pacient"] = relationship(back_populates="appointments")
    doctor: Mapped["Doctors"] = relationship(back_populates="appointments")

    def serialize(self):
        return {
            "id": self.id,
            "pacient_id": self.pacient_id,
            "doctor_id": self.doctor_id,
            "dateTime": self.dateTime.strftime("%Y-%m-%d %H:%M"),
            "reason": self.reason,
            "status": self.status.value,
            "pacient_name": self.pacient.name,
            "appointment_date": self.dateTime.strftime("%Y-%m-%d"),
            "appointment_hour": self.dateTime.strftime("%H:%M")
        }


class Availability(db.Model):
    __tablename__ = 'availability'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    days: Mapped[str] = mapped_column(String(100), nullable=False)
    start_time: Mapped[time] = mapped_column(
        db.Time(timezone=False), nullable=False)
    end_time: Mapped[time] = mapped_column(
        db.Time(timezone=False), nullable=False)
    id_doctor: Mapped[int] = mapped_column(
        ForeignKey("doctors.id"), nullable=False)
    doctor: Mapped["Doctors"] = relationship(back_populates="availability")

    def serialize(self):
        return {
            "id": self.id,
            "days": self.days,
            "start_time": self.start_time.strftime("%H:%M"),
            "end_time": self.end_time.strftime("%H:%M")
        }
