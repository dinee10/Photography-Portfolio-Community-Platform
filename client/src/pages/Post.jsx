import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="bg-light border-end p-4 h-100" style={{ minHeight: 'calc(100vh - 60px)' }}>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li key={index} className="border-b border-gray-200 pb-2 flex justify-between items-center">
              <p className="text-gray-700 text-sm">
                You {notification.action} the post "{notification.postName}" on {notification.timestamp}
              </p>
              <button
                onClick={() => handleRemoveNotification(index)}
                className="btn btn-danger btn-sm"
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
  const [progressList, setProgressList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8080/post')
      .then((response) => {
        setProgressList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching progress data:', error);
      });
  }, []);

  const handleUpdate = (id) => {
    navigate(`/update/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:8080/post/${id}`);
        setProgressList(progressList.filter((progress) => progress.id !== id));
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post.');
      }
    }
  };

  const handleCreate = () => {
    navigate('/post');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        {/* Left Sidebar - Notification Panel */}
        <div className="col-md-3 d-none d-md-block position-sticky" style={{ top: '20px' }}>
          <NotificationPanel />
        </div>

        {/* Right Content - Post List */}
        <div className="col-md-9">
          <div className="position-relative mb-4">
            <h2>Post Details</h2>
            <button
              className="btn btn-success position-absolute top-0 end-0"
              onClick={handleCreate}
            >
              Create New Post
            </button>
          </div>

          {/* On smaller screens, show the Notification Panel above the post list */}
          <div className="d-md-none mb-4">
            <NotificationPanel />
          </div>

          {progressList.length === 0 ? (
            <p>No data available.</p>
          ) : (
            <div className="row">
              {progressList.map((progress) => (
                <div key={progress.id} className="col-md-4 mb-4">
                  <div className="card">
                    <div className="card-body">
                      <h3 className="card-title">{progress.name}</h3>
                      <p className="card-text"><strong>Topic:</strong> {progress.topic}</p>
                      <p className="card-text"><strong>Description:</strong> {progress.description}</p>
                      <p className="card-text"><strong>Category:</strong> {progress.category}</p>
                      <p className="card-text"><strong>Tag:</strong> {progress.tag}</p>
                      {progress.image && (
                        <img
                          src={`http://localhost:8080/post/image/${progress.image}`}
                          alt={progress.name}
                          className="img-fluid mt-3"
                          style={{ pointerEvents: 'none' }}
                        />
                      )}
                      <p className="text-muted mt-2">
                        <small>Created At: {new Date(progress.createdAt).toLocaleString()}</small>
                      </p>
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleUpdate(progress.id)}
                        >
                          Update
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(progress.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;