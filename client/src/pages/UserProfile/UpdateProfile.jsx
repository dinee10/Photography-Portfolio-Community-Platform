import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const UpdateProfile = () => {
  const [user, setUser] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user/${id}`);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
        setMessage('Failed to load user data.');
        setIsSuccess(false);
      }
    };
    fetchUser();
  }, [id]);

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.put(`http://localhost:8080/user/${id}`, user);
      console.log(response.data);
      setMessage('User updated successfully!');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage =
        error.response?.data || 'Failed to update. Please try again.';
      setMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Update Profile</h2>
        {message && (
          <div
            className={`p-3 mb-4 rounded text-sm font-medium ${
              isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={user.fullname}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={user.email}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password (leave blank to keep unchanged)"
              value={user.password}
              onChange={onInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={user.phone}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Update
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Back to dashboard?{' '}
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Click here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
