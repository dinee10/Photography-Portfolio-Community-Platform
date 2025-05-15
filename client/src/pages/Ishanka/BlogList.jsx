import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('http://localhost:8080/blog');
      setBlogs(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
      setLoading(false);
    }
  };

  const deleteBlog = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this blog?');
    if (confirmed) {
      try {
        const userId = localStorage.getItem('userId'); // Adjust based on your auth setup
        if (!userId) {
          throw new Error('User not authenticated. Please log in.');
        }

        const res = await axios.delete(`http://localhost:8080/blog/${id}`, {
          params: { userId },
        });
        alert(res.data.message || 'Blog deleted successfully!');
        setDeleteError(null);
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Blog deletion failed. Please try again.';
        setDeleteError(errorMessage);
      }
    }
  };

  if (loading) {
    return <div className="text-white text-center mt-20">Loading blogs...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-20">{error}</div>;
  }

  return (
    <section className="max-w-7xl p-6 mx-auto bg-gray-700 rounded-md shadow-md dark:bg-gray-800 mt-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold text-white capitalize dark:text-white">Blog List</h1>
      </div>

      {deleteError && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {deleteError}
        </div>
      )}

      <div className="space-y-6">
        {blogs.length === 0 ? (
          <p className="text-white">No blogs available.</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex items-start p-4 bg-white rounded-md shadow-md dark:bg-gray-800"
            >
              <div className="flex-shrink-0 mr-4">
                {blog.image ? (
                  <img
                    src={`http://localhost:8080/blog/uploads/${blog.image}`}
                    alt={blog.title}
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/128')}
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-md flex items-center justify-center">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{blog.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">Author: {blog.author}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                  {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
                </p>
              </div>
              <div className="flex items-center space-x-4 ml-4">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                  onClick={() => deleteBlog(blog.id)}
                >
                  Delete
                </button>
                <Link
                  to={`/update-blog/${blog.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Update
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default BlogList;