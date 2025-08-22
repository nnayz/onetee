import type { FC } from "react";

interface MobileNavigationProps {
  onNavigateHome: () => void;
  onNavigateMarketplace: () => void;
}

const MobileNavigation: FC<MobileNavigationProps> = ({
  onNavigateHome,
  onNavigateMarketplace
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-2">
        <button 
          onClick={onNavigateHome}
          className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-light">Home</span>
        </button>
        
        <button className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200">
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs font-light">Explore</span>
        </button>
        
        <button className="flex flex-col items-center py-2 px-4 text-gray-900 transition-colors duration-200">
          <svg className="w-6 h-6 mb-1" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-xs font-light">Community</span>
        </button>
        
        <button 
          onClick={onNavigateMarketplace}
          className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs font-light">Shop</span>
        </button>
        
        <button className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 transition-colors duration-200">
          <div className="w-6 h-6 bg-gray-300 mb-1 flex items-center justify-center">
            <span className="text-xs font-light text-gray-700">Y</span>
          </div>
          <span className="text-xs font-light">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default MobileNavigation; 