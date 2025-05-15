import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const today = "2025-05-15"; // Today's date in YYYY-MM-DD format

  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    description: "",
    status: "",
    tag: "",
    createdAt: "",
    updatedAt: today,
  });
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    name: "",
    topic: "",
    description: "",
    status: "",
    tag: "",
    file: "",
    updatedAt: "",
  });

  useEffect(() => {
    if (!id) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Error",
        text: "User not logged in. Please log in to update post.",
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:8080/post/${id}?userId=${userId}`)
      .then((res) => {
        setFormData({
          name: res.data.name || "",
          topic: res.data.topic || "",
          description: res.data.description || "",
          status: res.data.status || "",
          tag: res.data.tag || "",
          createdAt: res.data.createdAt ? res.data.createdAt.toString().substring(0, 10) : "",
          updatedAt: res.data.updatedAt ? res.data.updatedAt.toString().substring(0, 10) : today,
        });
        setExistingImage(res.data.image || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "Failed to load post data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      });
  }, [id, navigate]);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "name":
        if (!value || value.trim() === "") {
          error = "Name is required";
        }
        break;
      case "topic":
        if (!value || value.trim() === "") {
          error = "Topic is required";
        }
        break;
      case "description":
        if (!value || value.trim() === "") {
          error = "Description is required";
        }
        break;
      case "status":
        if (!value) {
          error = "Status is required";
        }
        break;
      case "tag":
        if (value && value.length > 50) {
          error = "Tag cannot exceed 50 characters";
        }
        break;
      case "file":
        if (value) {
          if (!value.type.startsWith("image/")) {
            error = "File must be an image";
          } else if (value.size > 5 * 1024 * 1024) {
            error = "Image size must not exceed 5MB";
          }
        }
        break;
      case "updatedAt":
        if (!value) {
          error = "Updated date is required";
        } else {
          const selectedDate = new Date(value);
          const todayDate = new Date(today);
          todayDate.setHours(0, 0, 0, 0);
          if (selectedDate < todayDate) {
            error = "Updated date must be today or later";
          }
        }
        break;
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const selectedFile = files ? files[0] : null;
      setFile(selectedFile);
      const error = validateField("file", selectedFile);
      setFormErrors({ ...formErrors, file: error });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
      const error = validateField(name, value);
      setFormErrors({ ...formErrors, [name]: error });
    }
  };

  const handleDeleteImage = () => {
    setExistingImage("");
    setFile(null);
    setFormErrors({ ...formErrors, file: "" });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    errors.name = validateField("name", formData.name);
    errors.topic = validateField("topic", formData.topic);
    errors.description = validateField("description", formData.description);
    errors.status = validateField("status", formData.status);
    errors.tag = validateField("tag", formData.tag);
    errors.file = validateField("file", file);
    errors.updatedAt = validateField("updatedAt", formData.updatedAt);

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
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Error",
        text: "User not logged in. Please log in to update post.",
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    const postDetails = {
      name: formData.name,
      topic: formData.topic,
      description: formData.description,
      status: formData.status,
      tag: formData.tag,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
    };

    const data = new FormData();
    data.append("post details", JSON.stringify(postDetails));
    if (file) {
      data.append("file", file);
    }

    try {
      const response = await axios.put(`http://localhost:8080/post/${id}?userId=${userId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Add notification to localStorage
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.push({
        action: 'updated',
        postName: formData.name || 'Untitled',
        timestamp: new Date().toLocaleString(),
      });
      localStorage.setItem('notifications', JSON.stringify(notifications));

      Swal.fire({
        title: "Success",
        text: response.data.message || "Post updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/admin"));
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      const errorMessage = err.response?.data || "Failed to update post.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto mt-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Update Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {formErrors.name && <span className="text-red-500 text-sm mt-1 block">{formErrors.name}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.topic ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {formErrors.topic && <span className="text-red-500 text-sm mt-1 block">{formErrors.topic}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.description ? "border-red-500" : "border-gray-300"
            }`}
            rows="8"
            required
          />
          {formErrors.description && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.description}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.status ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select Status</option>
            <option value="Potrait">Potrait</option>
            <option value="Landscape">Landscape</option>
            <option value="Nature">Nature</option>
          </select>
          {formErrors.status && <span className="text-red-500 text-sm mt-1 block">{formErrors.status}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tag</label>
          <input
            type="text"
            name="tag"
            value={formData.tag}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.tag ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.tag && <span className="text-red-500 text-sm mt-1 block">{formErrors.tag}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Created At</label>
          <input
            type="date"
            name="createdAt"
            value={formData.createdAt}
            className="mt-1 block w-full border rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Updated At</label>
          <input
            type="date"
            name="updatedAt"
            min={today}
            value={formData.updatedAt}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.updatedAt ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {formErrors.updatedAt && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.updatedAt}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Image</label>
          <div className="flex gap-4 mt-2 flex-wrap">
            {existingImage ? (
              <div className="relative">
                <img
                  src={`http://localhost:8080/uploads/${existingImage}`}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/128")}
                />
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                >
                  X
                </button>
              </div>
            ) : (
              <div>No current image</div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload New Image</label>
          <input
            type="file"
            name="file"
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.file ? "border-red-500" : "border-gray-300"
            }`}
            accept="image/*"
          />
          {formErrors.file && <span className="text-red-500 text-sm mt-1 block">{formErrors.file}</span>}
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </div>
  );
}