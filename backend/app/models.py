from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
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