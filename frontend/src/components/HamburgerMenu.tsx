import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface HamburgerMenuProps {
  className?: string;
}

const HamburgerMenu: FC<HamburgerMenuProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className={`fixed top-6 left-6 z-[51] flex flex-col justify-center items-center w-16 h-16 transition-all duration-500 ease-in-out ${className}`}
        aria-label="Toggle menu"
      >
        <span
          className={`block w-12 h-px bg-gray-900 transition-all duration-500 ease-in-out ${
            isOpen
              ? "rotate-45 translate-y-0.5"
              : "-translate-y-3"
          }`}
        />
        <span
          className={`block w-12 h-px bg-gray-900 transition-all duration-500 ease-in-out ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`block w-12 h-px bg-gray-900 transition-all duration-500 ease-in-out ${
            isOpen
              ? "-rotate-45 -translate-y-0.5"
              : "translate-y-3"
          }`}
        />
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out z-30 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-35 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-light tracking-wide text-gray-900">
              {""}
            </h2>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Shop
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/marketplace")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    MARKETPLACE
                  </button>
                  <button
                    onClick={() => handleNavigation("/woman")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    WOMAN
                  </button>
                  <button
                    onClick={() => handleNavigation("/man")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    MAN
                  </button>
                  <button
                    onClick={() => handleNavigation("/kids")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    KIDS
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Collections
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/new")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    THE NEW
                  </button>
                  <button
                    onClick={() => handleNavigation("/bestsellers")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    BEST SELLERS
                  </button>
                  <button
                    onClick={() => handleNavigation("/summer")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    SUMMER GETAWAY
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Connect
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/community")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    COMMUNITY
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                  Products
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavigation("/shirts")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    SHIRTS
                  </button>
                  <button
                    onClick={() => handleNavigation("/trousers")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    TROUSERS
                  </button>
                  <button
                    onClick={() => handleNavigation("/shorts")}
                    className="block text-left text-lg font-light text-gray-900 hover:text-gray-600 transition-colors duration-200"
                  >
                    SHORTS
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-8 border-t border-gray-100">
                          <div className="space-y-3">
                <button
                  onClick={() => handleNavigation("/search")}
                  className="block text-left text-sm font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Search
                </button>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="block text-left text-sm font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigation("/help")}
                  className="block text-left text-sm font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
                >
                  Help
                </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;