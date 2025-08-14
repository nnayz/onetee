import type { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-inherit backdrop-blur border-none border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-extralight text-gray-900 tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>OneTee</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a 
            href="#" 
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/' || location.pathname === '' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Home
          </a>
          <a 
            href="#" 
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/marketplace' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Marketplace
          </a>
          <a 
            href="#" 
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/about' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            About Us
          </a>
          <button
            type="button"
            aria-label="Search"
            onClick={() => navigate("/search")}
            className={`text-left bg-transparent hover:opacity-80 focus:outline-none text-sm px-0 py-1 w-24 md:w-28 font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/search' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-900 border-b border-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Search
          </button>
          <a 
            href="#" 
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/login' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Log In
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

