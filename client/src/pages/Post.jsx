import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProgressList = () => {
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

  return (
    <div className="container mt-4">
      <h2>Post Details</h2>
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
                  <p className="card-text"><strong>Status:</strong> {progress.status}</p>
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
  );
};

export default ProgressList;