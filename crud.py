from sqlalchemy.orm import Session
from models import Employee, Attendance, User
from schemas import UserCreate, EmployeeCreate, Attendance as AttendanceSchema
from passlib.context import CryptContext
import json
import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user: UserCreate):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db_user.username = user.username
        db_user.hashed_password = pwd_context.hash(user.password)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = get_user_by_id(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

def create_employee(db: Session, employee: EmployeeCreate, face_embedding: list):
    embedding_str = json.dumps(face_embedding)
    db_employee = Employee(name=employee.name, role=employee.role, face_embedding=embedding_str)
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

def get_employee_by_id(db: Session, employee_id: int):
    return db.query(Employee).filter(Employee.id == employee_id).first()

def get_all_employees(db: Session):
    return db.query(Employee).all()

def has_attended_today(db: Session, employee_id: int) -> bool:
    today = datetime.datetime.utcnow().date()
    return db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.date >= today,
        Attendance.date < today + datetime.timedelta(days=1)
    ).first() is not None

def create_attendance(db: Session, employee_ids: list[int]) -> list[dict]:
    today = datetime.datetime.utcnow().date()
    results = []
    seen_ids = set()  # Track processed IDs to avoid duplicates
    for employee_id in employee_ids:
        if employee_id in seen_ids:
            continue  # Skip duplicates in the same request
        if has_attended_today(db, employee_id):
            results.append({"employee_id": employee_id, "message": "You have already attended today"})
        else:
            db_attendance = Attendance(employee_id=employee_id, date=today)
            db.add(db_attendance)
            results.append({"employee_id": employee_id, "message": "Check-in successful"})
            seen_ids.add(employee_id)
    db.commit()
    for result in results:
        if result["message"] == "Check-in successful":
            db_attendance = db.query(Attendance).filter(
                Attendance.employee_id == result["employee_id"],
                Attendance.date == today
            ).first()
            db.refresh(db_attendance)
            result["attendance"] = db_attendance
    return results

def get_attendance_by_id(db: Session, attendance_id: int):
    return db.query(Attendance).filter(Attendance.id == attendance_id).first()

def update_attendance(db: Session, attendance_id: int, attendance: AttendanceSchema):
    db_attendance = get_attendance_by_id(db, attendance_id)
    if db_attendance:
        db_attendance.employee_id = attendance.employee_id
        db_attendance.check_in = attendance.check_in
        db_attendance.check_out = attendance.check_out
        db_attendance.date = attendance.date
        db.commit()
        db.refresh(db_attendance)
    return db_attendance

def delete_attendance(db: Session, attendance_id: int):
    db_attendance = get_attendance_by_id(db, attendance_id)
    if db_attendance:
        db.delete(db_attendance)
        db.commit()
        return True
    return False

def update_check_out(db: Session, attendance_id: int):
    db_attendance = get_attendance_by_id(db, attendance_id)
    if db_attendance and not db_attendance.check_out:
        db_attendance.check_out = datetime.datetime.utcnow()
        db.commit()
        db.refresh(db_attendance)
    return db_attendance

def get_daily_report(db: Session, date: datetime.date) -> list:
    records = db.query(Attendance).filter(
        Attendance.date >= date,
        Attendance.date < date + datetime.timedelta(days=1)
    ).all()
    return _generate_report(db, records)

def get_weekly_report(db: Session, start_date: datetime.datetime) -> list:
    end_date = start_date + datetime.timedelta(days=7)
    records = db.query(Attendance).filter(Attendance.check_in >= start_date, Attendance.check_in < end_date).all()
    return _generate_report(db, records)

def get_monthly_report(db: Session, year: int, month: int) -> list:
    start_date = datetime.datetime(year, month, 1)
    end_date = (start_date + datetime.timedelta(days=31)).replace(day=1)
    records = db.query(Attendance).filter(Attendance.check_in >= start_date, Attendance.check_in < end_date).all()
    return _generate_report(db, records)

def _generate_report(db: Session, records: list) -> list:
    report_dict = {}
    for record in records:
        employee = get_employee_by_id(db, record.employee_id)
        if employee.id not in report_dict:
            report_dict[employee.id] = {
                "employee_id": employee.id,
                "name": employee.name,
                "role": employee.role,
                "total_check_ins": 0,
                "total_hours": 0.0
            }
        report_dict[employee.id]["total_check_ins"] += 1
        if record.check_out:
            hours = (record.check_out - record.check_in).total_seconds() / 3600
            report_dict[employee.id]["total_hours"] += hours
    return list(report_dict.values())