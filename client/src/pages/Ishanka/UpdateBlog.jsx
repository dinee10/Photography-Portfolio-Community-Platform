import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function UpdateBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    title: "",
    author: "",
    content: "",
    category: "general",
    blogImages: [],
    newImages: [],
  });
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid blog ID");
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/blog/get/${id}`);
        setBlog({
          title: response.data.title || "",
          author: response.data.author || "",
          content: response.data.content || "",
          category: response.data.category || "general",
          blogImages: response.data.blogImages || [],
          newImages: [],
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch blog data. Please try again.");
        console.error("Fetch error:", err);
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "newImages") {
      setBlog((prevBlog) => ({
        ...prevBlog,
        newImages: files ? Array.from(files) : [],
      }));
    } else {
      setBlog((prevBlog) => ({
        ...prevBlog,
        [name]: value,
      }));
    }
  };

  const handleDeleteImage = (index) => {
    setBlog((prevBlog) => {
      const updatedImages = prevBlog.blogImages.filter((_, i) => i !== index);
      const deletedImage = prevBlog.blogImages[index];
      setImagesToDelete((prev) => [...prev, deletedImage]);
      return { ...prevBlog, blogImages: updatedImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!blog.title.trim() || !blog.author.trim() || !blog.content.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("title", blog.title);
    formData.append("author", blog.author);
    formData.append("content", blog.content);
    formData.append("category", blog.category);

    blog.newImages.forEach((image) => {
      formData.append("newImages", image);
    });

    if (imagesToDelete.length > 0) {
      formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.put(`http://localhost:8080/blog/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Update response:", response.data);
      alert("Blog updated successfully!");
      setImagesToDelete([]);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Failed to update blog: ${errorMessage}`);
      console.error("Submit error:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Update Blog</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            name="title"
            value={blog.title}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            required
            placeholder="Enter blog title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Author</label>
          <input
            type="text"
            name="author"
            value={blog.author}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            required
            placeholder="Enter author name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            name="content"
            value={blog.content}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            rows="8"
            required
            placeholder="Write your blog content here"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            value={blog.category}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
          >
            <option value="documentary">Documentary</option>
            <option value="wildphotography">Wildphotography</option>
            <option value="fashion">Fashion</option>
            <option value="foods">Foods</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Images</label>
          <div className="flex flex-wrap gap-4 mt-2">
            {blog.blogImages.length > 0 ? (
              blog.blogImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:8080/blog/uploads/${image}`}
                    alt={`Current ${index}`}
                    className="w-32 h-32 object-cover rounded-md border border-gray-200"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/128")}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                  >
                    X
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No images uploaded.</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload New Images</label>
          <input
            type="file"
            name="newImages"
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm py-2 px-3"
            multiple
            accept="image/*"
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition ${
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