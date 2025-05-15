import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';

function EditUser() {
  let navigate = useNavigate();
  const { id } = useParams();

  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    description: '',
    imageData: null,
    imageType: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const { name, email, age, description, imageData, imageType } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  useEffect(() => {
    loadUser();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update user details
      await axios.put(`http://localhost:8080/api/v1/users/${id}`, {
        name,
        email,
        age,
        description,
      });

      // Upload image if a new file is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('imageFile', imageFile);
        await axios.post(`http://localhost:8080/api/v1/users/${id}/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Update Error:', error);
      alert('Failed to update user or upload image. Check if the server is running.');
    }
  };

  const loadUser = async () => {
    try {
      const result = await axios.get(`http://localhost:8080/api/v1/users/${id}`);
      setUser(result.data);
    } catch (error) {
      console.error('Load Error:', error);
      alert('Failed to load user. Check if the server is running.');
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-2 shadow">
          <h2 className="text-center m-4">Edit Lessons</h2>
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Lesson Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={name}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Teacher's Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={email}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Views</label>
              <input
                type="number"
                className="form-control"
                name="age"
                value={age}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Video Link</label>
              <input
                type="text"
                className="form-control"
                name="description"
                value={description}
                onChange={onInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={onImageChange}
              />
              {imageData && (
                <div className="mt-2">
                  <img
                    src={`data:${imageType};base64,${imageData}`}
                    alt="Current lesson image"
                    style={{ maxWidth: '150px' }}
                  />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-outline-primary">
              Submit
            </button>
            <Link className="btn btn-outline-danger mx-2" to="/">
              Cancel
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUser;