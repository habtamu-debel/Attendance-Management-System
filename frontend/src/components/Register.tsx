import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../auth/auth';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/register/', 'POST', { username, password });
      setMessage('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(`Registration failed: ${error}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Register</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Already have an account?</p>
        <button
          onClick={() => navigate('/login')}
          className="text-blue-500 hover:underline"
        >
          Go to Login
        </button>
      </div>
      <p className={message.includes('failed') ? 'text-red-500 mt-4' : 'text-green-500 mt-4'}>{message}</p>
    </div>
  );
}

export default Register;