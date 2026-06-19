from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
import gpxpy

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/runs", tags=["runs"])

@router.get("/", response_model=list[schemas.RunOut])
def list_runs(db: Session = Depends(get_db)):
    return db.query(models.Run).order_by(models.Run.date.desc()).all()

@router.post("/", response_model=schemas.RunOut)
def create_run(run: schemas.RunCreate, db: Session = Depends(get_db)):
    db_run = models.Run(**run.model_dump(), source=models.SourceType.manual)
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run

@router.post("/import-gpx", response_model=schemas.RunOut)
async def import_gpx(file: UploadFile, db: Session = Depends(get_db)):
    try:
        contents = await file.read()
        gpx = gpxpy.parse(contents.decode("utf-8"))
        track = gpx.tracks[0]
        segment = track.segments[0]

        distance_km = track.length_2d() / 1000
        duration_seconds = int(track.get_duration())
        uphill_downhill = track.get_uphill_downhill()
        elevation_gain_m = uphill_downhill.uphill
        start_time = segment.points[0].time

        if start_time is None:
            raise ValueError("GPX file has no timestamps")

    except (IndexError, AttributeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Could not parse GPX file: {e}")

    db_run = models.Run(
        date=start_time,
        distance_km=round(distance_km, 2),
        duration_seconds=duration_seconds,
        elevation_gain_m=round(elevation_gain_m, 1) if elevation_gain_m else None,
        source=models.SourceType.gpx,
    )
    db.add(db_run)
    db.commit()
    db.refresh(db_run)
    return db_run