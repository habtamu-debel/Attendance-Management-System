import { useState, useEffect } from 'react';
import { apiRequest } from '../auth/auth';
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer"
import logoImage from "../assets/logo.png"
function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, todayAttendance: 0 });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [employees, attendance] = await Promise.all([
          apiRequest('/employees/', 'GET', null, true),
          apiRequest('/attendance/', 'GET', null, true),
        ]);
        const today = new Date();
        setStats({
          employees: employees.length,
          todayAttendance: attendance.filter((a) =>
            new Date(a.check_in).toDateString() === today.toDateString()
          ).length,
        });
        setMessage('');
      } catch (error) {
        setMessage(`Failed to load stats: ${error}`);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <header className="w-full mb-5">
        <img src={logoImage} alt="logo" className="float-right w-20 h-20 object-contain"/>
      </header>
      <div className="flex-grow overflow-hidden px-4 py-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Attendance System Dashboard</h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">System Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <p className="text-xl">
                  Total Employees: <span className="font-bold text-blue-500">{stats.employees}</span>
                </p>
                <p className="text-xl">
                  Today’s Attendance: <span className="font-bold text-green-500">{stats.todayAttendance}</span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button onClick={() => navigate('/enroll')} className="bg-blue-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-600 transition">Enroll Employee</button>
              <button onClick={() => navigate('/check-in')} className="bg-green-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition">Live Check-In</button>
              <button onClick={() => navigate('/employees')} className="bg-indigo-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-indigo-600 transition">Employee List</button>
              <button onClick={() => navigate('/attendance')} className="bg-purple-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-purple-600 transition">Attendance List</button>
              <button onClick={() => navigate('/check-out')} className="bg-orange-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-orange-600 transition">Check-Out</button>
              <button onClick={() => navigate(`/reports/daily/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`)} className="bg-teal-500 text-white py-3 px-4 rounded-lg shadow-md hover:bg-teal-600 transition">View Reports</button>
            </div>

          </div>
        )}
        <p className={message.includes('Failed') ? 'text-red-500 mt-4' : 'text-green-500 mt-4'}>{message}</p>
        </div>
        <Footer />
      </div>
  );
}

export default Dashboard;