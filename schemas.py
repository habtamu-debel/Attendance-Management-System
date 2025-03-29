from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class EmployeeCreate(BaseModel):
    name: str
    role: str

class Employee(BaseModel):
    id: int
    name: str
    role: str
    face_embedding: str | None = None
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    employee_id: int

class Attendance(AttendanceBase):
    id: int
    check_in: datetime
    check_out: datetime | None = None
    date: datetime
    class Config:
        from_attributes = True

class AttendanceReport(BaseModel):
    employee_id: int
    name: str
    role: str
    total_check_ins: int
    total_hours: float

class CheckInResult(BaseModel):
    employee_id: int | None
    message: str