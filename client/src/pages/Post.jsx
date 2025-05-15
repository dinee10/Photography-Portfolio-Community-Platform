
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
    setNotifications(storedNotifications);
  }, []);

  const handleRemoveNotification = (indexToRemove) => {
    const updatedNotifications = notifications.filter((_, index) => index !== indexToRemove);
    setNotifications(updatedNotifications);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  return (
    <div className="bg-gray-800 p-4 h-full" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-400">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li key={index} className="border-b border-gray-600 pb-2 flex justify-between items-center">
              <p className="text-gray-300 text-sm">
                You {notification.action} the post "{notification.postName}" on {notification.timestamp}
              </p>
              <button
                onClick={() => handleRemoveNotification(index)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const PostList = () => {
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchPosts(storedUserId);
    } else {
      setError('User not logged in. Please log in to view posts.');
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const fetchPosts = async (userId) => {
    try {
      const res = await axios.get('http://localhost:8080/post', {
        params: { userId },
      });
      setPostList(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching post data:', err);
      const errorMessage = err.response?.data || 'Failed to load post data. Please try again later.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!userId) {
      Swal.fire({
        title: 'Error!',
        text: 'User not logged in. Please log in to delete posts.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      navigate('/login');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this post?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const postToDelete = postList.find((post) => post.id === id);
          const res = await axios.delete(`http://localhost:8080/post/${id}`, {
            params: { userId },
          });
          Swal.fire({
            title: 'Deleted!',
            text: res.data || 'Post deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          });

          // Add notification to localStorage
          const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          notifications.push({
            action: 'deleted',
            postName: postToDelete?.name || 'Untitled',
            timestamp: new Date().toLocaleString(),
          });
          localStorage.setItem('notifications', JSON.stringify(notifications));

          setDeleteError(null);
          fetchPosts(userId);
        } catch (error) {
          console.error('Error deleting post:', error);
          const errorMessage = error.response?.data || 'Post deletion failed. Please try again.';
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

  const handleCreate = () => {
    navigate('/post');
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading posts...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  return (
    <section className="max-w-7xl p-6 mx-auto bg-gray-700 rounded-md shadow-md dark:bg-gray-800 mt-20">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 d-none d-md-block position-sticky" style={{ top: '20px' }}>
            <NotificationPanel />
          </div>
          <div className="col-md-9">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-4xl font-bold text-white capitalize">Your Post List</h1>
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                onClick={handleCreate}
              >
                Create New Post
              </button>
            </div>
            <div className="d-md-none mb-4">
              <NotificationPanel />
            </div>
            {deleteError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {deleteError}
              </div>
            )}
            <div className="space-y-6">
              {postList.length === 0 ? (
                <p className="text-white">No post data available.</p>
              ) : (
                postList.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start p-4 bg-white rounded-md shadow-md dark:bg-gray-800"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {post.image ? (
                        <img
                          src={`http://localhost:8080/post/image/${post.image}`}
                          alt={post.name}
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
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{post.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300">Topic: {post.topic}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                        {post.description.length > 100 ? `${post.description.substring(0, 100)}...` : post.description}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">Status: {post.status}</p>
                      <p className="text-gray-600 dark:text-gray-400">Tag: {post.tag}</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Created At: {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : "Not available"}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Updated At: {post.updatedAt
                          ? new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : "Not available"}
                      </p>
                      {post.user && (
                        <p className="text-gray-600 dark:text-gray-400">
                          Created By: {post.user.fullname || "Unknown"} ({post.user.email || "No email"})
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                        onClick={() => deletePost(post.id)}
                      >
                        Delete
                      </button>
                      <Link
                        to={`/post/update/${post.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                      >
                        Update
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostList;
