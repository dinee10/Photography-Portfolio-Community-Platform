import React, { useState } from 'react';
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AddUser() {
  let navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
    age: '',
    description: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    age: '',
    description: ''
  });

  const { name, email, age, description } = user;

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', age: '', description: '' };

    // Lesson Name validation
    if (!name.trim()) {
      newErrors.name = 'Lesson Name is required';
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = 'Lesson Name must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Enter a valid email address';
      isValid = false;
    }

    // Views validation
    if (!age) {
      newErrors.age = 'Views is required';
      isValid = false;
    } else if (isNaN(age) || age <= 0) {
      newErrors.age = 'Views must be a positive number';
      isValid = false;
    }

    // Video Link validation
    if (!description.trim()) {
      newErrors.description = 'Video Link is required';
      isValid = false;
    } else if (!/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(description)) {
      newErrors.description = 'Enter a valid URL';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });

    // Clear error for the field being edited
    setErrors({ ...errors, [name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await axios.post("http://localhost:8080/api/v1/users", user);
        navigate("/");
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to add lesson. Please try again.');
      }
    }
  };

  // Check if form is valid to enable/disable submit button
  const isFormValid = name.trim() && email.trim() && age && description.trim() && !Object.values(errors).some(error => error);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3 border rounded p-4 mt-5 shadow bg-white">
          <h2 className="text-center mb-4">Add New Lesson</h2>

          <form onSubmit={onSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Lesson Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter Lesson Name"
                name="name"
                value={name}
                onChange={onInputChange}
                required
                minLength="3"
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Teacher's Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter Teacher's Email"
                name="email"
                value={email}
                onChange={onInputChange}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="age" className="form-label">Views</label>
              <input
                type="number"
                className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                placeholder="Enter Views"
                name="age"
                value={age}
                onChange={onInputChange}
                required
                min="1"
              />
              {errors.age && <div className="invalid-feedback">{errors.age}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Video Link</label>
              <input
                type="url"
                className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                placeholder="Enter Video Link"
                name="description"
                value={description}
                onChange={onInputChange}
                required
              />
              {errors.description && <div className="invalid-feedback">{errors.description}</div>}
            </div>

            <div className="d-flex justify-content-between">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid}
              >
                Submit
              </button>
              <Link className="btn btn-outline-danger" to="/">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddUser;