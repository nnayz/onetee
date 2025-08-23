import type { FC } from "react";
import type { ActivityItem } from "@/types/community.types";

interface RightSidebarProps {
  activityItems: ActivityItem[];
  isAuthenticated: boolean;
}

const RightSidebar: FC<RightSidebarProps> = ({ activityItems, isAuthenticated }) => {
  return (
    <div className="hidden lg:block w-80 p-6">
      <div className="sticky top-24 space-y-6">
        
        {/* Recent Activity - live */}
        {isAuthenticated && (
          <div className="bg-gray-50 p-4">
            <h3 className="text-xl font-light text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3 text-sm">
              {(activityItems || []).map((n) => (
                <div key={n.id} className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 flex items-center justify-center text-xs font-light text-gray-700 flex-shrink-0 overflow-hidden rounded-full">
                    {n.actor?.avatar_url ? (
                      <img 
                        src={n.actor.avatar_url} 
                        alt={`${n.actor.display_name || n.actor.username} avatar`} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center text-xs font-light text-gray-700 ${n.actor?.avatar_url ? 'hidden' : ''}`}>
                      {(n.actor?.display_name || n.actor?.username || '?').slice(0, 1).toUpperCase()}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    		<span className="font-light">{n.actor?.display_name || n.actor?.username}</span> {n.type}{n.thread_id ? ' your thread' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RightSidebar; 