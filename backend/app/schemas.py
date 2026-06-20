from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from .models import SourceType


class RunBase(BaseModel):
    date: datetime
    distance_km: float
    duration_seconds: int
    elevation_gain_m: Optional[float] = None
    notes: Optional[str] = None


class RunCreate(RunBase):
    pass


class RunOut(RunBase):
    id: int
    source: SourceType
    avg_heart_rate_bpm: Optional[float] = None
    max_heart_rate_bpm: Optional[float] = None
    avg_cadence_spm: Optional[float] = None

    class Config:
        from_attributes = True
