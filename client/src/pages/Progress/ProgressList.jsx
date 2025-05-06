import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';
import Navbar from '../../component/Navbar/Navbar';

const AnimatedText = ({ text, className }) => {
  const words = text.split(' ');
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

const ProgressCard = ({ progress, index }) => {
  const placeholderImage =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8KAAAAABJRU5ErkJggg==';

  const mainImage = progress.image
    ? `http://localhost:8080/uploads/${progress.image}`
    : placeholderImage;

  const description =
    progress.description.length > 120
      ? `${progress.description.substring(0, 120)}...`
      : progress.description;

  const createdDate = new Date(progress.createdAt);
  const daysAgo = Math.floor((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
  const metadata = `Status: ${progress.status} • ${
    daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
  }`;

  return (
    <Link
      to={`/progress/${progress.id}`}
      className="flex flex-col bg-white shadow-md rounded-lg overflow-hidden mb-4 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] max-w-3xl mx-auto animate-slideUp border-2 border-transparent hover:border-transparent hover:[box-shadow:0_0_10px_2px_rgba(239,68,68,0.5)]"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="md:w-full overflow-hidden">
        <img
          src={mainImage.includes('base64') ? placeholderImage : mainImage}
          alt={progress.name}
          className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => (e.target.src = placeholderImage)}
        />
      </div>
      <div className="p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            <AnimatedText text={progress.name} className="text-gray-900" />
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            <AnimatedText text={metadata} className="text-gray-500" />
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            <AnimatedText text={description} className="text-gray-600" />
          </p>
          <p className="text-sm text-gray-600">
            <strong>Topic:</strong> {progress.topic}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Tag:</strong> {progress.tag}
          </p>
          {progress.user && (
            <p className="text-sm text-gray-600">
              <strong>Created By:</strong> {progress.user.fullname} ({progress.user.email})
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

const ProgressList = () => {
  const [progressList, setProgressList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get('http://localhost:8080/progress/all');
        setProgressList(response.data);
      } catch (err) {
        setError('Failed to fetch progress data. Please try again later.');
        console.error('Error fetching progress data:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to fetch progress data!'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const filterProgressByCategory = (category) => {
    return progressList.filter(
      (progress) =>
        (progress.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          progress.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          progress.topic.toLowerCase().includes(searchTerm.toLowerCase())) &&
        progress.status.toLowerCase() === category.toLowerCase()
    );
  };

  const categories = [
    { name: 'In Progress', description: 'Tasks currently being worked on.' },
    { name: 'Completed', description: 'Tasks that have been successfully completed.' },
    { name: 'Started', description: 'Tasks that have been initiated.' }
  ];

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

      <div className="relative text-white h-[400px] bg-black">
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col justify-center animate-headerSlide">
            <h1 className="text-4xl md:text-5xl font-bold uppercase text-white mb-4">
              Track Your Progress
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Monitor your tasks, view their status, and stay organized with our intuitive progress tracking system.
            </p>
            <Link
              to="/addprogress"
              className="inline-block bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Add New Progress →
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="relative w-full max-w-md mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search progress..."
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-red-500 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white shadow-sm"
          />
          <div className="absolute inset-y-0 items-center'inf-0 left-0 flex items-center pl-3">
            <Search className="text-gray-500" size={20} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            <AnimatedText text="Welcome to Progress Tracker!" className="text-gray-800" />
          </h2>
          <p className="text-white">
            <AnimatedText
              text="Stay on top of your tasks with real-time updates."
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
              aria-label={`View ${category.name} progress`}
            >
              {category.name}
              <span className="ml-1">▼</span>
            </a>
          ))}
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-purple-900 text-lg">Loading progress...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      ) : (
        categories.map((category) => {
          const filteredProgress = filterProgressByCategory(category.name);
          return (
            <div key={category.name} id={category.name.toLowerCase().replace(' ', '-')}>
              <div className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize border-b-4 border-red-500 inline-block">
                  {category.name}
                </h2>
                <p className="text-gray-900 mb-5">{category.description}</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredProgress.length > 0 ? (
                    filteredProgress.map((progress, index) => (
                      <ProgressCard key={progress.id} progress={progress} index={index} />
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">No progress found in this category.</p>
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

export default ProgressList;