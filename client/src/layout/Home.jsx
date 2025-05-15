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
      loadUsers(); // Refresh users to show updated image
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

  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    paddingTop: '20px',
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={backgroundStyle}>
      <div className="container">
        <div className="py-4">
          <div className="mb-3 d-flex justify-content-center">
            <input
              type="text"
              className="form-control w-50"
              placeholder="Search by Lesson Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="row">
            {filteredUsers.map((user, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="card" style={{ width: '18rem' }}>
                  {/* Display user image or placeholder */}
                  <img
  src={
    user.imageData
      ? `data:${user.imageType};base64,${user.imageData}`
      : 'https://via.placeholder.com/150'
  }
  className="card-img-top"
  alt="Lesson thumbnail"
  style={{ width: '200x', height: '300px', objectFit: 'cover' }}
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
                      >
                        {user.description}
                      </a>
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <Link className="btn btn-primary" to={`/viewuser/${user.id}`}>
                        View
                      </Link>
                      <Link className="btn btn-outline-primary" to={`/edituser/${user.id}`}>
                        Edit
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                      {/* Image upload input */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(user.id, e)}
                        style={{ display: 'none' }}
                        id={`image-upload-${user.id}`}
                      />
                      <label
                        htmlFor={`image-upload-${user.id}`}
                        className="btn btn-outline-secondary"
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
    </div>
  );
}

export default Home;