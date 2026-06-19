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

    class Config:
        from_attributes = True
