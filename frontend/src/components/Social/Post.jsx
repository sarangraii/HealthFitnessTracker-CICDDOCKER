import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreVertical, Send } from 'lucide-react';

const Post = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const commentInputRef = useRef(null);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onComment(post.id, commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  };

  const isLiked = post.likes?.includes(currentUser?.id);

  const getPostStyle = () => {
    switch (post.type) {
      case 'workout':
        return { 
          icon: '💪', 
          gradient: 'from-blue-500 to-cyan-600', 
          bg: 'from-blue-50 to-cyan-50', 
          border: 'border-blue-300',
          text: 'text-blue-700'
        };
      case 'meal':
        return { 
          icon: '🍽️', 
          gradient: 'from-green-500 to-emerald-600', 
          bg: 'from-green-50 to-emerald-50', 
          border: 'border-green-300',
          text: 'text-green-700'
        };
      case 'achievement':
        return { 
          icon: '🏆', 
          gradient: 'from-yellow-500 to-amber-600', 
          bg: 'from-yellow-50 to-amber-50', 
          border: 'border-yellow-300',
          text: 'text-yellow-700'
        };
      default:
        return { 
          icon: '📝', 
          gradient: 'from-gray-500 to-gray-600', 
          bg: 'from-gray-50 to-gray-100', 
          border: 'border-gray-300',
          text: 'text-gray-700'
        };
    }
  };

  const style = getPostStyle();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
      <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/40">
        {/* Post Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-full blur opacity-30`}></div>
                <div className={`relative w-16 h-16 bg-gradient-to-br ${style.gradient} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-xl ring-4 ring-white`}>
                  {post.user_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg truncate">
                  {post.user_name || 'User'}
                </h3>
                <p className="text-sm text-gray-600 font-medium" title={format(new Date(post.created_at), 'PPpp')}>
                  {timeAgo}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`bg-gradient-to-r ${style.bg} ${style.border} border-2 px-4 py-2 rounded-full shadow-md`}>
                <span className={`${style.text} text-sm font-bold flex items-center space-x-2`}>
                  <span className="text-lg">{style.icon}</span>
                  <span className="capitalize">{post.type}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="relative group/content">
            <div className={`absolute inset-0 bg-gradient-to-r ${style.bg} rounded-2xl blur opacity-0 group-hover/content:opacity-20 transition-opacity`}></div>
            <div className={`relative bg-gradient-to-r ${style.bg} rounded-2xl p-5 border-2 ${style.border} shadow-md`}>
              <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {post.content}
              </p>
            </div>
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center justify-between pt-5 mt-5 border-t-2 border-gray-200">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 transition-all group/like px-4 py-2 rounded-xl ${
                  isLiked 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart
                  className={`w-6 h-6 transition-transform group-hover/like:scale-125 ${
                    isLiked ? 'fill-current' : ''
                  }`}
                />
                <span className="font-bold text-sm">
                  {post.likes?.length || 0}
                </span>
              </button>

              <button
                onClick={toggleComments}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all group/comment px-4 py-2 rounded-xl"
              >
                <MessageCircle className="w-6 h-6 transition-transform group-hover/comment:scale-125" />
                <span className="font-bold text-sm">
                  {post.comments?.length || 0}
                </span>
              </button>
            </div>

            <span className="text-xs text-gray-500 font-bold bg-gray-100 px-4 py-2 rounded-full">
              {format(new Date(post.created_at), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-purple-50 p-6 space-y-5">
            {/* Comment Input */}
            <form onSubmit={handleSubmitComment} className="flex space-x-3">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-full blur opacity-30`}></div>
                <div className={`relative w-12 h-12 bg-gradient-to-br ${style.gradient} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                  {currentUser?.name?.[0]?.toUpperCase() || 'Y'}
                </div>
              </div>
              <div className="flex-1 flex space-x-3">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium shadow-sm hover:shadow-md"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:scale-105 disabled:scale-100"
                >
                  <Send className="w-4 h-4" />
                  <span>Post</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            {post.comments && post.comments.length > 0 ? (
              <div className="space-y-4 mt-5">
                {post.comments.map((comment, idx) => (
                  <div key={idx} className="relative group/comment">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-0 group-hover/comment:opacity-20 transition-opacity"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-100 hover:border-purple-200">
                      <div className="flex items-start space-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-30"></div>
                          <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {comment.user_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-gray-900 text-sm">
                              {comment.user_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-gray-800 text-sm leading-relaxed font-medium">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur opacity-20"></div>
                  <MessageCircle className="relative w-16 h-16 text-gray-300 mx-auto mb-3" />
                </div>
                <p className="text-gray-500 text-sm font-semibold">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;