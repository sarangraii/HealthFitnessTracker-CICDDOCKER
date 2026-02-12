import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: '📊', label: 'Home', exact: true },
    { path: '/workouts', icon: '💪', label: 'Workouts' },
    { path: '/meals', icon: '🍽️', label: 'Meals' },
    { path: '/ai-chat', icon: '💬', label: 'AI Chat' },
    { path: '/social', icon: '👥', label: 'Social' }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-2 border-white/50 shadow-2xl z-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-5"></div>
      <div className="relative grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center space-y-1 transition-all transform hover:scale-110 ${
                active
                  ? 'text-white'
                  : 'text-gray-600'
              }`}
            >
              {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 opacity-20 rounded-t-xl"></div>
              )}
              <span className={`text-2xl relative ${active ? 'animate-bounce' : ''}`}>{item.icon}</span>
              <span className={`text-xs font-bold relative ${
                active 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' 
                  : ''
              }`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;