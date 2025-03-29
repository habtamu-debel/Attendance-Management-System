import { useState, useEffect } from 'react';
import { apiRequest } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

function EmployeeList() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', role: '' });
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/employees/', 'GET', null, true);
      setEmployees(data);
      setMessage('');
    } catch (error) {
      setMessage(`Failed to load employees: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: any) => {
    setEditingId(employee.id);
    setEditData({ name: employee.name, role: employee.role });
  };

  const handleSave = async (id: number) => {
    const formData = new FormData();
    formData.append('name', editData.name);
    formData.append('role', editData.role);
    try {
      await apiRequest(`/employees/${id}`, 'PUT', formData, true);
      fetchEmployees();
      setEditingId(null);
      setMessage('Employee updated successfully!');
    } catch (error) {
      setMessage(`Failed to update: ${error}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiRequest(`/employees/${id}`, 'DELETE', null, true);
        fetchEmployees();
        setMessage('Employee deleted successfully!');
      } catch (error) {
        setMessage(`Failed to delete: ${error}`);
      }
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee List</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : employees.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left text-gray-700">ID</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Name</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Role</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{employee.id}</td>
                  <td className="border border-gray-300 p-3">
                    {editingId === employee.id ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      employee.name
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    {editingId === employee.id ? (
                      <select
                        value={editData.role}
                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                        className="border border-gray-300 rounded p-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      employee.role
                    )}
                  </td>
                  <td className="border border-gray-300 p-3 flex gap-2">
                    {editingId === employee.id ? (
                      <button
                        onClick={() => handleSave(employee.id)}
                        className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 transition"
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No employees yet.</p>
      )}
      <button
        onClick={() => navigate('/')}
        className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
      >
        Back to Home
      </button>
      <p className={message.includes('Failed') ? 'text-red-500 mt-4' : 'text-green-500 mt-4'}>{message}</p>
    </div>
  );
}

export default EmployeeList;