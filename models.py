from datetime import datetime
from sqlalchemy import Boolean, Column, Integer, DateTime, ForeignKey, String, Index
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    __table_args__ = (Index('idx_username', 'username'),)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    role = Column(String, nullable=False)
    face_embedding = Column(String, nullable=True)
    __table_args__ = (Index('idx_name_role', 'name', 'role'),)

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), index=True)
    check_in = Column(DateTime, default=datetime.utcnow)
    check_out = Column(DateTime, nullable=True)
    date = Column(DateTime, default=datetime.utcnow)  # Separate date for easier querying
    __table_args__ = (Index('idx_employee_id_date', 'employee_id', 'date'),)