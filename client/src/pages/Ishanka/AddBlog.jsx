import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function AddBlog() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    category: "AI", // Default to the first new category
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [charCount, setCharCount] = useState(0);
  const MAX_CONTENT_LENGTH = 65535; // Match your database column type

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "content") {
      setCharCount(value.length);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate content length
    if (formData.content.length > MAX_CONTENT_LENGTH) {
      setError(`Content is too long. Please limit to ${MAX_CONTENT_LENGTH} characters.`);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("author", formData.author);
    data.append("category", formData.category.toLowerCase()); // Ensure backend receives lowercase
    images.forEach((image) => data.append("newImages", image));

    try {
      const response = await axios.post("http://localhost:5000/blog/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(response.data.message || "Blog added successfully!");
      setFormData({ title: "", content: "", author: "", category: "AI" });
      setImages([]);
      setCharCount(0);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to add blog. Please try again."
      );
      console.error("Error adding blog:", err);
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Add New Blog</h1>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={255}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="10"
              required
            />
            <div className={`text-sm mt-1 ${charCount > MAX_CONTENT_LENGTH ? 'text-red-600' : 'text-gray-500'}`}>
              {charCount}/{MAX_CONTENT_LENGTH} characters
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="author">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={100}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="AI">AI</option>
              <option value="Wildphotography">Wildphotography</option>
              <option value="Fashion">Fashion</option>
              <option value="Foods">Foods</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="images">
              Images
            </label>
            <input
              type="file"
              id="images"
              name="newImages"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-lg"
              multiple
              accept="image/*"
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition duration-300"
              disabled={charCount > MAX_CONTENT_LENGTH}
            >
              Add Blog
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
}