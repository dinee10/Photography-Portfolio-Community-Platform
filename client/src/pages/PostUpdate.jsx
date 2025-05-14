import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";


const nameRegex = /^[A-Za-z\s]+$/;

function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    description: '',
    status: '',
    tag: '',
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({
    name: "",
    topic: "",
    description: "",
    status: "",
    tag: "",
    file: "",
  });

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/post/${id}`);
        const progress = response.data;
        setFormData({
          name: progress.name || '',
          topic: progress.topic || '',
          description: progress.description || '',
          status: progress.status || '',
          tag: progress.tag || '',
        });
        setExistingImage(progress.image || "");
        setLoading(false);
      } catch (err) {
        console.error('Error fetching progress:', err);
        setError('Failed to load progress data.');
        setLoading(false);
      }
    };
    fetchProgress();
  }, [id]);

  // Handle form field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    // Validate file type
    if (file && !file.type.startsWith("image/")) {
      setFormErrors({ ...formErrors, file: "File must be an image" });
    } else {
      setFormErrors({ ...formErrors, file: "" });
    }
  };

  // Validate fields before submitting
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate fields
    Object.keys(formData).forEach((field) => {
      if (!formData[field] || formData[field].trim() === "") {
        errors[field] = `${field} is required`;
        isValid = false;
      }
    });

    // Validate image
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      errors.file = "Image size must not exceed 5MB";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const progressDetails = {
      name: formData.name,
      topic: formData.topic,
      description: formData.description,
      status: formData.status,
      tag: formData.tag,
      updatedAt: new Date().toISOString(),
    };

    const data = new FormData();
    data.append('progress details', JSON.stringify(progressDetails));
    if (file) {
      data.append('file', file);
    }

    try {
      await axios.put(`http://localhost:8080/post/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      Swal.fire({
        title: "Success",
        text: "Progress updated successfully!",
        icon: "success",
      }).then(() => navigate("/postlist"));
    } catch (err) {
      console.error('Error updating progress:', err);
      Swal.fire({
        title: "Error",
        text: "Failed to update progress.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) {
    return <div className="container mt-5">Loading...</div>;
  }

  if (error) {
    return <div className="container mt-5 text-danger">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-800">

      <div className="container mx-auto py-10 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Update Post</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-800 font-semibold mb-2">Name</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-500" : "border-gray-300"}`}
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              {formErrors.name && <span className="text-red-500 text-sm mt-1 block">{formErrors.name}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="topic" className="block text-gray-800 font-semibold mb-2">Topic</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.topic ? "border-red-500" : "border-gray-300"}`}
                id="topic"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
              />
              {formErrors.topic && <span className="text-red-500 text-sm mt-1 block">{formErrors.topic}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-800 font-semibold mb-2">Description</label>
              <textarea
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.description ? "border-red-500" : "border-gray-300"}`}
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
              />
              {formErrors.description && <span className="text-red-500 text-sm mt-1 block">{formErrors.description}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="status" className="block text-gray-800 font-semibold mb-2">Status</label>
              <select
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.status ? "border-red-500" : "border-gray-300"}`}
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="Potrait">Potrait</option>
                <option value="Landscape">Landscape</option>
                <option value="Nature">Nature</option>
              </select>
              {formErrors.status && <span className="text-red-500 text-sm mt-1 block">{formErrors.status}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="tag" className="block text-gray-800 font-semibold mb-2">Tag</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.tag ? "border-red-500" : "border-gray-300"}`}
                id="tag"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
              />
              {formErrors.tag && <span className="text-red-500 text-sm mt-1 block">{formErrors.tag}</span>}
            </div>

            <div className="mb-4">
              <label htmlFor="file" className="block text-gray-800 font-semibold mb-2">Upload New Image (Optional)</label>
              <input
                type="file"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.file ? "border-red-500" : "border-gray-300"}`}
                name="file"
                onChange={handleFileChange}
                accept="image/*"
              />
              {formErrors.file && <span className="text-red-500 text-sm mt-1 block">{formErrors.file}</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostUpdate;
