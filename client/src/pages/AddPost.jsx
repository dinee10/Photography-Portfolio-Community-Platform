
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Name regex: letters and spaces only
const nameRegex = /^[A-Za-z\s]+$/;

const AddPost = () => {
  const today = '2025-05-15'; // Today's date in YYYY-MM-DD format
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
    status: '',
    tag: '',
    createdAt: today,
  });
  const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({
    name: '',
    topic: '',
    description: '',
    status: '',
    tag: '',
    file: '',
    createdAt: '',
  });
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

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
      case 'file':
        if (!value) {
          error = 'Image is required';
        } else if (!value.type.startsWith('image/')) {
          error = 'File must be an image (JPEG, PNG, GIF)';
        } else if (value.size > 5 * 1024 * 1024) {
          error = 'Image size must not exceed 5MB';
        }
        break;
      case 'createdAt':
        if (!value) {
          error = 'Created date is required';
        } else {
          const selectedDate = new Date(value);
          const todayDate = new Date(today);
          todayDate.setHours(0, 0, 0, 0);
          if (selectedDate < todayDate) {
            error = 'Created date must be today or later';
          }
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
    errors.file = validateField('file', file);
    errors.createdAt = validateField('createdAt', formData.createdAt);

    Object.values(errors).forEach((error) => {
      if (error) isValid = false;
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire({
        title: 'Error',
        text: 'You must be logged in to add a post.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      navigate('/login');
      return;
    }

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
    data.append('file', file);
    data.append('userId', userId);
    data.append('createdAt', formData.createdAt);

    try {
      await axios.post('http://localhost:8080/post', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        title: 'Success',
        text: 'Post saved successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        setFormData({
          name: '',
          topic: '',
          description: '',
          status: '',
          tag: '',
          createdAt: today,
        });
        setFile(null);
        setFormErrors({});
        navigate('/postlist');
      });
    } catch (err) {
      console.error('Error saving post:', err);
      const errorMessage = err.response?.data || 'Failed to save post. Please try again.';
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="container mx-auto py-10 px-4">
        <div className="bg-gray-900 text-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Add New Post</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                name="name"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.name}</span>
              )}
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium">
                Topic
              </label>
              <input
                type="text"
                name="topic"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.topic ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.topic}
                onChange={handleChange}
              />
              {formErrors.topic && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.topic}</span>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                name="description"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.description ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />
              {formErrors.description && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.description}</span>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium">
                Status
              </label>
              <select
                name="status"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.status ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Portrait">Portrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Nature">Nature</option>
              </select>
              {formErrors.status && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.status}</span>
              )}
            </div>

            <div>
              <label htmlFor="tag" className="block text-sm font-medium">
                Tag (Optional)
              </label>
              <input
                type="text"
                name="tag"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.tag ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.tag}
                onChange={handleChange}
              />
              {formErrors.tag && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.tag}</span>
              )}
            </div>

            <div>
              <label htmlFor="createdAt" className="block text-sm font-medium">
                Created At
              </label>
              <input
                type="date"
                name="createdAt"
                min={today}
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.createdAt ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                value={formData.createdAt}
                onChange={handleChange}
              />
              {formErrors.createdAt && (
                <span className="text-red-500 text-sm mt-1 block">{formErrors.createdAt}</span>
              )}
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium">
                Upload Image
              </label>
              <input
                type="file"
                name="file"
                className={`mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.file ? 'border-red-500' : 'border-gray-600'
                } bg-gray-700 text-white`}
                onChange={handleFileChange}
                accept="image/*"
              />
              {formErrors.file && (
                <span className=" dostarcz: red-500 text-sm mt-1 block">{formErrors.file}</span>
              )}
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
