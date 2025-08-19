import type { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo_png.png";
import { useQuery } from "@tanstack/react-query";
import { AuthAPI } from "@/lib/api/auth";

const Navbar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const meQuery = useQuery({ queryKey: ["auth","me"], queryFn: AuthAPI.me, retry: false });
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-inherit hover:bg-white border-none border-gray-200 pt-5">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-8">
          <img 
            src={logo} 
            alt="OneTee" 
            className="h-30 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={() => navigate('/')}
          />
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/' || location.pathname === '' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/marketplace")}
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/marketplace' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Marketplace
          </button>
          <button
            onClick={() => navigate("/community")}
            className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
              location.pathname === '/community' 
                ? 'text-gray-900 border-b border-gray-900' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Community
          </button>
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
          {meQuery.data ? (
            <button
              onClick={() => navigate(`/u/${meQuery.data.username}`)}
              className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
                location.pathname.startsWith('/u/') 
                  ? 'text-gray-900 border-b border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {meQuery.data.username}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className={`text-sm font-light tracking-wide relative pb-1 transition-colors duration-200 ${
                location.pathname === '/login' 
                  ? 'text-gray-900 border-b border-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

