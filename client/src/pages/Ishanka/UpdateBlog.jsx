import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function UpdateBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    title: "",
    author: "",
    content: "",
    category: "general",
    image: "",
    userId: "",
  });
  const [newImage, setNewImage] = useState(null);
  const [deleteCurrentImage, setDeleteCurrentImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({
    title: "",
    author: "",
    content: "",
    category: "",
    file: "",
    userId: "",
  });

  useEffect(() => {
    if (!id) {
      Swal.fire({
        title: "Error",
        text: "Invalid blog ID",
        icon: "error",
        confirmButtonText: "OK",
      });
      setLoading(false);
      return;
    }

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire({
        title: "Error",
        text: "User not logged in. Please log in to update the blog.",
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    const fetchBlog = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/blog/get/${id}?userId=${userId}`
        );
        setBlog({
          title: response.data.title || "",
          author: response.data.author || "",
          content: response.data.content || "",
          category: response.data.category || "general",
          image: response.data.image || "",
          userId: response.data.user?.id || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setLoading(false);
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "Failed to load blog data.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };

    fetchBlog();
  }, [id, navigate]);

  const validateField = (fieldName, value) => {
    let error = "";

    switch (fieldName) {
      case "title":
        if (!value || value.trim() === "") {
          error = "Title is required";
        }
        break;
      case "author":
        if (!value || value.trim() === "") {
          error = "Author is required";
        }
        break;
      case "content":
        if (!value || value.trim() === "") {
          error = "Content is required";
        }
        break;
      case "category":
        if (!value) {
          error = "Category is required";
        }
        break;
      case "userId":
        if (!value) {
          error = "User ID is required";
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
      default:
        break;
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const selectedFile = files ? files[0] : null;
      setNewImage(selectedFile);
      setDeleteCurrentImage(false);
      const error = validateField("file", selectedFile);
      setFormErrors({ ...formErrors, file: error });
    } else {
      setBlog((prevBlog) => ({
        ...prevBlog,
        [name]: value,
      }));
      const error = validateField(name, value);
      setFormErrors({ ...formErrors, [name]: error });
    }
  };

  const handleImageChange = (e) => {
    handleInputChange(e);
  };

  const handleRemoveImage = () => {
    setDeleteCurrentImage(true);
    setNewImage(null);
    setBlog((prevBlog) => ({ ...prevBlog, image: "" }));
    setFormErrors({ ...formErrors, file: "" });
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    errors.title = validateField("title", blog.title);
    errors.author = validateField("author", blog.author);
    errors.content = validateField("content", blog.content);
    errors.category = validateField("category", blog.category);
    errors.userId = validateField("userId", blog.userId);
    errors.file = validateField("file", newImage);

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
        text: "User not logged in. Please log in to update the blog.",
        icon: "error",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    const formData = new FormData();
    formData.append("title", blog.title);
    formData.append("author", blog.author);
    formData.append("content", blog.content);
    formData.append("category", blog.category);
    formData.append("userId", blog.userId);

    if (newImage) {
      formData.append("file", newImage);
    } else if (deleteCurrentImage) {
      formData.append("file", "");
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `http://localhost:8080/blog/update/${id}?userId=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Swal.fire({
        title: "Success",
        text: response.data.message || "Blog updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => navigate("/admin"));
    } catch (err) {
      console.error("Submit error:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to update blog.";
      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Update Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={blog.title}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.title ? "border-red-500" : "border-gray-300"
            }`}
            required
            placeholder="Enter blog title"
          />
          {formErrors.title && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.title}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <input
            type="text"
            name="author"
            value={blog.author}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.author ? "border-red-500" : "border-gray-300"
            }`}
            required
            placeholder="Enter author name"
          />
          {formErrors.author && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.author}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            value={blog.content}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.content ? "border-red-500" : "border-gray-300"
            }`}
            rows="8"
            required
            placeholder="Write your blog content here"
          />
          {formErrors.content && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.content}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={blog.category}
            onChange={handleInputChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.category ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="general">AI</option>
            <option value="documentary">Documentary</option>
            <option value="wildphotography">Wildphotography</option>
            <option value="fashion">Fashion</option>
            <option value="foods">Foods</option>
          </select>
          {formErrors.category && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.category}</span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Image</label>
          <div className="flex gap-4 mt-2 flex-wrap">
            {blog.image && !deleteCurrentImage ? (
              <div className="relative">
                <img
                  src={`http://localhost:8080/blog/uploads/${blog.image}`}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded-md"
                  onError={(e) => (e.target.src = "https://via.placeholder.com/128")}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
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
          <label className="block text-sm font-medium text-gray-700">
            {blog.image && !deleteCurrentImage ? "Replace Image" : "Upload New Image"}
          </label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            className={`mt-1 block w-full border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              formErrors.file ? "border-red-500" : "border-gray-300"
            }`}
            accept="image/*"
          />
          {formErrors.file && (
            <span className="text-red-500 text-sm mt-1 block">{formErrors.file}</span>
          )}
        </div>
        <div className="text-right flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Update Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}