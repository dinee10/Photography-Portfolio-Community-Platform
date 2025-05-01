import axios from 'axios';
import React, { useEffect, useState } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      setError('User not found');
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching data');
        setLoading(false);
      });
  }, []);

  const UpdateNavigate = (id) => {
    window.location.href = `/updateprofile/${id}`;
  };

  const deleteAccount = async () => {
    const confirmation = window.confirm('Are you sure you want to delete this account?');
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:8080/user/${user.id}`);
        alert('Account deleted successfully');
        localStorage.removeItem('userId');
        window.location.href = '/';
      } catch (error) {
        alert('Error deleting account');
      }
    }
  };

  if (loading) return <p className="pl-4 pt-4 text-gray-600">Loading...</p>;
  if (error) return <p className="pl-4 pt-4 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen flex items-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-sm w-full mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">User Profile</h2>

        {user ? (
          <div className="space-y-4">
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700">
              <strong>Full Name:</strong> {user.fullname}
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700">
              <strong>Email:</strong> {user.email}
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700">
              <strong>Password:</strong> {user.password}
            </div>
            <div className="bg-gray-100 border border-gray-200 rounded-md p-4 text-gray-700">
              <strong>Phone:</strong> {user.phone}
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => UpdateNavigate(user.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Update
              </button>
              <button
                onClick={deleteAccount}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No user found</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
