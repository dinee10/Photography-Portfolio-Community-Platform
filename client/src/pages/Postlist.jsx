import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Play, ChevronLeft } from "lucide-react";

const PostCard = ({ post, index }) => {
  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==";

  const imageUrl = post.image 
    ? `http://localhost:8080/post/image/${post.image}`
    : placeholderImage;

  const postedDate = new Date(post.createdAt || Date.now());
  const daysAgo = Math.floor((Date.now() - postedDate) / (1000 * 60 * 60 * 24));
  const metadata = `by ${post.author || 'Unknown'} in ${post.status || 'wildphotography'} • ${daysAgo} days ago`;

  return (
    <div
      className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] animate-slideUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={post.name}
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
          loading="lazy"
          onError={(e) => (e.target.src = placeholderImage)}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-1">
          {post.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {metadata}
        </p>
        <p className="text-gray-700 mb-3 line-clamp-3 flex-grow">
          {post.description}
        </p>
        <div className="mt-auto">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300 w-full"
          >
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

const PostDetail = ({ post, onBack }) => {
  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==";

  const imageUrl = post.image 
    ? `http://localhost:8080/post/image/${post.image}`
    : placeholderImage;

  const postedDate = new Date(post.createdAt || Date.now());
  const formattedDate = postedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
              alt={post.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = placeholderImage)}
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-2">
                {post.status || 'General'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                {post.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center text-gray-500 text-sm mb-6">
            <span>Posted by {post.author || 'Unknown'} on {formattedDate}</span>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {post.description}
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

const VideoHeader = () => {
  return (
    <div className="relative h-[500px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-black/20">
        <div className="text-center px-4 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Explore Community Creations
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover amazing content shared by our creative community members
          </p>
          <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-full flex items-center mx-auto">
            <Play className="mr-2" size={20} />
            Watch Showreel
          </button>
        </div>
      </div>
      <img
        src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        alt="Community creations"
        className="w-full h-full object-cover opacity-70"
      />
    </div>
  );
};

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8080/post');
        setPosts(response.data);
      } catch (err) {
        setError("Failed to fetch posts. Please try again later.");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // If there's an ID in the URL, show the single post view
  if (id) {
    const post = posts.find(p => p.id == id);
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
      <PostDetail 
        post={post} 
        onBack={() => navigate('/')}
      />
    );
  }

  // Default view - list of all posts
  return (
    <div className="bg-gray-50">
      <VideoHeader />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Community Posts
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore the latest posts from our community members. Discover insights, share your thoughts, and connect with others.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No posts available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <Link to={`/post/${post.id}`} key={post.id} className="no-underline">
                <PostCard 
                  post={post} 
                  index={index} 
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;