import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Mail, Instagram, Youtube, Rss } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Top Section: Logo, Navigation Links, and Social Icons */}
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo */}
        <h3 className="text-3xl font-bold mb-4 md:mb-0">
          The<span className="text-red-500">Click</span>
        </h3>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-4 text-sm mb-4 md:mb-0">
          <Link to="/contact" className="hover:text-red-500 transition duration-300">
            Contact
          </Link>
          <Link to="/tip-us" className="hover:text-red-500 transition duration-300">
            Tip Us
          </Link>
          <Link to="/community-guidelines" className="hover:text-red-500 transition duration-300">
            Community Guidelines
          </Link>
          <Link to="/about" className="hover:text-red-500 transition duration-300">
            About
          </Link>
          <Link to="/ethics-statement" className="hover:text-red-500 transition duration-300">
            Ethics Statement
          </Link>
          <Link to="/how-we-rate" className="hover:text-red-500 transition duration-300">
            How We Rate and Review Products
          </Link>
        </nav>

        {/* Social Media Icons */}
        <div className="flex space-x-4">
          <a href="https://facebook.com" className="text-red-500 hover:text-teal-200 transition duration-300">
            <Facebook size={20} />
          </a>
          <a href="mailto:example@theverge.com" className="text-red-500 hover:text-teal-200 transition duration-300">
            <Mail size={20} />
          </a>
          <a href="https://instagram.com" className="text-red-500 hover:text-teal-200 transition duration-300">
            <Instagram size={20} />
          </a>
          <a href="https://youtube.com" className="text-red-500 hover:text-teal-200 transition duration-300">
            <Youtube size={20} />
          </a>
          <a href="/rss" className="text-red-500 hover:text-teal-200 transition duration-300">
            <Rss size={20} />
          </a>
        </div>
      </div>

      {/* Subscription Section */}
      <div className="bg-red-500 text-black py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-lg font-semibold mb-4 md:mb-0 text-center md:text-left">
            Don’t miss the big ones. Subscribe for full access to our reviews, scoop, and analysis.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;