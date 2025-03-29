import { useState } from 'react';
import { apiRequest } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

function Enroll() {
  const [newEmployee, setNewEmployee] = useState({ name: '', role: 'student', file: null });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newEmployee.name);
    formData.append('role', newEmployee.role);
    if (newEmployee.file) {
      formData.append('file', newEmployee.file);
    }
    try {
      await apiRequest('/enroll/', 'POST', formData, true);
      setNewEmployee({ name: '', role: 'student', file: null });
      setMessage('Employee enrolled successfully!');
      setTimeout(() => navigate('/employees'), 2000);
    } catch (error) {
      setMessage(`Failed to enroll: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Enroll New Employee</h2>
      <form onSubmit={handleCreate} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={newEmployee.name}
          onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          value={newEmployee.role}
          onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="student">Student</option>
          <option value="staff">Staff</option>
        </select>
        <input
          type="file"
          onChange={(e) => setNewEmployee({ ...newEmployee, file: e.target.files?.[0] || null })}
          className="w-full border border-gray-300 rounded p-2"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Enroll
        </button>
      </form>
      <button
        onClick={() => navigate('/')}
        className="mt-4 w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
      >
        Back to Home
      </button>
      <p className={message.includes('Failed') ? 'text-red-500 mt-4' : 'text-green-500 mt-4'}>{message}</p>
    </div>
  );
}

export default Enroll;