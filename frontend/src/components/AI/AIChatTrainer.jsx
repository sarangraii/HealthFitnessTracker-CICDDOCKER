import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Dumbbell, User, Bot, Sparkles, TrendingUp, Heart, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AIChatTrainer = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    loadQuickQuestions();
    loadWelcomeMessage();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadWelcomeMessage = () => {
    const userName = user?.name?.split(' ')[0] || 'there';
    setMessages([{
      role: 'assistant',
      content: `Hi ${userName}! 👋 I'm your AI fitness trainer. I'm here to help with workouts, nutrition, and motivation. What would you like to know?`,
      timestamp: new Date().toISOString()
    }]);
  };

  const loadQuickQuestions = () => {
    const goal = user?.goal || 'maintain';
    
    const questions = {
      gain_muscle: [
        "What's the best rep range for muscle growth?",
        "How often should I train each muscle?",
        "Do I need supplements to build muscle?",
        "Post-workout nutrition tips?",
        "How to break through a plateau?"
      ],
      lose_weight: [
        "Best cardio for fat loss?",
        "How to avoid losing muscle while cutting?",
        "Should I do fasted cardio?",
        "How to deal with hunger on a deficit?",
        "What's a healthy rate of weight loss?"
      ],
      maintain: [
        "What's a good workout routine for beginners?",
        "How much protein should I eat daily?",
        "Tips for staying motivated?",
        "How do I track my progress?",
        "What's the best time to work out?"
      ]
    };
    
    setQuickQuestions(questions[goal] || questions.maintain);
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await aiAPI.chatWithTrainer(messageText);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.data.answer || "I received your question but couldn't generate a response. Please try again.",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMsg = error.response?.data?.detail || 
                       error.response?.data?.error || 
                       'Failed to get response. Please try again.';
      
      setError(errorMsg);
      toast.error(errorMsg);
      
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  const clearHistory = () => {
    const userName = user?.name?.split(' ')[0] || 'there';
    if (window.confirm('Clear all chat history?')) {
      setMessages([{
        role: 'assistant',
        content: `Chat history cleared, ${userName}! What would you like to know? 💪`,
        timestamp: new Date().toISOString()
      }]);
      setError(null);
      toast.success('Chat history cleared');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Dumbbell className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                AI Trainer Chat
                <Sparkles className="w-5 h-5 ml-2 text-yellow-300" />
              </h1>
              <p className="text-purple-100 text-sm">Your 24/7 fitness companion</p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* User Stats Banner */}
      {user && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="max-w-4xl mx-auto grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs text-gray-500 font-medium">Goal</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {user.goal?.replace('_', ' ') || 'Not set'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Heart className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-xs text-gray-500 font-medium">Weight</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {user.weight ? `${user.weight}kg` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <User className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-xs text-gray-500 font-medium">Height</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {user.height ? `${user.height}cm` : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-xs text-gray-500 font-medium">Activity</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {user.activityLevel?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto w-full mt-4 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.role === 'user' ? 'bg-purple-600' : 'bg-gradient-to-br from-pink-500 to-purple-600'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <div className={`rounded-2xl p-4 shadow-md ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="bg-white border-t border-gray-200 p-4 shadow-sm">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 font-medium mb-3">Quick questions to get started:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-sm text-gray-700 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-purple-300"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about workouts, nutrition, or motivation..."
              rows="2"
              className="flex-1 bg-gray-50 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none placeholder-gray-400 border border-gray-200"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">
              Press Enter to send • Shift+Enter for new line
            </p>
            <p className="text-xs">
              {isLoading ? (
                <span className="text-purple-600 font-medium">● Generating response...</span>
              ) : (
                <span className="text-green-600 font-medium">● Ready</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatTrainer;














