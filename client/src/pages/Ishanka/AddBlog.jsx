import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddBlog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "AI",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CONTENT_LENGTH = 65535;
  
  // Form validation states
  const [validationErrors, setValidationErrors] = useState({
    title: "",
    content: "",
    author: "",
    images: ""
  });
  const [touched, setTouched] = useState({
    title: false,
    content: false,
    author: false,
    images: false
  });

  const validateField = (name, value) => {
    let errorMessage = "";
    
    switch (name) {
      case "title":
        if (!value.trim()) {
          errorMessage = "Title is required";
        } else if (value.length < 5) {
          errorMessage = "Title must be at least 5 characters long";
        } else if (value.length > 255) {
          errorMessage = "Title cannot exceed 255 characters";
        }
        break;
        
      case "content":
        if (!value.trim()) {
          errorMessage = "Content is required";
        } else if (value.length < 10) {
          errorMessage = "Content must be at least 10 characters long";
        } else if (value.length > MAX_CONTENT_LENGTH) {
          errorMessage = `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`;
        }
        break;
        
      case "author":
        if (!value.trim()) {
          errorMessage = "Author name is required";
        } else if (value.length < 2) {
          errorMessage = "Author name must be at least 2 characters long";
        } else if (value.length > 100) {
          errorMessage = "Author name cannot exceed 100 characters";
        } else if (!/^[a-zA-Z\s.-]+$/.test(value)) {
          errorMessage = "Author name should contain only letters, spaces, dots, and hyphens";
        }
        break;
        
      case "images":
        if (value.length > 0) {
          const invalidImages = value.filter(img => {
            const fileType = img.type.split('/')[0];
            const fileSize = img.size / (1024 * 1024); // size in MB
            return fileType !== 'image' || fileSize > 5;
          });
          
          if (invalidImages.length > 0) {
            errorMessage = "All files must be images under 5MB";
          }
          
          if (value.length > 5) {
            errorMessage = "Maximum 5 images allowed";
          }
        }
        break;
        
      default:
        break;
    }
    
    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "content") {
      setCharCount(value.length);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate field if it has been touched
    if (touched[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: validateField(name, value)
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur
    setValidationErrors(prev => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    
    // Mark as touched and validate
    setTouched(prev => ({
      ...prev,
      images: true
    }));
    
    setValidationErrors(prev => ({
      ...prev,
      images: validateField("images", files)
    }));
  };

  const validateForm = () => {
    const errors = {
      title: validateField("title", formData.title),
      content: validateField("content", formData.content),
      author: validateField("author", formData.author),
      images: validateField("images", images)
    };
    
    setValidationErrors(errors);
    
    // Mark all fields as touched
    setTouched({
      title: true,
      content: true,
      author: true,
      images: true
    });
    
    // Return true if no errors
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Validate all fields before submission
    if (!validateForm()) {
      setError("Please fix all validation errors before submitting");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title.trim());
    data.append("content", formData.content.trim());
    data.append("author", formData.author.trim());
    data.append("category", formData.category.toLowerCase());
    images.forEach((image) => data.append("newImages", image));

    try {
      const response = await axios.post("http://localhost:5000/blog/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(response.data.message || "Blog added successfully!");
      setFormData({ title: "", content: "", author: "", category: "AI" });
      setImages([]);
      setCharCount(0);
      // Reset validation states
      setValidationErrors({
        title: "",
        content: "",
        author: "",
        images: ""
      });
      setTouched({
        title: false,
        content: false,
        author: false,
        images: false
      });
      setTimeout(() => navigate("/blog-list"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add blog. Please try again.");
      console.error("Error adding blog:", err);
    }
  };

  // Check if form has any errors
  const hasErrors = Object.values(validationErrors).some(error => error !== "");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 text-center">
          Add New Blog
        </h1>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.732 6.732a1 1 0 011.414 0L10 7.586l.854-.854a1 1 0 111.414 1.414L11.414 9l.854.854a1 1 0 11-1.414 1.414L10 10.414l-.854.854a1 1 0 11-1.414-1.414L8.586 9l-.854-.854a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border ${validationErrors.title && touched.title ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              maxLength={255}
            />
            {validationErrors.title && touched.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border ${validationErrors.content && touched.content ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y`}
              rows="8"
            />
            <div className={`text-sm mt-1.5 ${charCount > MAX_CONTENT_LENGTH ? "text-red-600" : "text-gray-500"}`}>
              {charCount}/{MAX_CONTENT_LENGTH} characters
            </div>
            {validationErrors.content && touched.content && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.content}</p>
            )}
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border ${validationErrors.author && touched.author ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
              maxLength={100}
            />
            {validationErrors.author && touched.author && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.author}</p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            >
              <option value="AI">AI</option>
              <option value="Wildphotography">Wild Photography</option>
              <option value="Fashion">Fashion</option>
              <option value="Foods">Foods</option>
            </select>
          </div>
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
              Images <span className="text-gray-500 text-xs">(Max 5 images, 5MB each)</span>
            </label>
            <input
              type="file"
              id="images"
              name="newImages"
              onChange={handleImageChange}
              className={`w-full px-4 py-2.5 border ${validationErrors.images && touched.images ? "border-red-500 ring-1 ring-red-500" : "border-gray-200"} rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-medium hover:file:bg-indigo-100 transition-colors`}
              multiple
              accept="image/*"
            />
            {images.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                {images.length} file(s) selected
              </div>
            )}
            {validationErrors.images && touched.images && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.images}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors ${hasErrors || charCount > MAX_CONTENT_LENGTH ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={hasErrors || charCount > MAX_CONTENT_LENGTH}
            >
              Add Blog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}