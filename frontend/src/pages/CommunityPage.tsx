import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HamburgerMenu from "@/components/HamburgerMenu";

interface Thread {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  reposts: number;
  avatar: string;
  isLiked: boolean;
  isReposted: boolean;
}

const CommunityPage: FC = () => {
  const navigate = useNavigate();
  const [newThread, setNewThread] = useState("");

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      author: "Sarah Chen",
      handle: "@sarahc_design",
      content: "Just received my OneTee collection and the quality is absolutely incredible! The fabric feels so premium and the fit is perfect. Can't wait to style these for our team photoshoot 📸 #OneTeeFamily",
      timestamp: "2h",
      likes: 24,
      replies: 8,
      reposts: 3,
      avatar: "SC",
      isLiked: false,
      isReposted: false
    },
    {
      id: "2",
      author: "Marcus Rivera",
      handle: "@marcus_qa",
      content: "Behind the scenes at OneTee HQ! Our quality assurance team just finished testing the new sustainable cotton blend. Every thread matters when you're building something that brings people together ✨",
      timestamp: "4h",
      likes: 45,
      replies: 12,
      reposts: 7,
      avatar: "MR",
      isLiked: false,
      isReposted: false
    },
    {
      id: "3",
      author: "Alex Thompson",
      handle: "@alex_founder",
      content: "Thinking about community today. It's amazing how a simple t-shirt can become the foundation for shared experiences, memories, and connections. That's why we do what we do at OneTee 💫",
      timestamp: "6h",
      likes: 89,
      replies: 23,
      reposts: 15,
      avatar: "AT",
      isLiked: false,
      isReposted: false
    },
    {
      id: "4",
      author: "Team Catalyst",
      handle: "@teamcatalyst",
      content: "Our startup just got our custom OneTee shirts and wow! The team unity vibe is real. Nothing like matching premium tees to make you feel like you can conquer the world 🚀 Thank you @onetee_official!",
      timestamp: "8h",
      likes: 56,
      replies: 18,
      reposts: 9,
      avatar: "TC",
      isLiked: false,
      isReposted: false
    },
    {
      id: "5",
      author: "Emma Davis",
      handle: "@emmad_creative",
      content: "The minimalist design philosophy behind OneTee is everything. Sometimes the most powerful statements are made through simplicity. Less is definitely more 🤍",
      timestamp: "12h",
      likes: 67,
      replies: 14,
      reposts: 11,
      avatar: "ED",
      isLiked: false,
      isReposted: false
    },
    {
      id: "6",
      author: "OneTee Official",
      handle: "@onetee_official",
      content: "New sustainable collection dropping next week! 🌱 Made from 100% organic cotton with water-based inks. Pre-orders start Monday. #SustainableFashion #OneTee",
      timestamp: "1d",
      likes: 156,
      replies: 42,
      reposts: 28,
      avatar: "OT",
      isLiked: false,
      isReposted: false
    }
  ]);

  const handlePostThread = () => {
    if (newThread.trim()) {
      const thread: Thread = {
        id: Date.now().toString(),
        author: "You",
        handle: "@you",
        content: newThread,
        timestamp: "now",
        likes: 0,
        replies: 0,
        reposts: 0,
        avatar: "Y",
        isLiked: false,
        isReposted: false
      };
      setThreads([thread, ...threads]);
      setNewThread("");
    }
  };

  const handleLike = (threadId: string) => {
    setThreads(threads.map(thread => 
      thread.id === threadId 
        ? { 
            ...thread, 
            likes: thread.isLiked ? thread.likes - 1 : thread.likes + 1,
            isLiked: !thread.isLiked
          }
        : thread
    ));
  };

  const handleRepost = (threadId: string) => {
    setThreads(threads.map(thread => 
      thread.id === threadId 
        ? { 
            ...thread, 
            reposts: thread.isReposted ? thread.reposts - 1 : thread.reposts + 1,
            isReposted: !thread.isReposted
          }
        : thread
    ));
  };



  return (
    <div className="min-h-screen bg-white">
      {/* Hamburger Menu - Hidden on mobile when bottom nav is present */}
      <div className="lg:block">
        <HamburgerMenu />
      </div>
      
      {/* Navbar */}
      <Navbar />
      
      {/* Twitter-like Layout */}
      <div className="flex max-w-7xl mx-auto pt-16">
        
        {/* Left Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 p-6 border-r border-gray-200 min-h-screen">
          <div className="sticky top-24">
            <h2 className="text-xl font-light text-gray-900 mb-6">OneTee Community</h2>
            
            {/* Navigation */}
            <nav className="space-y-2">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors duration-200 w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-light">Home</span>
              </button>
              <a href="#" className="flex items-center space-x-3 p-3 bg-gray-100 text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="font-light">Community</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="font-light">Explore</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zM12 12h.01" />
                </svg>
                <span className="font-light">Trending</span>
              </a>
            </nav>

            {/* Trending Topics */}
            <div className="mt-8">
              <h3 className="text-lg font-light text-gray-900 mb-4">Trending</h3>
              <div className="space-y-3">
                <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                  <p className="text-sm font-light text-gray-900">#OneTeeFamily</p>
                  <p className="text-xs text-gray-500">2,847 posts</p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                  <p className="text-sm font-light text-gray-900">#SustainableFashion</p>
                  <p className="text-xs text-gray-500">1,234 posts</p>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                  <p className="text-sm font-light text-gray-900">#TeamUnity</p>
                  <p className="text-xs text-gray-500">856 posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 w-full lg:max-w-2xl lg:border-r border-gray-200 min-h-screen">
          {/* Header */}
          <div className="sticky top-16 bg-white/80 backdrop-blur border-b border-gray-200 p-4">
            <div>
              <h1 className="text-xl font-light text-gray-900">Community</h1>
              <p className="text-sm text-gray-500 mt-1 hidden sm:block">Connect with the OneTee family</p>
            </div>
          </div>

          {/* Post Composer */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0">
                Y
              </div>
              <div className="flex-1">
                <textarea
                  value={newThread}
                  onChange={(e) => setNewThread(e.target.value)}
                  placeholder="What's happening in your OneTee journey?"
                  className="w-full p-0 border-none resize-none focus:outline-none text-base sm:text-lg placeholder-gray-500"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-2 sm:space-x-4 text-gray-400">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10" />
                    </svg>
                    <span className="text-xs sm:text-sm">{280 - newThread.length}</span>
                  </div>
                  <button
                    onClick={handlePostThread}
                    disabled={!newThread.trim() || newThread.length > 280}
                    className="px-4 py-2 sm:px-6 bg-gray-900 text-white font-light hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed */}
          <div className="pb-20 lg:pb-0">
            {threads.map((thread, index) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50/50 transition-colors duration-200 cursor-pointer"
              >
                <div className="flex space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0">
                    {thread.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <h3 className="font-light text-gray-900 hover:underline cursor-pointer text-sm sm:text-base truncate">{thread.author}</h3>
                      <span className="text-gray-500 text-xs sm:text-sm truncate">{thread.handle}</span>
                      <span className="text-gray-400 hidden sm:inline">·</span>
                      <span className="text-gray-500 text-xs sm:text-sm">{thread.timestamp}</span>
                    </div>
                    <p className="text-gray-900 mt-1 leading-normal text-sm sm:text-base">
                      {thread.content}
                    </p>
                    <div className="flex items-center justify-between max-w-xs sm:max-w-md mt-3">
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200 group">
                        <div className="p-1 sm:p-2 group-hover:bg-blue-50">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.replies}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleRepost(thread.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 group ${
                          thread.isReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'
                        }`}
                      >
                        <div className="p-1 sm:p-2 group-hover:bg-green-50">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.reposts}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleLike(thread.id)}
                        className={`flex items-center space-x-1 transition-colors duration-200 group ${
                          thread.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <div className="p-1 sm:p-2 group-hover:bg-red-50">
                          <svg className={`w-3 h-3 sm:w-4 sm:h-4 ${thread.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-xs sm:text-sm">{thread.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 group">
                        <div className="p-1 sm:p-2 group-hover:bg-gray-50">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden xl:block w-80 p-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Who to Follow */}
            <div className="bg-gray-50 p-4">
              <h3 className="text-xl font-light text-gray-900 mb-4">Who to follow</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-light">
                      OT
                    </div>
                    <div>
                      <p className="font-light text-gray-900">OneTee Official</p>
                      <p className="text-sm text-gray-500">@onetee_official</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition-colors duration-200">
                    Follow
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-light">
                      SF
                    </div>
                    <div>
                      <p className="font-light text-gray-900">Sustainable Fashion</p>
                      <p className="text-sm text-gray-500">@sustainablefashion</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white font-light hover:bg-gray-800 transition-colors duration-200">
                    Follow
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-50 p-4">
              <h3 className="text-xl font-light text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-light">Sarah Chen</span> liked your post about sustainable fashion
                </p>
                <p className="text-gray-600">
                  <span className="font-light">Marcus Rivera</span> started following you
                </p>
                <p className="text-gray-600">
                  <span className="font-light">OneTee Official</span> mentioned you in a post
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Twitter-like */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button 
            onClick={() => navigate("/")}
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
            onClick={() => navigate("/marketplace")}
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


    </div>
  );
};

export default CommunityPage;