import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import WorkoutList from './components/Workout/WorkoutList';
import MealTracker from './components/Meal/MealTracker';
import AICoach from './components/AI/AICoach';
import AIChatTrainer from './components/AI/AIChatTrainer';
import Feed from './components/Social/Feed';
import Profile from './components/Profile/Profile';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/Common/PrivateRoute';
import WaterLogModal from './components/Layout/WaterLogModal';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
           
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="workouts" element={<WorkoutList />} />
              <Route path="meals" element={<MealTracker />} />
              <Route path="ai-coach" element={<AICoach />} />
              <Route path="ai-chat" element={<AIChatTrainer />} />
              <Route path="social" element={<Feed />} />
              <Route path="profile" element={<Profile />} />
              {/* No separate water route needed - water tracking is integrated in Dashboard */}
            </Route>
           
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;