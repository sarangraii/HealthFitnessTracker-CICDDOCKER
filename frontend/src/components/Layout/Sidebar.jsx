import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { sidebarOpen } = useApp();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/workouts', label: 'Workouts', icon: '💪' },
    { path: '/meals', label: 'Meals', icon: '🍽️' },
    { path: '/ai-coach', label: 'AI Coach', icon: '🤖' },
    { path: '/social', label: 'Social', icon: '👥' }
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6">
        <h1 className={`text-2xl font-bold text-primary ${!sidebarOpen && 'hidden'}`}>
          💪 FitTracker
        </h1>
        <div className={`text-3xl ${sidebarOpen && 'hidden'}`}>💪</div>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 text-gray-700 hover:bg-blue-50 transition ${
                isActive ? 'bg-primary text-white hover:bg-primary' : ''
              }`
            }
          >
            <span className="text-2xl">{item.icon}</span>
            {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;