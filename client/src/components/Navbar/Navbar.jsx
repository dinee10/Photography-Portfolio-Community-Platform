import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-black shadow-md">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Navbar Text (replacing logo) */}
        <div className="text-2xl font-bold">
          <Link to="/user-blog" className="text-red-500 hover:text-red-100 transition duration-300">
            THEClicK
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center space-x-6">
          <div className="relative group">
            <Link to="/features" className="text-red-500 hover:text-red-100 transition duration-300 flex items-center">
              Features
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </Link>
            {/* Dropdown placeholder (not functional) */}
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md mt-2 p-2">
              <Link to="/features/sub1" className="block px-4 py-2 text-red-700 hover:bg-gray-100">Sub Feature 1</Link>
              <Link to="/features/sub2" className="block px-4 py-2 text-red-700 hover:bg-gray-100">Sub Feature 2</Link>
            </div>
          </div>
          <div className="relative group">
            <Link to="/channels" className="text-red-500 hover:text-red-100 transition duration-300 flex items-center">
              Channels
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </Link>
            {/* Dropdown placeholder (not functional) */}
            <div className="absolute hidden group-hover:block bg-white shadow-md rounded-md mt-2 p-2">
              <Link to="/channels/sub1" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sub Channel 1</Link>
              <Link to="/channels/sub2" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sub Channel 2</Link>
            </div>
          </div>
          <Link to="/pricing" className="text-red-500 hover:text-red-100 transition duration-300">
            Pricing
          </Link>
          <Link to="/blog" className="text-red-500 hover:text-red-100 transition duration-300">
            Blog
          </Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-gray-100 hover:text-red-600 transition duration-300">
            Log in
          </Link>
          <Link to="/signup" className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-700 transition duration-300">
            Get started now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-md p-4">
          <Link to="/features" className="block text-gray-900 py-2 hover:text-red-600">Features</Link>
          <Link to="/channels" className="block text-gray-900 py-2 hover:text-red-600">Channels</Link>
          <Link to="/pricing" className="block text-gray-900 py-2 hover:text-red-600">Pricing</Link>
          <Link to="/blog" className="block text-gray-900 py-2 hover:text-red-600">Blog</Link>
          <div className="mt-4">
            <Link to="/login" className="block text-gray-900 py-2 hover:bg-gray-300 rounded-lg text-center">Log in</Link>
            <Link to="/signup" className="block bg-red-600 text-white py-2 mt-2 rounded-lg text-center hover:bg-red-700">Get started now</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;