import json
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import crud
from database import Base, engine, get_db
from schemas import EmployeeCreate, Employee, Attendance as AttendanceSchema, UserCreate, User, Token, AttendanceReport, CheckInResult
from models import Attendance as AttendanceModel, Employee as EmployeeModel, User as UserModel
from crud import (
    create_employee, get_all_employees, create_attendance, update_check_out, create_user, get_user_by_id, update_user, delete_user,
    get_daily_report, get_weekly_report, get_monthly_report, get_attendance_by_id, update_attendance, delete_attendance
)
from face_recognition_service import get_face_embeddings, batch_verify_faces
from auth import create_access_token, authenticate_user, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES, OAuth2PasswordRequestForm
import shutil
import os
from datetime import datetime, timedelta

app = FastAPI(title="Face Recognition Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

Base.metadata.create_all(bind=engine)

# User CRUD
@app.post("/register/", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=User)
async def update_user_endpoint(user_id: int, user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated_user = update_user(db, user_id, user)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}

@app.post("/login/", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# Employee CRUD
@app.post("/enroll/", response_model=Employee)
async def enroll_employee(
    name: str = Form(...),
    role: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    embedding = get_face_embeddings(file_path)[0]
    return create_employee(db, EmployeeCreate(name=name, role=role), embedding)

@app.get("/employees/", response_model=list[Employee])
async def list_employees(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_all_employees(db)

# Attendance CRUD
@app.post("/check-in/", response_model=list[CheckInResult])
async def check_in(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    file_path = f"{UPLOAD_DIR}/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    employees = get_all_employees(db)
    embeddings = [emp.face_embedding for emp in employees if emp.face_embedding]
    match_results = batch_verify_faces(file_path, embeddings)
    
    matched_employee_ids = [employees[idx].id for idx, match in match_results if match and idx != -1]
    
    if not matched_employee_ids:
        return [{"employee_id": None, "message": "No employees recognized in the image"}]
    
    results = create_attendance(db, matched_employee_ids)
    return [{"employee_id": res["employee_id"], "message": res["message"]} for res in results]

@app.get("/attendance/", response_model=list[AttendanceSchema])
async def list_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(AttendanceModel).all()

@app.get("/attendance/{attendance_id}", response_model=AttendanceSchema)
async def get_attendance(attendance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attendance = get_attendance_by_id(db, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return attendance

@app.put("/attendance/{attendance_id}", response_model=AttendanceSchema)
async def update_attendance_endpoint(attendance_id: int, attendance: AttendanceSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated_attendance = update_attendance(db, attendance_id, attendance)
    if not updated_attendance:
        raise HTTPException(status_code=404, detail="Attendance not found")
    return updated_attendance

@app.delete("/attendance/{attendance_id}")
async def delete_attendance_endpoint(attendance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not delete_attendance(db, attendance_id):
        raise HTTPException(status_code=404, detail="Attendance not found")
    return {"message": "Attendance deleted"}

@app.put("/check-out/{attendance_id}", response_model=AttendanceSchema)
async def check_out(attendance_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    attendance = update_check_out(db, attendance_id)
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return attendance

# Reports
@app.get("/reports/daily/{year}/{month}/{day}", response_model=list[AttendanceReport])
async def daily_report(year: int, month: int, day: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    date = datetime(year, month, day).date()
    return get_daily_report(db, date)

@app.get("/reports/weekly/{year}/{week}", response_model=list[AttendanceReport])
async def weekly_report(year: int, week: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    start_date = datetime.fromisocalendar(year, week, 1)
    return get_weekly_report(db, start_date)

@app.get("/reports/monthly/{year}/{month}", response_model=list[AttendanceReport])
async def monthly_report(year: int, month: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_monthly_report(db, year, month)
# Add these endpoints below /enroll/ and /employees/
@app.put("/employees/{employee_id}", response_model=Employee)
async def update_employee(
    employee_id: int,
    name: str = Form(...),
    role: str = Form(...),
    file: UploadFile = File(None),  # Optional file for updating face embedding
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_employee = crud.get_employee_by_id(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db_employee.name = name
    db_employee.role = role
    if file:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        embedding = get_face_embeddings(file_path)[0]
        db_employee.face_embedding = json.dumps(embedding)
    
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/employees/{employee_id}")
async def delete_employee(employee_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_employee = crud.get_employee_by_id(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}