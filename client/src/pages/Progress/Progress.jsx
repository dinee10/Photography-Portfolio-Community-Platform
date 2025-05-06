import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function ProgressL() {
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchProgress(storedUserId);
    } else {
      setError('User not logged in. Please log in to view progress.');
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const fetchProgress = async (userId) => {
    try {
      const res = await axios.get('http://localhost:8080/progress', {
        params: { userId }
      });
      setProgressList(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data. Please try again later.');
      setLoading(false);
    }
  };

  const deleteProgress = async (id) => {
    if (!userId) {
      Swal.fire({
        title: 'Error!',
        text: 'User not logged in. Please log in to delete progress.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      navigate('/login');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this progress item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`http://localhost:8080/progress/${id}`, {
            params: { userId }
          });
          Swal.fire({
            title: 'Deleted!',
            text: res.data || 'Progress item deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          setDeleteError(null);
          fetchProgress(userId);
        } catch (error) {
          console.error('Error deleting progress item:', error);
          const errorMessage = error.response?.data?.message || 'Progress deletion failed. Please try again.';
          setDeleteError(errorMessage);
          Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      }
    });
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading progress...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  return (
    <section className="max-w-7xl p-6 mx-auto bg-gray-700 rounded-md shadow-md dark:bg-gray-800 mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-white capitalize dark:text-white">Your Progress List</h1>
      </div>

      {deleteError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {deleteError}
        </div>
      )}

      <div className="space-y-6">
        {progressList.length === 0 ? (
          <p className="text-white">No progress data available.</p>
        ) : (
          progressList.map((progress) => (
            <div
              key={progress.id}
              className="flex items-start p-4 bg-white rounded-md shadow-md dark:bg-gray-800"
            >
              <div className="flex-shrink-0 mr-4">
                {progress.image ? (
                  <img
                    src={`http://localhost:8080/uploads/${progress.image}`}
                    alt={progress.name}
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/128')}
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{progress.name}</h2>
                <p className="text-gray-600 dark:text-gray-300">Topic: {progress.topic}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                  {progress.description.length > 100 ? `${progress.description.substring(0, 100)}...` : progress.description}
                </p>
                <p className="text-gray-600 dark:text-gray-400">Status: {progress.status}</p>
                <p className="text-gray-600 dark:text-gray-400">Tag: {progress.tag}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Created At: {new Date(progress.createdAt).toLocaleString()}
                </p>
                {progress.user && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Created By: {progress.user.fullname} ({progress.user.email})
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4 ml-4">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  onClick={() => deleteProgress(progress.id)}
                >
                  Delete
                </button>
                <Link
                  to={`/update/${progress.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Update
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default ProgressL;