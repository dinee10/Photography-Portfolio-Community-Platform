import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not found');
      }
      const res = await axios.get(`http://localhost:8080/user/${userId}`);
      setUser(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data. Please try again later.');
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`http://localhost:8080/user/${user.id}`);
          Swal.fire({
            title: 'Deleted!',
            text: res.data.message || 'Account deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            localStorage.removeItem('userId');
            window.location.href = '/';
          });
          setDeleteError(null);
        } catch (error) {
          console.error('Error deleting account:', error);
          const errorMessage = error.response?.data?.message || 'Account deletion failed. Please try again.';
          setDeleteError(errorMessage);
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  return (
    <section className="max-w-7xl p-6 mx-auto bg-gray-700 rounded-md shadow-md dark:bg-gray-800 mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-white capitalize dark:text-white">User Profile</h1>
      </div>

      {deleteError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {deleteError}
        </div>
      )}

      <div className="space-y-6">
        {!user ? (
          <p className="text-white">No user data available.</p>
        ) : (
          <div className="flex items-start p-4 bg-white rounded-md shadow-md dark:bg-gray-800">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{user.fullname}</h2>
              <p className="text-gray-600 dark:text-gray-300">Email: {user.email}</p>
              <p className="text-gray-600 dark:text-gray-400">Phone: {user.phone}</p>
              <p className="text-gray-600 dark:text-gray-400">Password: {user.password}</p>
            </div>
            <div className="flex items-center space-x-4 ml-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                onClick={deleteAccount}
              >
                Delete
              </button>
              <Link
                to={`/updateprofile/${user.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Update
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default UserProfile;