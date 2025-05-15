
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import Navbar from '../components/Navbar/Navbar'; // Adjust path as needed

const AnimatedText = ({ text, className }) => {
  const words = (text || '').split(' ');
  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-slideInWord mr-1.5"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
};

const PostCard = ({ post, index }) => {
  const placeholderImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==';
  const minDate = new Date('2025-05-15');

  const mainImage = post.image
    ? `http://localhost:8080/post/image/${post.image}`
    : placeholderImage;

  const description =
    post.description && post.description.length > 120
      ? `${post.description.substring(0, 120)}...`
      : post.description || 'No description available';

  const createdDate = post.createdAt && !isNaN(new Date(post.createdAt))
    ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';
  const updatedDate = post.updatedAt && !isNaN(new Date(post.updatedAt))
    ? new Date(post.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';
  const metadata = `Status: ${post.status || 'Unknown'} • Created: ${createdDate} • Updated: ${updatedDate}`;

  return (
    <Link
      to={`/post/${post.id}`}
      className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden mb-4 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] max-w-3xl mx-auto animate-slideUp border-2 border-transparent hover:border-transparent hover:[box-shadow:0_0_10px_2px_rgba(239,68,68,0.5)]"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="md:w-full overflow-hidden">
        <img
          src={mainImage}
          alt={post.name || 'Post Image'}
          className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => (e.target.src = placeholderImage)}
        />
      </div>
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            <AnimatedText text={post.name || 'Untitled'} className="text-gray-900" />
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            <AnimatedText text={metadata} className="text-gray-500" />
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <AnimatedText text={description} className="text-gray-600" />
          </p>
          <p className="text-sm text-gray-600">
            <strong>Topic:</strong> {post.topic || 'No topic'}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tag:</strong> {post.tag || 'None'}
          </p>
          {post.user && (
            <p className="text-sm text-gray-600">
              <strong>Created By:</strong> {post.user.fullname || 'Unknown'} ({post.user.email || 'No email'})
            </p>
          )}
        </div>
        <div className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:text-blue-700 transition duration-300">
          <AnimatedText text="View Details" className="text-blue-500" />
          <span className="text-blue-500">→</span>
        </div>
      </div>
    </Link>
  );
};

const PostDetail = ({ post, onBack }) => {
  const placeholderImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==';

  const imageUrl = post.image
    ? `http://localhost:8080/post/image/${post.image}`
    : placeholderImage;

  const createdDate = post.createdAt && !isNaN(new Date(post.createdAt))
    ? new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={onBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft className="mr-1" size={20} />
        Back to all posts
      </button>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {post.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={imageUrl}
              alt={post.name || 'Post Image'}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = placeholderImage)}
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                {post.status || 'Unknown'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {post.name || 'Untitled'}
              </h1>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>
              Posted by {post.user?.fullname || 'Unknown'} on {createdDate}
            </span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {post.description || 'No description available'}
            </p>
          </div>

          {post.topic && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Topic</h3>
              <p className="text-gray-700">{post.topic}</p>
            </div>
          )}

          {post.tag && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tag.split(',').map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostHeader = () => {
  return (
    <div className="relative text-white h-[400px] bg-black">
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="flex flex-col justify-center animate-headerSlide">
          <h1 className="text-4xl md:text-5xl font-bold uppercase text-white mb-4">
            Explore Community Posts
          </h1>
          <p className="text-lg text-gray-300 mb-6">
            Discover and share creative content from our vibrant community.
          </p>
          <Link
            to="/post"
            className="inline-block bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
          >
            Add New Post →
          </Link>
        </div>
      </div>
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const minDate = new Date('2025-05-15');

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
      fetchPosts(storedUserId);
    } else {
      setError('User not logged in. Please log in to view posts.');
      setLoading(false);
      navigate('/login');
    }
  }, [navigate]);

  const fetchPosts = async (userId) => {
    try {
      const response = await axios.get('http://localhost:8080/post', {
        params: { userId },
      });
      const validatedPosts = (response.data || []).map((post) => {
        const createdAtDate = post.createdAt ? new Date(post.createdAt) : null;
        const updatedAtDate = post.updatedAt ? new Date(post.updatedAt) : null;
        let updatedPost = { ...post };
        if (!createdAtDate || (createdAtDate && !isNaN(createdAtDate) && createdAtDate < minDate)) {
          console.warn('Invalid or missing createdAt date:', post.createdAt);
          updatedPost.createdAt = null;
        }
        if (updatedAtDate && !isNaN(updatedAtDate) && updatedAtDate < minDate) {
          console.warn('Invalid updatedAt date:', post.updatedAt);
          updatedPost.updatedAt = null;
        }
        return updatedPost;
      });
      setPosts(validatedPosts);
    } catch (err) {
      const errorMessage = err.response?.data || 'Failed to fetch posts. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching posts:', err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPostsByCategory = (category) => {
    return posts.filter((post) => {
      const name = post.name || '';
      const description = post.description || '';
      const topic = post.topic || '';
      const status = post.status || '';
      return (
        (name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.toLowerCase().includes(searchTerm.toLowerCase())) &&
        status.toLowerCase() === category.toLowerCase()
      );
    });
  };

  const categories = [
    { name: 'Portrait', description: 'Posts featuring portrait photography.' },
    { name: 'Landscape', description: 'Posts showcasing landscape photography.' },
    { name: 'Nature', description: 'Posts capturing the beauty of nature.' },
  ];

  if (id) {
    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Loading post...</p>
        </div>
      );
    }
    const post = posts.find((p) => p.id == id);
    if (!post) {
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Post not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-500 hover:underline"
          >
            Back to all posts
          </button>
        </div>
      );
    }
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <PostDetail post={post} onBack={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes zoomIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideInFromLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes slideInWord {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes headerSlide {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideInWord {
            animation: slideInWord 0.5s ease-out forwards;
          }
          .animate-headerSlide {
            animation: headerSlide 1s ease-out forwards;
          }
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>

      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <PostHeader />

      <div className="container mx-auto px-4 py-6">
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search posts..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            <AnimatedText text="Welcome to Post Explorer!" className="text-gray-800" />
          </h2>
          <p className="text-white">
            <AnimatedText
              text="Discover and share community posts in real-time."
              className="text-white"
            />
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 bg-red-500 border-b border-gray-200">
        <nav className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href={`#${category.name.toLowerCase().replace(' ', '-')}`}
              className="text-gray-100 hover:text-gray-800 font-medium text-sm uppercase flex items-center"
              aria-label={`View ${category.name} posts`}
            >
              {category.name}
              <span className="ml-1">▼</span>
            </a>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-purple-900 text-lg">Loading posts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      ) : (
        categories.map((category) => {
          const filteredPosts = filterPostsByCategory(category.name);
          return (
            <div key={category.name} id={category.name.toLowerCase().replace(' ', '-')}>
              <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize border-b-4 border-red-500 inline-block">
                  {category.name}
                </h2>
                <p className="text-gray-900 mb-5">{category.description}</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">No posts found in this category.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default PostList;
