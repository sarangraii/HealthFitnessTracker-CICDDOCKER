import React, { useState, useRef } from 'react';
import { socialAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { X, Image, Smile, TrendingUp, Award, Utensils, Dumbbell, FileText } from 'lucide-react';

const CreatePost = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('general');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  const MAX_CHARS = 1000;

  const postTypes = [
    { value: 'general', label: 'General', icon: FileText, color: 'from-gray-500 to-gray-600', emoji: '📝' },
    { value: 'workout', label: 'Workout', icon: Dumbbell, color: 'from-blue-500 to-cyan-600', emoji: '💪' },
    { value: 'meal', label: 'Meal', icon: Utensils, color: 'from-green-500 to-emerald-600', emoji: '🍽️' },
    { value: 'achievement', label: 'Achievement', icon: Award, color: 'from-yellow-500 to-amber-600', emoji: '🏆' }
  ];

  const handleContentChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_CHARS) {
      setContent(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please write something');
      return;
    }

    if (content.trim().length < 5) {
      toast.error('Post must be at least 5 characters');
      return;
    }

    setLoading(true);
    try {
      await socialAPI.createPost({ content: content.trim(), type });
      toast.success('Post created successfully! 🎉');
      onPostCreated();
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = postTypes.find(t => t.value === type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white flex items-center">
                <span className="mr-3 text-4xl animate-bounce">✨</span>
                Create Post
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-3xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                aria-label="Close"
              >
                <X className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2 text-xl">🎯</span>
              What are you sharing?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {postTypes.map((postType) => {
                const Icon = postType.icon;
                const isSelected = type === postType.value;
                return (
                  <button
                    key={postType.value}
                    type="button"
                    onClick={() => setType(postType.value)}
                    className={`relative group p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      isSelected
                        ? 'border-transparent shadow-xl scale-105'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isSelected && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${postType.color} rounded-xl blur opacity-30`}></div>
                    )}
                    <div className={`relative flex flex-col items-center space-y-2 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {isSelected && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${postType.color} rounded-xl`}></div>
                      )}
                      <span className="relative text-3xl">{postType.emoji}</span>
                      <span className="relative text-sm font-bold">{postType.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Input */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2 text-xl">💭</span>
                Your story
              </label>
              <textarea
                ref={textareaRef}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all font-medium shadow-sm hover:shadow-md"
                rows="8"
                value={content}
                onChange={handleContentChange}
                placeholder={`Share your ${selectedType?.label.toLowerCase()} story... What's on your mind? 💭`}
                disabled={loading}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-600 font-semibold">
                  <span className={charCount > MAX_CHARS * 0.9 ? 'text-orange-600 font-bold' : 'text-gray-700'}>
                    {charCount}
                  </span>
                  <span className="text-gray-400"> / {MAX_CHARS}</span>
                </div>
                {content.trim().length > 0 && content.trim().length < 5 && (
                  <span className="text-xs text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full">Minimum 5 characters</span>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-blue-900 font-bold mb-3 flex items-center">
                <span className="mr-2 text-xl">💡</span>
                Tips for a great post:
              </p>
              <ul className="text-sm text-blue-800 space-y-2 font-medium">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5 text-lg">✓</span>
                  <span>Be specific about your progress or experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5 text-lg">✓</span>
                  <span>Share numbers or metrics if relevant</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5 text-lg">✓</span>
                  <span>Ask questions to engage with the community</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5 text-lg">✓</span>
                  <span>Use emojis to make your post more engaging</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-2">
            <button
              type="submit"
              disabled={loading || !content.trim() || content.trim().length < 5}
              className="flex-1 bg-gradient-to-r from-purple-500 via-pink-600 to-orange-500 hover:from-purple-600 hover:via-pink-700 hover:to-orange-600 text-white py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </span>
              ) : (
                'Share Post'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-8 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-bold transition-all disabled:opacity-50 shadow-md hover:shadow-lg border-2 border-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
