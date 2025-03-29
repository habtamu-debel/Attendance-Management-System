import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { apiRequest } from '../auth/auth';
import { useNavigate } from 'react-router-dom';

function CheckIn() {
  const [checkInLog, setCheckInLog] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const processedIds = useRef(new Set<string>());
  const navigate = useNavigate();

  const captureAndCheckIn = async () => {
    if (!webcamRef.current) {
      setCheckInLog((prev) => [...prev, 'Webcam not initialized.']);
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setCheckInLog((prev) => [...prev, 'Failed to capture image.']);
      return;
    }
    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');
    try {
      const responses = await apiRequest('/check-in/', 'POST', formData, true);
      const today = new Date().toDateString();
      const newLogs = responses
        .filter((res: any) => {
          if (res.employee_id && res.message === 'Check-in successful') {
            const key = `${res.employee_id}-${today}`;
            if (processedIds.current.has(key)) return false;
            processedIds.current.add(key);
            return true;
          }
          return true;
        })
        .map((res: any) =>
          res.employee_id
            ? `Familiar face detected: Check-in successful for Employee ID ${res.employee_id} at ${new Date().toLocaleTimeString()}`
            : `Unknown face detected: ${res.message}`
        );
      setCheckInLog((prev) => [...prev, ...newLogs]);
    } catch (error) {
      setCheckInLog((prev) => [...prev, `Check-in failed: ${error}`]);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isChecking) {
      interval = setInterval(captureAndCheckIn, 3000);
    }
    return () => clearInterval(interval);
  }, [isChecking]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Live Multi-Face Check-In</h2>
      <div className="flex flex-col items-center gap-6">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-lg shadow-md"
          width={640}
          height={480}
        />
        <button
          onClick={() => setIsChecking(!isChecking)}
          className={`py-2 px-6 rounded text-white font-semibold transition ${
            isChecking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isChecking ? 'Stop Live Check-In' : 'Start Live Check-In'}
        </button>
        <div className="w-full max-h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Check-In Log</h3>
          {checkInLog.length > 0 ? (
            checkInLog.map((log, index) => (
              <p key={index} className="text-sm text-gray-700">{log}</p>
            ))
          ) : (
            <p className="text-sm text-gray-500">No check-ins yet.</p>
          )}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default CheckIn;