import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../auth/auth';

interface SidebarProps {
  setLoggedIn: (loggedIn: boolean) => void;
}

function Sidebar({ setLoggedIn }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    navigate('/login');
  };

  const today = new Date();
  return (
    <aside className="w-64 bg-gray-800 text-white p-6 flex-shrink-0">
      <h3 className="text-xl font-bold mb-6">Attendance System</h3>
      <nav className="space-y-4">
        <NavLink to="/" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Dashboard</NavLink>
        <NavLink to="/enroll" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Enroll</NavLink>
        <NavLink to="/employees" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Employees</NavLink>
        <NavLink to="/attendance" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Attendance</NavLink>
        <NavLink to="/check-in" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Check In</NavLink>
        <NavLink to="/check-out" className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Check Out</NavLink>
        <NavLink to={`/reports/daily/${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`} className={({ isActive }) => `block py-2 px-4 rounded ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700'}`}>Reports</NavLink>
        <button
          onClick={handleLogout}
          className="w-full text-left py-2 px-4 rounded bg-red-600 hover:bg-red-700 transition"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;