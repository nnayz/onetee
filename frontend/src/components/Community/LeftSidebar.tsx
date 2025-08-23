import type { FC } from "react";
import type { TrendingTag } from "@/types/community.types";

interface LeftSidebarProps {
  trendingTags: TrendingTag[];
  selectedTag: string | null;
  onTagSelect: (tag: string) => void;
}

const LeftSidebar: FC<LeftSidebarProps> = ({ trendingTags, onTagSelect }) => {
  return (
    <div className="hidden lg:block w-64 p-6 border-r border-gray-200 min-h-screen">
      <div className="sticky top-24">
        
        {/* Navigation - only Community */}
        <nav className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-100 text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-light">Community</span>
          </div>
        </nav>

        {/* Trending Topics - live */}
        <div className="mt-8">
          <h3 className="text-lg font-light text-gray-900 mb-4">Trending</h3>
          <div className="space-y-3">
            {Array.isArray(trendingTags) && trendingTags.map((t) => (
              <div key={t.tag} className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200" onClick={() => onTagSelect(t.tag)}>
                <p className="text-sm font-light text-gray-900">#{t.tag}</p>
                		<p className="text-xs text-gray-500">{t.count} threads</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar; 