import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../auth/auth';

function DailyReport() {
  const [report, setReport] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [reportDate, setReportDate] = useState(new Date());
  const { year, month, day } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (year && month && day) {
      setReportDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
    }
    fetchReport();
  }, [year, month, day, reportType]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = '';
      const y = reportDate.getFullYear();
      const m = reportDate.getMonth() + 1;
      const d = reportDate.getDate();
      if (reportType === 'daily') {
        url = `/reports/daily/${y}/${m}/${d}`;
      } else if (reportType === 'weekly') {
        const startOfWeek = new Date(reportDate);
        startOfWeek.setDate(d - reportDate.getDay());
        url = `/reports/weekly/${startOfWeek.getFullYear()}/${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
      } else {
        url = `/reports/monthly/${y}/${m}`;
      }
      const data = await apiRequest(url, 'GET', null, true);
      setReport(data);
      setMessage('');
    } catch (error) {
      setMessage(`Failed to load report: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    setReportDate(newDate);
    navigate(`/reports/daily/${newDate.getFullYear()}/${newDate.getMonth() + 1}/${newDate.getDate()}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Attendance Reports</h2>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setReportType('daily')}
            className={`py-2 px-4 rounded ${reportType === 'daily' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setReportType('weekly')}
            className={`py-2 px-4 rounded ${reportType === 'weekly' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`py-2 px-4 rounded ${reportType === 'monthly' ? 'bg-teal-500 text-white' : 'bg-gray-200'}`}
          >
            Monthly
          </button>
        </div>
        <input
          type="date"
          value={reportDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : report.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-3 text-left text-gray-700">Employee ID</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Name</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Role</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Check-Ins</th>
                <th className="border border-gray-300 p-3 text-left text-gray-700">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {report.map((entry) => (
                <tr key={entry.employee_id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{entry.employee_id}</td>
                  <td className="border border-gray-300 p-3">{entry.name}</td>
                  <td className="border border-gray-300 p-3">{entry.role}</td>
                  <td className="border border-gray-300 p-3">{entry.total_check_ins}</td>
                  <td className="border border-gray-300 p-3">{entry.total_hours.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No attendance data for this period.</p>
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

export default DailyReport;