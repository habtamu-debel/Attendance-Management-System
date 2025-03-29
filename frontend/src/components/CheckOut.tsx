import { useState, useEffect } from 'react';
import { apiRequest } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

function CheckOut() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/attendance/', 'GET', null, true);
      setAttendance(data.filter((record) => !record.check_out));
      setMessage('');
    } catch (error) {
      setMessage(`Failed to load attendance: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await apiRequest(`/check-out/${id}`, 'PUT', null, true);
      fetchAttendance();
      setMessage('Check-out successful!');
    } catch (error) {
      setMessage(`Failed to check out: ${error}`);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Check Out</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : attendance.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left text-gray-700">ID</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Employee ID</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Check-In</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{record.id}</td>
                  <td className="border border-gray-300 p-3">{record.employee_id}</td>
                  <td className="border border-gray-300 p-3">{new Date(record.check_in).toLocaleTimeString()}</td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => handleCheckOut(record.id)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600 transition"
                    >
                      Check Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No pending check-outs.</p>
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

export default CheckOut;