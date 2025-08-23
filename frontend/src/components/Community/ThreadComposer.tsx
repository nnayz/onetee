import type { FC } from "react";

interface ThreadComposerProps {
  newThread: string;
  setNewThread: (value: string) => void;
  files: File[];
  setFiles: (files: File[]) => void;
  postError: string | null;
  onPost: () => void;
  isAuthenticated: boolean;
  userAvatar?: string | null;
  username?: string | null;
  isPosting: boolean;
}

const ThreadComposer: FC<ThreadComposerProps> = ({
  newThread,
  setNewThread,
  files,
  setFiles,
  postError,
  onPost,
  isAuthenticated,
  userAvatar,
  username,
  isPosting
}) => {
  return (
    <div className="border-b border-gray-200 px-4 pt-8 pb-2">
      <div className="flex space-x-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 flex items-center justify-center text-sm font-light text-gray-700 flex-shrink-0 overflow-hidden rounded-full">
          {userAvatar ? (
            <img 
              src={userAvatar} 
              alt="Your avatar" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center text-sm font-light text-gray-700 ${userAvatar ? 'hidden' : ''}`}>
            {username ? username.slice(0,2).toUpperCase() : '—'}
          </div>
        </div>
        <div className="flex-1">
          <textarea
            value={newThread}
            onChange={(e) => setNewThread(e.target.value)}
            placeholder="What's happening in your OneTee journey?"
            className="w-full p-0 border-none resize-none focus:outline-none text-sm sm:text-base placeholder-gray-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2 sm:space-x-4 text-gray-400">
              <label className="cursor-pointer hover:text-gray-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files || []);
                    const validFiles = selectedFiles.filter(f => {
                      if (!f.type.startsWith('image/')) {
                        alert('Please select only image files');
                        return false;
                      }
                      if (f.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        return false;
                      }
                      return true;
                    });
                    setFiles(validFiles);
                  }} 
                />
              </label>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 hover:text-gray-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 3v10a2 2 0 002 2h6a2 2 0 002-2V7M7 7h10" />
              </svg>
              <span className="text-xs sm:text-sm">{280 - newThread.length}</span>
            </div>
            <button
              onClick={onPost}
              disabled={(!newThread.trim() && files.length === 0) || newThread.length > 280 || !isAuthenticated || isPosting}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-gray-900 text-white font-light hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 text-sm sm:text-base"
            >
              		{isAuthenticated ? (isPosting ? 'Threading...' : 'Thread') : 'Login to Thread'}
            </button>
          </div>
          {files.length > 0 && (
            <div className="mt-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    <span>{f.name}</span>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {files.some(f => f.type.startsWith('image/')) && (
                <div className="flex flex-wrap gap-2">
                  {files.filter(f => f.type.startsWith('image/')).map((f, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={URL.createObjectURL(f)}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {postError && (
            <p className="mt-2 text-sm text-red-600">{postError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadComposer; 