import type { FC } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo_png.png";

const Footer: FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="relative z-10 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-8 lg:px-16 py-16">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Section */}
          <div className="space-y-6">
            <img 
              src={logo} 
              alt="OneTee" 
              className="h-8 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
              onClick={() => navigate('/')}
            />
            <p className="text-gray-600 font-light leading-relaxed max-w-xs">
              Premium quality t-shirts that bring teams together. Crafted with care, designed for unity.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Shop</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/woman")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Women
              </button>
              <button 
                onClick={() => navigate("/man")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Men
              </button>
              <button 
                onClick={() => navigate("/kids")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Kids
              </button>
              <button 
                onClick={() => navigate("/new")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                New Arrivals
              </button>
              <button 
                onClick={() => navigate("/bestsellers")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Best Sellers
              </button>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Company</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/about")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                About Us
              </button>
              <button 
                onClick={() => navigate("/careers")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Careers
              </button>
              <button 
                onClick={() => navigate("/sustainability")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Sustainability
              </button>
              <button 
                onClick={() => navigate("/press")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Press
              </button>
            </div>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Support</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/help")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Help Center
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Contact Us
              </button>
              <button 
                onClick={() => navigate("/returns")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Returns & Exchanges
              </button>
              <button 
                onClick={() => navigate("/shipping")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Shipping Info
              </button>
              <button 
                onClick={() => navigate("/size-guide")}
                className="block text-gray-600 font-light hover:text-gray-900 transition-colors duration-200"
              >
                Size Guide
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-200 pt-12 mb-12">
          <div className="max-w-md">
            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
              Stay Connected
            </h3>
            <p className="text-gray-600 font-light mb-6">
              Get the latest updates on new collections and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-200 focus:outline-none focus:border-gray-400 transition-colors duration-200 font-light"
              />
              <button className="px-6 py-3 bg-gray-900 text-white font-light tracking-wide hover:bg-gray-800 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-500 font-light text-sm">
                © 2024 OneTee. All rights reserved.
              </p>
              <div className="flex space-x-6">
                <button 
                  onClick={() => navigate("/privacy")}
                  className="text-gray-500 font-light text-sm hover:text-gray-700 transition-colors duration-200"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigate("/terms")}
                  className="text-gray-500 font-light text-sm hover:text-gray-700 transition-colors duration-200"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => navigate("/cookies")}
                  className="text-gray-500 font-light text-sm hover:text-gray-700 transition-colors duration-200"
                >
                  Cookie Policy
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 font-light text-sm">Secure payments with</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">VISA</span>
                </div>
                <div className="w-8 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">MC</span>
                </div>
                <div className="w-8 h-5 bg-gray-200 rounded-sm flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;