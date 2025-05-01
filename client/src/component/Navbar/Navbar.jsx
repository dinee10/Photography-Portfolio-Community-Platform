import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

// Update the path to your logo file

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed z-50 bg-white rounded-full shadow-lg top-5 left-10 right-10">
      <div className="container flex items-center justify-between p-4 mx-auto">
        {/* Navbar Logo */}
        <div className="text-2xl font-bold">
          
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center space-x-8">
          <Link to="#" className="text-gray-700 hover:text-blue-600 transition duration-300">
            Home
          </Link>
          <Link to="#" className="text-gray-700 hover:text-blue-600 transition duration-300">
            Hotels
          </Link>
          
          <Link to="#" className="text-gray-700 hover:text-blue-900 transition duration-300">
            Tasks
          </Link>
        </div>

        {/* Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login" className="text-blue-900 px-4 py-2 rounded-full hover:bg-gray-300 transition duration-300">
            Sign In
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
        <div className="md:hidden bg-white shadow-md rounded-lg mt-2 p-4 absolute top-16 left-10 right-10 z-50">
          <Link to="#" className="block text-gray-700 py-2 hover:text-blue-600">About</Link>
          <Link to="#" className="block text-gray-700 py-2 hover:text-blue-600">Contact</Link>
          <Link to="#" className="block text-gray-700 py-2 hover:text-blue-600">Blog</Link>
          <Link to="#" className="block text-gray-700 py-2 hover:text-blue-600">Destinations</Link>
          <div className="mt-4">
            <Link to="#" className="block text-blue-600 py-2 hover:bg-gray-300 rounded-lg text-center">Sign In</Link>
            <Link to="/register" className="block bg-blue-600 text-white py-2 mt-2 rounded-lg text-center hover:bg-blue-700">Sign Up</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;