import React, { useState, useEffect } from "react";
import { Play, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import image1 from "../../assets/Dinitha/me.jpg"; // Author image

// Component to animate individual words with spacing
const AnimatedText = ({ text, className }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block animate-slideInWord mr-1.5"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
};

// BlogCard Component (Used for AI Section)
const BlogCard = ({ blog, index }) => {
  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==";

  const mainImage = blog.image
    ? `http://localhost:8080/blog/uploads/${blog.image}`
    : placeholderImage;

  const description =
    blog.content.length > 120 ? `${blog.content.substring(0, 120)}...` : blog.content;

  const postedDate = new Date(blog.createdAt || Date.now());
  const daysAgo = Math.floor((Date.now() - postedDate) / (1000 * 60 * 60 * 24));
  const metadata = `by ${blog.author || "Unknown Author"} in ${blog.category} • ${
    daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`
  }`;

  return (
    <Link
      to={`/blog/${blog.id}`}
      className="flex flex-col md:flex-row bg-white shadow-md rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] max-w-3xl mx-auto animate-slideUp border-2 border-transparent hover:border-transparent hover:[box-shadow:0_0_10px_2px_rgba(239,68,68,0.5)]"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="md:w-1/2 overflow-hidden">
        <img
          src={mainImage.includes("base64") ? placeholderImage : mainImage}
          alt={blog.title}
          className="w-full h-48 md:h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => (e.target.src = placeholderImage)}
        />
      </div>
      <div className="md:w-1/2 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            <AnimatedText text={blog.title} className="text-gray-900" />
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            <AnimatedText text={metadata} className="text-gray-500" />
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <AnimatedText text={description} className="text-gray-600" />
          </p>
        </div>
        <div className="text-red-500 text-sm font-medium flex items-center gap-1 hover:text-red-700 transition duration-300">
          <AnimatedText text="Keep reading" className="text-red-500" />
          <span className="text-red-500">→</span>
        </div>
      </div>
    </Link>
  );
};

// CategoryBlogCard Component (Used for Non-AI Sections)
const CategoryBlogCard = ({ blog, index }) => {
  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==";

  const mainImage = blog.image
    ? `http://localhost:8080/blog/uploads/${blog.image}`
    : placeholderImage;

  const description =
    blog.content.length > 120 ? `${blog.content.substring(0, 120)}...` : blog.content;

  const postedDate = new Date(blog.createdAt || Date.now());
  const daysAgo = Math.floor((Date.now() - postedDate) / (1000 * 60 * 60 * 24));
  const metadata = `by ${blog.author || "Unknown Author"} in ${blog.category} • ${
    daysAgo === 0 ? "Today" : `${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`
  }`;

  return (
    <Link
      to={`/blog/${blog.id}`}
      className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-2 border-transparent hover:border-red-200"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={mainImage.includes("base64") ? placeholderImage : mainImage}
          alt={blog.title}
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
          loading="lazy"
          onError={(e) => (e.target.src = placeholderImage)}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
          <span className="text-white text-lg font-semibold">View Post</span>
        </div>
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">
          <AnimatedText text={blog.title} className="text-gray-800" />
        </h3>
        <p className="text-sm text-gray-500 mb-3 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
          <AnimatedText text={metadata} className="text-gray-500" />
        </p>
        <p className="text-base text-gray-700 leading-relaxed mb-4 line-clamp-3">
          <AnimatedText text={description} className="text-gray-700" />
        </p>
        <button className="mt-auto bg-red-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-600 transition duration-300 transform hover:scale-105">
          Read More
        </button>
      </div>
    </Link>
  );
};

export default function UserBlog() {
  const [blogs, setBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0);
  const [foodDirection, setFoodDirection] = useState('right');

  const placeholderImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==";

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/blog");
        setBlogs(response.data);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Auto-rotate food carousel
  useEffect(() => {
    const foodBlogs = filterBlogsByCategory("Foods");
    if (foodBlogs.length > 1) {
      const interval = setInterval(() => {
        setFoodDirection('right');
        setCurrentFoodIndex(prev => (prev + 1) % foodBlogs.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [blogs, currentFoodIndex]);

  const filterBlogsByCategory = (category) => {
    return blogs.filter(
      (blog) =>
        (blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          blog.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
        blog.category.toLowerCase() === category.toLowerCase()
    );
  };

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const nextFoodSlide = () => {
    setFoodDirection('right');
    setCurrentFoodIndex(prev => (prev + 1) % filterBlogsByCategory("Foods").length);
  };

  const prevFoodSlide = () => {
    setFoodDirection('left');
    setCurrentFoodIndex(prev => (prev - 1 + filterBlogsByCategory("Foods").length) % filterBlogsByCategory("Foods").length);
  };

  const categories = [
    { name: "AI", description: "Explore the latest trends and innovations in artificial intelligence." },
    { name: "Wildphotography", description: "Capture the beauty of nature through stunning wildlife photography." },
    { name: "Fashion", description: "Discover the latest fashion trends and styles." },
    { name: "Foods", description: "Dive into the world of culinary arts and delicious recipes." },
  ];

  return (
    <>
      <style>
        {`
          @keyframes fadeInSlideUp {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeInSlideUp {
            animation: fadeInSlideUp 0.8s ease-out forwards;
          }
        `}
      </style>
      <div className="bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="relative text-white h-[600px] bg-black">
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-headerSlide">
              <div className="flex flex-col justify-center">
                <p className="text-sm uppercase text-gray-300 mb-2" style={{ animationDelay: "0s" }}>
                  Designed & Built for
                </p>
                <h1 className="text-4xl md:text-5xl font-bold uppercase text-white mb-4" style={{ animationDelay: "0.2s" }}>
                  Photography Enthusiasts
                </h1>
                <p className="text-lg text-gray-300 mb-6" style={{ animationDelay: "0.4s" }}>
                  Designed with creativity in mind, our platform is ideal for showcasing your photography journey. Explore the latest trends and share your unique perspective effortlessly. Create a stunning portfolio with ease.
                </p>
                <Link
                  to="/user-blog"
                  className="inline-block bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
                  style={{ animationDelay: "0.6s" }}
                >
                  Get Started →
                </Link>
              </div>
              <div className="flex items-center">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {blogs.slice(0, 4).map((blog, index) => (
                    <Link to={`/blog/${blog.id}`} key={index}>
                      <img
                        src={
                          blog.image
                            ? `http://localhost:8080/blog/uploads/${blog.image}`
                            : placeholderImage
                        }
                        alt={blog.title}
                        className="w-full h-32 md:h-48 object-cover border border-gray-900 animate-zoomIn"
                        loading="lazy"
                        onError={(e) => (e.target.src = placeholderImage)}
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                    </Link>
                  ))}
                  {blogs.length < 4 &&
                    Array(4 - blogs.length)
                      .fill()
                      .map((_, index) => (
                        <img
                          key={`placeholder-${index}`}
                          src={placeholderImage}
                          alt="Placeholder"
                          className="w-full h-32 md:h-48 object-cover opacity-50 border border-gray-600"
                        />
                      ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="relative w-full max-w-md mx-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
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
              <AnimatedText text="Welcome to ClickBlog!" className="text-gray-800" />
            </h2>
            <p className="text-white">
              <AnimatedText
                text="Discover the latest trends in AI, Wildlife Photography, Fashion, and Food."
                className="text-white"
              />
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 bg-black text-white rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">My Journey</h2>
              <p className="text-white leading-relaxed mb-6 animate-fadeInSlideUp" style={{ animationDelay: "0.3s" }}>
                I'm Dinidu, a photography enthusiast who believes every photo tells a story. Over the years, 
                I've explored everything from urban streets to remote landscapes, always searching for unique moments to capture.
                <br /><br />
                This blog is my creative space where I share photography tips, editing techniques, gear insights,
                and personal experiences from behind the lens. 
                Whether you're just starting out or refining your craft, 
                I hope my journey and content inspire you to see beauty in everyday moments.
              </p>
              <Link
                to="https://www.instagram.com/__dinidu____/"
                className="inline-block bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 transition duration-300 shadow-md hover:shadow-lg"
              >
                Hire Me
              </Link>
            </div>
            <div>
              <img
                src={image1}
                alt="Portrait of the author"
                width="600"
                height="384"
                className="w-full h-96 object-cover rounded-lg shadow-md border border-black"
                loading="lazy"
                onError={(e) => (e.target.src = placeholderImage)}
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="border-t border-b border-gray-900 flex items-center justify-center py-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Video Creator</h2>
          </div>
          {blogs.length >= 5 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 border-b border-gray-300 inline-block">
                  Featured Contributors
                </h3>
                <Link to={`/blog/${blogs[2].id}`} className="block">
                  <div className="relative">
                    <img
                      src={
                        blogs[2].image
                          ? `http://localhost:8080/blog/uploads/${blogs[2].image}`
                          : placeholderImage
                      }
                      alt={blogs[2].title}
                      className="w-full h-40 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => (e.target.src = placeholderImage)}
                    />
                    <div className="absolute top-2 left-2">
                      <Play className="text-white bg-red-500 rounded-full p-1" size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-3">{blogs[2].title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {blogs[2].content.length > 100 ? `${blogs[2].content.substring(0, 100)}...` : blogs[2].content}
                  </p>
                  <p className="text-xs text-blue-500 mt-2">By: {blogs[2].author || "Unknown Author"}</p>
                </Link>
              </div>
              <div>
                <Link to={`/blog/${blogs[3].id}`} className="block">
                  <div className="relative">
                    <img
                      src={
                        blogs[3].image
                          ? `http://localhost:8080/blog/uploads/${blogs[3].image}`
                          : placeholderImage
                      }
                      alt={blogs[3].title}
                      className="w-full h-64 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => (e.target.src = placeholderImage)}
                    />
                    <div className="absolute top-2 right-2">
                      <Play className="text-white bg-red-500 rounded-full p-1" size={24} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="text-white bg-black/50 rounded-full p-4" size={48} />
                    </div>
                  </div>
                </Link>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 border-b border-gray-300 inline-block">
                  Audio & Sound
                </h3>
                <Link to={`/blog/${blogs[4].id}`} className="block">
                  <div className="relative">
                    <img
                      src={
                        blogs[4].image
                          ? `http://localhost:8080/blog/uploads/${blogs[4].image}`
                          : placeholderImage
                      }
                      alt={blogs[4].title}
                      className="w-full h-40 object-cover rounded-lg"
                      loading="lazy"
                      onError={(e) => (e.target.src = placeholderImage)}
                    />
                    <div className="absolute top-2 right-2">
                      <Play className="text-white bg-red-500 rounded-full p-1" size={24} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mt-3">{blogs[4].title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {blogs[4].content.length > 100 ? `${blogs[4].content.substring(0, 100)}...` : blogs[4].content}
                  </p>
                  <p className="text-xs text-blue-500 mt-2">By: {blogs[4].author || "Unknown Author"}</p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              Not enough blogs to display this section. Please add more blogs.
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-4 bg-red-500 border-b border-gray-200">
          <nav className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={`#${category.name.toLowerCase()}`}
                className="text-gray-100 hover:text-gray-800 font-medium text-sm uppercase flex items-center"
                aria-label={`View ${category.name} blogs`}
              >
                {category.name}
                <span className="ml-1">▼</span>
              </a>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-purple-900 text-lg">Loading blogs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        ) : (
          categories.map((category) => {
            const filteredBlogs = filterBlogsByCategory(category.name);
            const isExpanded = expandedCategories[category.name] || false;
            const displayedBlogs = isExpanded ? filteredBlogs : filteredBlogs.slice(0, category.name === "AI" ? 4 : category.name === "Foods" ? 3 : 4);

            return (
              <div key={category.name} id={category.name.toLowerCase()}>
                <div className="container mx-auto px-4 py-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize border-b-4 border-red-500 inline-block">
                    {category.name}
                  </h2>
                  <p className="text-gray-900 mb-5">{category.description}</p>

                  {category.name === "Fashion" ? (
                    <div className="bg-gradient-to-r from-gray-900 to-gray-900 rounded-lg shadow-lg border border-white">
                      <div className="grid grid-cols-1">
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                            {filteredBlogs.slice(0, 4).map((blog, index) => (
                              <Link to={`/blog/${blog.id}`} key={index}>
                                <div className="relative group">
                                  <img
                                    src={
                                      blog.image
                                        ? `http://localhost:8080/blog/uploads/${blog.image}`
                                        : placeholderImage
                                    }
                                    alt={blog.title}
                                    className="w-full h-48 md:h-64 object-cover rounded-none border border-gray-900 group-hover:scale-105 group-hover:brightness-110 transition-all duration-300 animate-fadeIn"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = placeholderImage)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                  />
                                </div>
                              </Link>
                            ))}
                            {filteredBlogs.length < 4 &&
                              Array(4 - filteredBlogs.length)
                                .fill()
                                .map((_, index) => (
                                  <img
                                    key={`placeholder-${index}`}
                                    src={placeholderImage}
                                    alt="Placeholder"
                                    className="w-full h-48 md:h-64 object-cover rounded-none opacity-50 border border-gray-600"
                                  />
                                ))}
                          </div>
                          <div className="text-center py-4">
                            <h3 className="text-lg font-bold text-red-500 mb-1 [text-shadow:_0_1px_2px_rgb(0_0_0_/_40%)]">
                              Fashion Highlights
                            </h3>
                            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-pink-500 mb-3 rounded-full mx-auto"></div>
                            <p className="text-sm text-white">
                              Discover the latest trends and styles in the world of fashion.{" "}
                              <Link to="/category/fashion" className="text-red-600 hover:underline">
                                Explore more.
                              </Link>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : category.name === "Foods" ? (
                    <div className="relative">
                      {filteredBlogs.length > 1 && (
                        <>
                          <button 
                            onClick={prevFoodSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transform -translate-x-4 hover:scale-110 transition-all"
                            aria-label="Previous food blog"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <button 
                            onClick={nextFoodSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transform translate-x-4 hover:scale-110 transition-all"
                            aria-label="Next food blog"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}

                      <div className="overflow-hidden relative h-[500px] rounded-xl shadow-lg bg-black/50">
                        {filteredBlogs.length > 0 ? (
                          filteredBlogs.map((blog, index) => (
                            <div
                              key={blog.id}
                              className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentFoodIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                              style={{
                                transform: `translateX(${
                                  index === currentFoodIndex 
                                    ? 0 
                                    : index < currentFoodIndex 
                                      ? (foodDirection === 'right' ? '-100%' : '100%')
                                      : (foodDirection === 'right' ? '100%' : '-100%')
                                })`
                              }}
                            >
                              <div className="flex flex-col md:flex-row h-full">
                                <div className="md:w-1/2 h-full overflow-hidden">
                                  <img
                                    src={
                                      blog.image
                                        ? `http://localhost:8080/blog/uploads/${blog.image}`
                                        : placeholderImage
                                    }
                                    alt={blog.title}
                                    className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                                    loading="lazy"
                                    onError={(e) => (e.target.src = placeholderImage)}
                                  />
                                </div>
                                <div className="md:w-1/2 p-8 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                                  <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                    {blog.title}
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-4">
                                    by {blog.author || "Unknown Author"} • {new Date(blog.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-gray-700 mb-6 line-clamp-4">
                                    {blog.content.length > 300 ? `${blog.content.substring(0, 300)}...` : blog.content}
                                  </p>
                                  <Link
                                    to={`/blog/${blog.id}`}
                                    className="inline-block bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 self-start"
                                  >
                                    Read Blog
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">No food blogs found.</p>
                          </div>
                        )}
                      </div>

                      {filteredBlogs.length > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          {filteredBlogs.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                setFoodDirection(index > currentFoodIndex ? 'right' : 'left');
                                setCurrentFoodIndex(index);
                              }}
                              className={`w-3 h-3 rounded-full transition-all ${index === currentFoodIndex ? 'bg-red-500 w-6' : 'bg-gray-300'}`}
                              aria-label={`Go to slide ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={
                        category.name === "AI"
                          ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                          : "grid grid-cols-1 md:grid-cols-4 gap-6"
                      }
                    >
                      {filteredBlogs.length > 0 ? (
                        displayedBlogs.map((blog, index) =>
                          category.name === "AI" ? (
                            <BlogCard key={blog.id} blog={blog} index={index} />
                          ) : (
                            <CategoryBlogCard key={blog.id} blog={blog} index={index} />
                          )
                        )
                      ) : (
                        <p className="text-gray-500 col-span-4">No blogs found in this category.</p>
                      )}
                    </div>
                  )}

                  {category.name !== "Fashion" && category.name !== "Foods" && filteredBlogs.length > 4 && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => toggleCategoryExpansion(category.name)}
                        className="text-red-500 border border-red-700 rounded-full px-6 py-2 text-sm font-medium hover:bg-red-500 hover:text-white transition duration-300"
                      >
                        {isExpanded ? "See Less" : "See More"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        <Footer />
      </div>
    </>
  );
}