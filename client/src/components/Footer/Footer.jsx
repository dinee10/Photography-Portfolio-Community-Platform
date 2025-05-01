import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail } from "lucide-react";
import Logo from "../../assets/Dinitha/logo3.png"; // Import the logo (adjust path as needed)

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Hotels in Sri Lanka Section (left) */}
        <div className="order-1">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            
            <img
              src={Logo}
              alt="Travel Sync Logo"
              className="inline-block ml-2 h-14 w-30" // Adjust size as needed
            />
          </h3>
          <p className="text-sm mb-4">
            Hotels in Sri Lanka is not just another booking engine, but this was
            created to promote Sri Lankan tourism to the Whole World. The ultimate goal
            of us is to reveal the hidden beauty of Sri Lanka, and to make your
            vacation an unforgettable one.
          </p>
          <div className="flex space-x-4">
            <a href="https://facebook.com" className="text-pink-600 hover:text-teal-200 transition duration-300">
              <Facebook size={20} />
            </a>
            <a href="https://instagram.com" className="text-pink-600 hover:text-teal-200 transition duration-300">
              <Instagram size={20} />
            </a>
            <a href="https://twitter.com" className="text-pink-600 hover:text-teal-200 transition duration-300">
              <Twitter size={20} />
            </a>
            <a href="https://youtube.com" className="text-pink-600 hover:text-teal-200 transition duration-300">
              <Youtube size={20} />
            </a>
          </div>
          <div className="mt-4 text-sm">
            <p className="flex items-center">
              <Phone size={16} className="mr-2" />
              (+94) 77 726 3704
            </p>
            <p className="flex items-center mt-2">
              <Mail size={16} className="mr-2" />
              <a href="mailto:hotelsinsrilanka.lk" className="hover:text-teal-200">
                travelsync.lk
              </a>
            </p>
            <p className="mt-2">
              <span className="font-semibold">WhatsApp:</span>{" "}
              <a href="tel:(+94) 77 726 3704" className="hover:text-teal-200">
                (+94) 77 726 3704
              </a>
            </p>
            <p className="mt-2">
              <span className="font-semibold">Email:</span>{" "}
              <a href="mailto:getlisted@hotelsinsrilanka.lk" className="hover:text-teal-200">
                getlisted@travelsync.lk
              </a>
            </p>
          </div>
        </div>

        {/* Quick Links Section (right, top) */}
        <div className="order-2">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="text-sm space-y-2">
            <li><Link to="/about-us" className="hover:text-teal-200">About Us</Link></li>
            <li><Link to="/contact-us" className="hover:text-teal-200">Contact Us</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-teal-200">Terms & Conditions</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-teal-200">Privacy Policy</Link></li>
            <li><Link to="/list-your-property" className="hover:text-teal-200">List Your Property</Link></li>
          </ul>
        </div>
      </div>

      {/* Booking Holdings Section (below main sections) */}
      <div className="container mx-auto mt-8 border-t border-teal-600 pt-4 px-4">
        <p className="text-sm text-teal-200 mb-4">
          Booking.com is part of Booking Holdings Inc., the world leader in online travel and related services.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="https://booking.com" className="text-green-600 font-semibold hover:text-teal-200">
            Booking.com
          </a>
          <a href="https://priceline.com" className="text-white font-semibold hover:text-teal-200">
            priceline
          </a>
          <a href="https://kayak.com" className="text-red-600 font-semibold hover:text-teal-200">
            KAYAK
          </a>
          <a href="https://agoda.com" className="text-blue-600 font-semibold hover:text-teal-200">
            agoda
          </a>
          <a href="https://opentable.com" className="text-yellow-500 font-semibold hover:text-teal-200">
            OpenTable
          </a>
        </div>
      </div>

      {/* Copyright and Developer Section */}
      <div className="container mx-auto mt-4 border-t border-teal-600 pt-4 flex flex-col md:flex-row justify-between items-center px-4">
        <p className="text-sm text-teal-200">
          Copyrights © 2025. Hotels In Sri Lanka, All Rights Reserved.
        </p>
        <p className="text-sm text-teal-200 mt-2 md:mt-0">
          Web Design & Development by tsync Solutions
        </p>
      </div>
    </footer>
  );
};

export default Footer; // Only one export default is needed