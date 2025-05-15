import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import background from '../assets/pexels-andreea-ch-371539-1166644.jpg';

function Home() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const incrementLikes = async (id, link) => {
    try {
      await axios.put(`http://localhost:8080/api/v1/users/increment/${id}`);
      loadUsers();
      window.open(link, '_blank');
    } catch (error) {
      console.error('Error incrementing likes:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const result = await axios.get('http://localhost:8080/api/v1/users');
      setUsers(result.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/users/${id}`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const uploadImage = async (id, file) => {
    const formData = new FormData();
    formData.append('imageFile', file);

    try {
      await axios.post(`http://localhost:8080/api/v1/users/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      loadUsers();
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleImageChange = (id, event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(id, file);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-container">
      <div className="container py-5">
        {/* Search Bar */}
        <div className="mb-4 d-flex justify-content-center">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by Lesson Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Add New Lessons Button */}
        <div className="mb-4 d-flex justify-content-center">
          <Link className="btn btn-primary custom-btn" to="/adduser">
            Add New Lesson
          </Link>
        </div>

        {/* Lessons Grid */}
        <div className="row g-4">
          {filteredUsers.map((user, index) => (
            <div className="col-md-4 col-sm-6" key={index}>
              <div className="card lesson-card h-100">
                <img
                  src={
                    user.imageData
                      ? `data:${user.imageType};base64,${user.imageData}`
                      : 'https://via.placeholder.com/150'
                  }
                  className="card-img-top"
                  alt="Lesson thumbnail"
                />
                <div className="card-body">
                  <h5 className="card-title">{user.name}</h5>
                  <p className="card-text">
                    <strong>Teacher's Email:</strong> {user.email}
                    <br />
                    <strong>Views:</strong> {user.age}
                    <br />
                    <strong>Video Link:</strong>{' '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        incrementLikes(user.id, user.description);
                      }}
                      className="text-primary"
                    >
                      Watch Now
                    </a>
                  </p>
                  <div className="d-flex gap-2 flex-wrap">
                    <Link className="btn btn-outline-primary btn-sm custom-btn" to={`/viewuser/${user.id}`}>
                      View
                    </Link>
                    <Link className="btn btn-outline-secondary btn-sm custom-btn" to={`/edituser/${user.id}`}>
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm custom-btn"
                      onClick={() => deleteUser(user.id)}
                    >
                      Delete
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(user.id, e)}
                      style={{ display: 'none' }}
                      id={`image-upload-${user.id}`}
                    />
                    <label
                      htmlFor={`image-upload-${user.id}`}
                      className="btn btn-outline-info btn-sm custom-btn"
                    >
                      Upload Image
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center text-muted mt-4">No lessons found</div>
        )}
      </div>
    </div>
  );
}

export default Home;