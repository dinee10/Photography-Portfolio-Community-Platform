import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


// Name regex: letters and spaces only
const nameRegex = /^[A-Za-z\s]+$/;

const Post = () => {
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
    status: '',
    tag: '',
    createdAt: '',
  });
  const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({
    name: '',
    topic: '',
    description: '',
    status: '',
    tag: '',
    createdAt: '',
    file: '',
  });
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date();
  const minDate = today.toISOString().split('T')[0]; // Formats as "2025-04-26"

  // Validate a single field
  const validateField = (fieldName, value) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!value || value.trim() === '') {
          error = 'Name is required';
        } else if (!nameRegex.test(value)) {
          error = 'Name can only contain letters and spaces';
        } else if (value.length < 2 || value.length > 50) {
          error = 'Name must be between 2 and 50 characters';
        }
        break;
      case 'topic':
        if (!value || value.trim() === '') {
          error = 'Topic is required';
        } else if (value.length < 3 || value.length > 100) {
          error = 'Topic must be between 3 and 100 characters';
        }
        break;
      case 'description':
        if (!value || value.trim() === '') {
          error = 'Description is required';
        } else if (value.length < 10 || value.length > 500) {
          error = 'Description must be between 10 and 500 characters';
        }
        break;
      case 'status':
        if (!value) {
          error = 'Please select a status';
        }
        break;
      case 'tag':
        if (value && value.length > 50) {
          error = 'Tag cannot exceed 50 characters';
        }
        break;
      case 'createdAt':
        if (!value) {
          error = 'Please select a date';
        }
        break;
      case 'file':
        if (!value) {
          error = 'Image is required';
        } else if (!value.type.startsWith('image/')) {
          error = 'File must be an image (JPEG, PNG, GIF)';
        } else if (value.size > 5 * 1024 * 1024) {
          error = 'Image size must not exceed 5MB';
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Handle input changes and validate
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    const error = validateField(name, value);
    setFormErrors({ ...formErrors, [name]: error });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    const error = validateField('file', file);
    setFormErrors({ ...formErrors, file: error });
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    errors.name = validateField('name', formData.name);
    errors.topic = validateField('topic', formData.topic);
    errors.description = validateField('description', formData.description);
    errors.status = validateField('status', formData.status);
    errors.tag = validateField('tag', formData.tag);
    errors.createdAt = validateField('createdAt', formData.createdAt);
    errors.file = validateField('file', file);

    Object.values(errors).forEach((error) => {
      if (error) isValid = false;
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fix the errors in the form before submitting.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('topic', formData.topic);
    data.append('description', formData.description);
    data.append('status', formData.status);
    data.append('tag', formData.tag);
    data.append('createdAt', formData.createdAt);
    data.append('file', file);

    try {
      await axios.post('http://localhost:8080/post', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: 'Success',
        text: 'Progress saved successfully',
        icon: 'success',
      }).then(() => {
        setFormData({
          name: '',
          topic: '',
          description: '',
          status: '',
          tag: '',
          createdAt: '',
        });
        setFile(null);
        setFormErrors({});
        navigate('/postlist');
      });
    } catch (err) {
  
      Swal.fire({
        title: 'Error',
        text: 'Failed to save progress. Please try again.',
        icon: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
   
      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Log New Post</h1>
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.name}</span>
              )}
            </div>

            {/* Topic Field */}
            <div className="mb-4">
              <label htmlFor="topic" className="block text-gray-800 font-semibold mb-2">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.topic ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.topic}
                onChange={handleChange}
              />
              {formErrors.topic && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.topic}</span>
              )}
            </div>

            {/* Description Field */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-800 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.description ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />
              {formErrors.description && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.description}</span>
              )}
            </div>

            {/* Status Field */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-800 font-semibold mb-2">
                Status
              </label>
              <select
                name="status"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.status ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Potrait">Potrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Nature">Nature</option>
              </select>
              {formErrors.status && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.status}</span>
              )}
            </div>

            {/* Tag Field */}
            <div className="mb-4">
              <label htmlFor="tag" className="block text-gray-800 font-semibold mb-2">
                Tag (Optional)
              </label>
              <input
                type="text"
                name="tag"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.tag ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.tag}
                onChange={handleChange}
              />
              {formErrors.tag && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.tag}</span>
              )}
            </div>

            {/* File Upload Field */}
            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-800 font-semibold mb-2">
                Upload Image
              </label>
              <input
                type="file"
                name="file"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.file ? "border-red-500" : "border-gray-300"
                }`}
                onChange={handleFileChange}
                accept="image/*"
              />
              {formErrors.file && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.file}</span>
              )}
            </div>

            {/* Created At Field */}
            <div className="mb-4">
              <label htmlFor="createdAt" className="block text-gray-800 font-semibold mb-2">
                Created At
              </label>
              <input
                type="date"
                name="createdAt"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.createdAt ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.createdAt}
                onChange={handleChange}
                min={minDate}
              />
              {formErrors.createdAt && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.createdAt}</span>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300">
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Post;

