import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import Enroll from './components/Enroll.tsx';
import EmployeeList from './components/EmployeeList.tsx';
import AttendanceList from './components/AttendanceList.tsx';
import CheckIn from './components/CheckIn.tsx';
import CheckOut from './components/CheckOut.tsx';
import DailyReport from './components/DailyReport.tsx';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import { getToken } from './auth/auth';
import React from 'react';

function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {loggedIn && <Sidebar setLoggedIn={setLoggedIn} />}
      <main className="flex-1 p-6 overflow-y-auto">
        <Routes>
          {loggedIn ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/enroll" element={<Enroll />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/attendance" element={<AttendanceList />} />
              <Route path="/check-in" element={<CheckIn />} />
              <Route path="/check-out" element={<CheckOut />} />
              <Route path="/reports/daily/:year/:month/:day" element={<DailyReport />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <>
              <Route path="/login" element={<Login setLoggedIn={setLoggedIn} />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;