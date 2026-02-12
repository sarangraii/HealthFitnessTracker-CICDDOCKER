import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import BottomNav from './BottomNav';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/workouts', label: 'Workouts', icon: '💪' },
    { to: '/meals', label: 'Meals', icon: '🍽️' },
    { to: '/ai-coach', label: 'AI Coach', icon: '🤖' },
    { to: '/ai-chat', label: 'AI Chat', icon: '💬' },
    { to: '/social', label: 'Social', icon: '👥' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 sm:space-x-8">
              {/* <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                Health & Fitness
              </h1> */}
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                Health & Fitness
              </h1>
              
              {/* Navigation Links - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                        isActive
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email || ''}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform hidden sm:block ${showDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    ></div>
                    
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                      </div>

                      {/* Menu Items */}
                      <NavLink
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm text-gray-700">Profile</span>
                      </NavLink>

                      <div className="border-t border-gray-100 my-2"></div>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 transition-colors text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
};

export default Layout;



// import React, { useState } from 'react';
// import { Outlet, NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import BottomNav from './BottomNav';

// const Layout = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [showDropdown, setShowDropdown] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const navLinks = [
//     { to: '/', label: 'Dashboard', icon: '📊' },
//     { to: '/workouts', label: 'Workouts', icon: '💪' },
//     { to: '/meals', label: 'Meals', icon: '🍽️' },
//     { to: '/ai-coach', label: 'AI Coach', icon: '🤖' },
//     { to: '/ai-chat', label: 'AI Chat', icon: '💬' },
//     { to: '/social', label: 'Social', icon: '👥' }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-16 md:pb-0">
//       {/* Top Navigation */}
//       <nav className="relative bg-white/80 backdrop-blur-xl border-b-2 border-white/50 sticky top-0 z-50 shadow-lg">
//         <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-5"></div>
//         <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div className="flex items-center space-x-4 sm:space-x-8">
//               <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
//                 Health & Fitness
//               </h1>
              
//               {/* Navigation Links - Hidden on mobile */}
//               <div className="hidden md:flex items-center space-x-1">
//                 {navLinks.map((link) => (
//                   <NavLink
//                     key={link.to}
//                     to={link.to}
//                     end={link.to === '/'}
//                     className={({ isActive }) =>
//                       `px-4 py-2 rounded-xl font-bold transition-all text-sm transform hover:scale-105 ${
//                         isActive
//                           ? 'text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg'
//                           : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
//                       }`
//                     }
//                   >
//                     <span className="mr-2">{link.icon}</span>
//                     {link.label}
//                   </NavLink>
//                 ))}
//               </div>
//             </div>

//             {/* User Menu */}
//             <div className="flex items-center space-x-2 sm:space-x-4">
//               {/* User Profile Dropdown */}
//               <div className="relative">
//                 <button
//                   onClick={() => setShowDropdown(!showDropdown)}
//                   className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all transform hover:scale-105"
//                 >
//                   <div className="relative">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-50"></div>
//                     <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
//                       {user?.name?.[0]?.toUpperCase() || 'U'}
//                     </div>
//                   </div>
//                   <div className="hidden sm:block text-left">
//                     <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
//                     <p className="text-xs text-gray-600 truncate max-w-[150px] font-medium">{user?.email || ''}</p>
//                   </div>
//                   <svg 
//                     className={`w-4 h-4 text-gray-600 transition-transform hidden sm:block ${showDropdown ? 'rotate-180' : ''}`} 
//                     fill="none" 
//                     stroke="currentColor" 
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </button>

//                 {/* Dropdown Menu */}
//                 {showDropdown && (
//                   <>
//                     {/* Backdrop to close dropdown */}
//                     <div 
//                       className="fixed inset-0 z-10" 
//                       onClick={() => setShowDropdown(false)}
//                     ></div>
                    
//                     <div className="absolute right-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/50 py-2 z-20 animate-fadeIn">
//                       <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-10"></div>
                      
//                       {/* User Info */}
//                       <div className="relative px-4 py-3 border-b-2 border-gray-100">
//                         <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
//                         <p className="text-xs text-gray-600 truncate font-medium">{user?.email || ''}</p>
//                       </div>

//                       {/* Menu Items */}
//                       <div className="relative">
//                         <NavLink
//                           to="/profile"
//                           onClick={() => setShowDropdown(false)}
//                           className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all"
//                         >
//                           <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                           <span className="text-sm text-gray-800 font-bold">Profile</span>
//                         </NavLink>

//                         <div className="border-t-2 border-gray-100 my-2"></div>

//                         {/* Logout Button */}
//                         <button
//                           onClick={handleLogout}
//                           className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all text-red-600"
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                           </svg>
//                           <span className="text-sm font-bold">Logout</span>
//                         </button>
//                       </div>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="min-h-[calc(100vh-4rem)]">
//         <Outlet />
//       </main>

//       {/* Bottom Navigation - Mobile Only */}
//       <BottomNav />
//     </div>
//   );
// };

// export default Layout;