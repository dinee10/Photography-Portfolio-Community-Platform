import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2'; // Import SweetAlert2

const ProgressList = () => {
  const [progressList, setProgressList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:8080/progress')
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
    // Replace window.confirm with Swal.fire
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this progress item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:8080/progress/${id}`);
          setProgressList(progressList.filter((progress) => progress.id !== id));
          Swal.fire({
            title: 'Deleted!',
            text: 'Progress item deleted successfully!',
            icon: 'success',
            confirmButtonText: 'OK',
          });
        } catch (error) {
          console.error('Error deleting progress item:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete progress item.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Progress Details</h2>
        <button
          className="btn btn-success"
          onClick={() => navigate('/addprogress')}
        >
          Add Progress
        </button>
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
                  <p className="card-text"><strong>Status:</strong> {progress.status}</p>
                  <p className="card-text"><strong>Tag:</strong> {progress.tag}</p>
                  {progress.image && (
                    <img
                      src={`http://localhost:8080/uploads/${progress.image}`}
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