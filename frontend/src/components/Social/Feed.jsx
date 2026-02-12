import React, { useState, useEffect } from 'react';
import { socialAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreatePost from './CreatePost';
import Post from './Post';
import toast from 'react-hot-toast';
import { Users, Plus } from 'lucide-react';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response = await socialAPI.getFeed();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Feed fetch error:', error);
      toast.error('Failed to fetch feed');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchFeed();
  };

  const handleLike = async (postId) => {
    try {
      await socialAPI.likePost(postId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                likes: post.likes?.includes(user.id)
                  ? post.likes.filter(id => id !== user.id)
                  : [...(post.likes || []), user.id]
              }
            : post
        )
      );
      await fetchFeed();
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
      fetchFeed();
    }
  };

  const handleComment = async (postId, text) => {
    if (!text.trim()) return;
    
    try {
      await socialAPI.commentPost(postId, text);
      toast.success('Comment added!');
      await fetchFeed();
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Posts', emoji: '📋' },
    { value: 'workout', label: 'Workouts', emoji: '💪' },
    { value: 'meal', label: 'Meals', emoji: '🍽️' },
    { value: 'achievement', label: 'Achievements', emoji: '🏆' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-purple-600 mx-auto mb-4 shadow-xl"></div>
          </div>
          <p className="text-gray-700 text-base font-semibold">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header with Gradient & Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  <Users className="mr-3 w-10 h-10 animate-pulse" />
                  Community Feed
                </h1>
                <p className="text-purple-100 text-base">Share your journey, inspire others</p>
              </div>
              <button
                onClick={() => setShowCreatePost(true)}
                className="hidden md:flex bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30 items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Post</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Create Button */}
        <button
          onClick={() => setShowCreatePost(true)}
          className="md:hidden w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </button>

        {/* Filter Tabs */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 border border-white/40">
            <div className="flex items-center space-x-3 overflow-x-auto">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap transform hover:scale-105 ${
                    filter === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                  }`}
                >
                  <span className="mr-2 text-lg">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-xl text-center border border-white/40 hover:shadow-2xl transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{posts.length}</div>
              <div className="text-xs text-gray-600 mt-2 font-semibold">Total Posts</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-xl text-center border border-white/40 hover:shadow-2xl transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                {posts.reduce((sum, post) => sum + (post.likes?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 mt-2 font-semibold">Total Likes</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-5 shadow-xl text-center border border-white/40 hover:shadow-2xl transition-all">
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 mt-2 font-semibold">Total Comments</div>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <CreatePost
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Post
                key={post.id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40">
                <div className="text-8xl mb-6 animate-bounce">
                  {filter === 'all' ? '📝' : filterOptions.find(f => f.value === filter)?.emoji}
                </div>
                <p className="text-gray-900 text-2xl mb-3 font-bold">
                  {filter === 'all' ? 'No posts yet' : `No ${filter} posts yet`}
                </p>
                <p className="text-gray-600 mb-8 text-base font-medium max-w-md mx-auto">
                  {filter === 'all'
                    ? 'Be the first to share your fitness journey!'
                    : `Share your ${filter} progress with the community!`}
                </p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center space-x-2 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Post</span>
                </button>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">💬</div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base">Share Stories</h4>
                      <p className="text-sm text-gray-600 font-medium">Connect with others on similar journeys</p>
                    </div>
                  </div>
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">🎯</div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base">Get Motivated</h4>
                      <p className="text-sm text-gray-600 font-medium">Find inspiration from the community</p>
                    </div>
                  </div>
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">🏆</div>
                      <h4 className="font-bold text-gray-900 mb-2 text-base">Celebrate Wins</h4>
                      <p className="text-sm text-gray-600 font-medium">Share your achievements and progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;


