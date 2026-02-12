import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SmartWorkoutForm from './SmartWorkoutForm';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const WorkoutList = () => {
  const { user, loading: authLoading } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchWorkouts = async () => {
    try {
      const response = await workoutAPI.getAll();
      setWorkouts(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkout = () => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    setShowForm(true);
  };

  const handleDeleteWorkout = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) return;

    try {
      await workoutAPI.delete(id);
      toast.success('Workout deleted');
      fetchWorkouts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete workout');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    fetchWorkouts();
  };

  // Calculate weekly stats
  const weeklyStats = workouts.reduce((acc, workout) => {
    acc.totalWorkouts += 1;
    acc.totalDuration += workout.duration || 0;
    acc.totalCalories += workout.calories_burned || 0;
    return acc;
  }, { totalWorkouts: 0, totalDuration: 0, totalCalories: 0 });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4 shadow-xl"></div>
          </div>
          <p className="text-gray-700 text-base font-semibold">Loading workouts...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-12 border border-gray-100">
              <div className="text-8xl mb-6 animate-bounce">🔒</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Please Login</h2>
              <p className="text-gray-600 mb-8 text-base">Access your workout history and track your progress</p>
              <button
                onClick={() => (window.location.href = '/login')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all text-base shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getWorkoutIcon = (type) => {
    const icons = {
      strength: '💪',
      cardio: '🏃',
      flexibility: '🧘',
      sports: '⚽',
      other: '🏋️'
    };
    return icons[type] || '🏋️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Gradient & Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  <span className="mr-3 text-5xl animate-pulse">🏋️</span>
                  Workouts
                </h1>
                <p className="text-purple-100 text-base">Track and manage your workout sessions</p>
              </div>
              <button
                onClick={handleAddWorkout}
                className="hidden md:block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
              >
                Track New Workout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Add Button */}
        <button
          onClick={handleAddWorkout}
          className="md:hidden w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-xl"
        >
          Track New Workout
        </button>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Total Workouts</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{weeklyStats.totalWorkouts}</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  💪
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Total Duration</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{weeklyStats.totalDuration}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">minutes</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  ⏱️
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Calories Burned</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{weeklyStats.totalCalories}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">kcal</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🔥
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Workout Form */}
        {showForm && (
          <SmartWorkoutForm
            onClose={handleFormClose}
            userId={user.id}
          />
        )}

        {/* Workouts Grid */}
        {workouts.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="mr-3 text-3xl">📊</span>
              Recent Workouts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-white/40 hover:border-purple-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0">
                          {getWorkoutIcon(workout.type)}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 capitalize">
                            {workout.title || `${workout.type} Workout`}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium">
                            {format(new Date(workout.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="relative group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl blur opacity-10 group-hover/stat:opacity-30 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 text-center shadow-md border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1 font-semibold">Duration</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{workout.duration}</p>
                          <p className="text-xs text-blue-600 font-medium">mins</p>
                        </div>
                      </div>
                      <div className="relative group/stat">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur opacity-10 group-hover/stat:opacity-30 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center shadow-md border border-orange-200">
                          <p className="text-xs text-orange-700 mb-1 font-semibold">Calories</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{workout.calories_burned || 0}</p>
                          <p className="text-xs text-orange-600 font-medium">kcal</p>
                        </div>
                      </div>
                    </div>

                    {/* Exercises */}
                    {workout.exercises && workout.exercises.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-gray-700 mb-3 flex items-center">
                          <span className="mr-2 text-base">📋</span>
                          Exercises ({workout.exercises.length})
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {workout.exercises.map((exercise, idx) => (
                            <div key={idx} className="text-xs bg-gradient-to-r from-gray-50 to-indigo-50 p-3 rounded-xl flex justify-between items-center shadow-sm border border-gray-200">
                              <span className="font-bold text-gray-800">{exercise.name}</span>
                              <span className="text-gray-600 text-xs font-semibold">
                                {exercise.sets}×{exercise.reps}
                                {exercise.weight && ` @ ${exercise.weight}${exercise.unit}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {workout.notes && (
                      <div className="mb-5 relative group/notes">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl blur opacity-10 group-hover/notes:opacity-20 transition-opacity"></div>
                        <div className="relative p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-md">
                          <p className="text-xs text-gray-800 italic font-medium">"{workout.notes}"</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <button
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="w-full bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 py-3 rounded-xl transition-all font-bold text-sm shadow-md hover:shadow-lg border-2 border-red-200 hover:border-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative text-center py-16 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40">
              <div className="text-8xl mb-6 animate-bounce">🏋️</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">No workouts yet!</h2>
              <p className="text-gray-600 mb-8 text-base font-medium">Start tracking your fitness journey today</p>
              <button
                onClick={handleAddWorkout}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-bold transition-all text-base shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Log Your First Workout
              </button>
              <div className="mt-10 text-left max-w-md mx-auto relative group/info">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-10 group-hover/info:opacity-20 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                  <p className="font-bold text-gray-900 mb-3 text-base flex items-center">
                    <span className="mr-2 text-2xl">✨</span>
                    Smart Features
                  </p>
                  <ul className="text-sm text-gray-700 space-y-2 font-medium">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5 text-lg">✓</span>
                      <span>Just add exercises - duration calculated automatically</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5 text-lg">✓</span>
                      <span>Calories burned based on exercise intensity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5 text-lg">✓</span>
                      <span>Workout type detected from your exercises</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5 text-lg">✓</span>
                      <span>No manual calculations needed!</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutList;