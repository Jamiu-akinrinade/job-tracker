from datetime import datetime, timezone
from itertools import count
from typing import Literal

from fastapi import APIRouter, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from starlette.exceptions import HTTPException as StarletteHTTPException

app = FastAPI()

Status = Literal[
    "wishlist", "applied", "interviewing", "offer", "rejected", "accepted"
]

FAKE_USER_ID = 1


class JobCreate(BaseModel):
    title: str = Field(min_length=1)
    company: str = Field(min_length=1)
    status: Status = "applied"
    location: str = ""
    salary: str = ""
    url: str = ""
    notes: str = ""


class JobUpdate(BaseModel):
    title: str | None = None
    company: str | None = None
    status: Status | None = None
    location: str | None = None
    salary: str | None = None
    url: str | None = None
    notes: str | None = None


class JobRead(BaseModel):
    id: int
    user_id: int
    title: str
    company: str
    status: Status
    location: str
    salary: str
    url: str
    notes: str
    created_at: datetime
    updated_at: datetime


class JobResponse(BaseModel):
    job: JobRead


class JobsResponse(BaseModel):
    jobs: list[JobRead]


jobs: list[dict] = []
id_counter = count(1)


@app.exception_handler(StarletteHTTPException)
def http_error_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})


@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, exc: RequestValidationError):
    first = exc.errors()[0]
    where = [str(p) for p in first["loc"] if p not in ("body", "query", "path")]
    message = f"{'.'.join(where)}: {first['msg']}"
    return JSONResponse(status_code=400, content={"error": message})


def find_job(job_id: int) -> dict:
    for job in jobs:
        if job["id"] == job_id and job["user_id"] == FAKE_USER_ID:
            return job
    raise HTTPException(status_code=404, detail="Job not found")


router = APIRouter(prefix="/api/jobs")


@router.get("", response_model=JobsResponse)
def list_jobs():
    mine = [j for j in jobs if j["user_id"] == FAKE_USER_ID]
    mine.sort(key=lambda j: j["created_at"], reverse=True)
    return {"jobs": mine}


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    return {"job": find_job(job_id)}


@router.post("", status_code=201, response_model=JobResponse)
def create_job(data: JobCreate):
    now = datetime.now(timezone.utc)
    job = {
        "id": next(id_counter),
        "user_id": FAKE_USER_ID,
        **data.model_dump(),
        "created_at": now,
        "updated_at": now,
    }
    jobs.append(job)
    return {"job": job}


@router.patch("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, data: JobUpdate):
    changes = data.model_dump(exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="no fields to update")
    job = find_job(job_id)
    job.update(changes)
    job["updated_at"] = datetime.now(timezone.utc)
    return {"job": job}


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: int):
    job = find_job(job_id)
    jobs.remove(job)
    return Response(status_code=204)


app.include_router(router)