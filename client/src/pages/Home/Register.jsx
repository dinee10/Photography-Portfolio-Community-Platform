import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
  const [user, setUser] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:8080/user', user);
      setMessage('Registration successful!');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data || 'Failed to register. Please try again.';
      setMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        
        {/* Left Panel */}
        <div className="w-1/2 p-8 text-black relative bg-gradient-to-br from-orange-200 to-yellow-100">
          <div className="absolute inset-0">
            <div className="absolute w-64 h-64 bg-orange-400 opacity-30 rounded-full -top-32 -left-32 transform rotate-45"></div>
            <div className="absolute w-64 h-64 bg-orange-400 opacity-30 rounded-full -bottom-32 -right-32 transform rotate-45"></div>
          </div>
          <h1 className="text-4xl font-bold mb-4 relative z-10">Join Our Community</h1>
          <p className="text-lg relative z-10">
            Create an account to access exclusive content and connect with others. Let's get started!
          </p>
        </div>

        {/* Right Panel - Form */}
        <div className="w-1/2 p-8 bg-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">USER REGISTRATION</h2>

          {message && (
            <div
              className={`p-3 rounded mb-4 text-sm text-center ${
                isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={onSubmit}>
            {/* Fullname */}
            <div className="mb-4 relative">
              <label htmlFor="fullname" className="block text-gray-600 mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <User size={20} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Your full name"
                  value={user.fullname}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4 relative">
              <label htmlFor="email" className="block text-gray-600 mb-2">Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail size={20} className="text-gray-400" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="example@email.com"
                  value={user.email}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-gray-600 mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock size={20} className="text-gray-400" />
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Enter a strong password"
                  value={user.password}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mb-6 relative">
              <label htmlFor="phone" className="block text-gray-600 mb-2">Phone</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone size={20} className="text-gray-400" />
                </span>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="07XXXXXXXX"
                  value={user.phone}
                  onChange={onInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-200"
            >
              Register
            </button>
          </form>

          <p className="text-sm mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-orange-500 hover:underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
