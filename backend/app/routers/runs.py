from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session
import gpxpy

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/runs", tags=["runs"])


def _ext_value(extensions, tag: str):
    """Return the text of the first child element matching a local tag name across all extensions."""
    for ext in extensions:
        for child in ext:
            local = child.tag.split("}")[-1] if "}" in child.tag else child.tag
            if local == tag and child.text:
                return child.text
    return None


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
    if not file.filename or not file.filename.lower().endswith(".gpx"):
        raise HTTPException(status_code=400, detail="File must be a .gpx file")
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

        hr_values = []
        cad_values = []
        for point in segment.points:
            if point.extensions:
                hr = _ext_value(point.extensions, "hr")
                if hr is not None:
                    hr_values.append(float(hr))
                cad = _ext_value(point.extensions, "cad")
                if cad is not None:
                    cad_values.append(float(cad))

        avg_heart_rate_bpm = (
            round(sum(hr_values) / len(hr_values), 1) if hr_values else None
        )
        max_heart_rate_bpm = max(hr_values) if hr_values else None
        avg_cadence_spm = (
            round(sum(cad_values) / len(cad_values), 1) if cad_values else None
        )

    except (IndexError, AttributeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Could not parse GPX file: {e}")

    db_run = models.Run(
        date=start_time,
        distance_km=round(distance_km, 2),
        duration_seconds=duration_seconds,
        elevation_gain_m=round(elevation_gain_m, 1) if elevation_gain_m else None,
        source=models.SourceType.gpx,
        avg_heart_rate_bpm=avg_heart_rate_bpm,
        max_heart_rate_bpm=max_heart_rate_bpm,
        avg_cadence_spm=avg_cadence_spm,
    )

    db.add(db_run)
    db.commit()
    db.refresh(db_run)

    for i, point in enumerate(segment.points):
        hr = None
        cadence = None
        course = None
        h_acc = None
        v_acc = None

        if point.extensions:
            for ext in point.extensions:
                tag = ext.tag.split("}")[-1].lower()
                if tag == "hr":
                    hr = int(ext.text)
                elif tag in ("cad", "cadence"):
                    cadence = int(ext.text)
                elif tag == "course":
                    course = float(ext.text)
                elif tag == "hacc":
                    h_acc = float(ext.text)
                elif tag == "vacc":
                    v_acc = float(ext.text)

        db.add(
            models.RunPoint(
                run_id=db_run.id,
                sequence=i,
                latitude=point.latitude,
                longitude=point.longitude,
                elevation=point.elevation,
                time=point.time,
                heart_rate=hr,
                cadence=cadence,
                course=course,
                horizontal_accuracy=h_acc,
                vertical_accuracy=v_acc,
            )
        )
    return db_run
