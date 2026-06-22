from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from .database import Base


class SourceType(str, enum.Enum):
    manual = "manual"
    gpx = "gpx"


class Run(Base):
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    elevation_gain_m = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    source = Column(Enum(SourceType), default=SourceType.manual)
    avg_heart_rate_bpm = Column(Float, nullable=True)
    max_heart_rate_bpm = Column(Float, nullable=True)
    avg_cadence_spm = Column(Float, nullable=True)

    points = relationship(
        "RunPoint", back_populates="run", cascade="all, delete-orphan"
    )
    fit_points = relationship(
        "FitPoint", back_populates="run", cascade="all, delete-orphan"
    )


class RunPoint(Base):
    __tablename__ = "run_points"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id"), nullable=False)
    sequence = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=True)
    time = Column(DateTime, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    cadence = Column(Integer, nullable=True)
    course = Column(Float, nullable=True)  # heading in degrees, 0-360
    horizontal_accuracy = Column(Float, nullable=True)  # meters
    vertical_accuracy = Column(Float, nullable=True)  # meters

    run = relationship("Run", back_populates="points")


class FitPoint(Base):
    __tablename__ = "fit_points"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id"), nullable=False)
    sequence = Column(Integer, nullable=False)
    time = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    altitude = Column(Float, nullable=True)
    heart_rate = Column(Integer, nullable=True)
    cadence = Column(Integer, nullable=True)
    distance_m = Column(Float, nullable=True)
    speed_mps = Column(Float, nullable=True)
    power_w = Column(Integer, nullable=True)
    temperature_c = Column(Float, nullable=True)

    run = relationship("Run", back_populates="fit_points")
