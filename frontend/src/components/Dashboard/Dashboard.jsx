import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { workoutAPI, mealAPI, waterAPI } from '../../services/api';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import WaterLogModal from '../Layout/WaterLogModal';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayWorkout: null,
    todayCalories: 0,
    todayWater: 0,
    recentWorkouts: [],
    todayMeals: [],
    weeklyStats: {
      workouts: 0,
      calories: 0,
      hours: 0
    },
    weeklyData: []
  });
  const [loading, setLoading] = useState(true);
  const [waterModalOpen, setWaterModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const weekStart = startOfWeek(today);
      const weekEnd = endOfWeek(today);

      const [workoutsRes, mealsRes, waterRes] = await Promise.all([
        workoutAPI.getAll({
          start_date: weekStart.toISOString().split('T')[0],
          end_date: weekEnd.toISOString().split('T')[0]
        }),
        mealAPI.getAll({
          start_date: today.toISOString().split('T')[0],
          end_date: today.toISOString().split('T')[0]
        }),
        waterAPI.getToday().catch(() => ({ data: { total: 0 } }))
      ]);

      let workouts = Array.isArray(workoutsRes.data) ? workoutsRes.data : workoutsRes.data.workouts || workoutsRes.data.data || [];
      let meals = Array.isArray(mealsRes.data) ? mealsRes.data : mealsRes.data.meals || mealsRes.data.data || [];
      let todayWater = waterRes.data?.total || waterRes.data?.totalWater || 0;

      const todayWorkouts = workouts.filter(w => isToday(new Date(w.date || w.created_at)));
      const todayCalories = meals.reduce((sum, meal) => sum + (meal.total_calories || meal.totalCalories || 0), 0);
      const weeklyCalories = workouts.reduce((sum, w) => sum + (w.calories_burned || w.caloriesBurned || 0), 0);
      const weeklyHours = workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / 60;
      const weeklyChartData = createWeeklyChartData(workouts);

      setStats({
        todayWorkout: todayWorkouts[0] || null,
        todayCalories: Math.round(todayCalories),
        todayWater: todayWater,
        recentWorkouts: workouts.slice(0, 3),
        todayMeals: meals,
        weeklyStats: {
          workouts: workouts.length,
          calories: Math.round(weeklyCalories),
          hours: weeklyHours.toFixed(1)
        },
        weeklyData: weeklyChartData
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createWeeklyChartData = (workouts) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    return days.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + index);

      const dayWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date || w.created_at);
        return format(workoutDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
      });

      const dayCalories = dayWorkouts.reduce((sum, w) => sum + (w.calories_burned || w.caloriesBurned || 0), 0);

      return { day, value: dayCalories };
    });
  };

  const handleLogWater = async (amount) => {
    try {
      await waterAPI.add({
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString()
      });
      toast.success(`Added ${amount}L of water! 💧`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error logging water:', error);
      toast.error('Failed to log water intake');
    }
  };

  const handleResetWater = async () => {
    if (!window.confirm('Are you sure you want to reset today\'s water intake?')) return;

    try {
      const response = await waterAPI.resetToday();
      toast.success(`Reset complete! Deleted ${response.data.deleted_count} water records.`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error resetting water:', error);
      toast.error('Failed to reset water intake');
    }
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      strength: '💪', cardio: '🏃', flexibility: '🧘', yoga: '🧘',
      sports: '⚽', cycling: '🚴', running: '🏃', swimming: '🏊'
    };
    return icons[type?.toLowerCase()] || '🏋️';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-600 absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center">
              Welcome back, {user?.name || 'User'}! 
              <span className="ml-3 text-4xl animate-bounce">👋</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2">Here's your fitness overview for today</p>
          </div>
        </div>

        {/* Today's Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Workout */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 hover:shadow-2xl transition-all transform hover:scale-105">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <span className="mr-2 text-xl">🏋️</span>
                Today's Workout
              </h3>
              {stats.todayWorkout ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                      {getWorkoutIcon(stats.todayWorkout.type)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">
                        {stats.todayWorkout.title || stats.todayWorkout.name}
                      </p>
                      <p className="text-sm text-gray-600 font-medium">{stats.todayWorkout.duration} mins</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 font-medium">Calories Burned</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {stats.todayWorkout.calories_burned || stats.todayWorkout.caloriesBurned || 0} kcal
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/workouts')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <span className="text-6xl opacity-30 animate-pulse">🏃</span>
                  </div>
                  <p className="text-gray-600 text-center text-sm font-medium">No workout logged today</p>
                  <button 
                    onClick={() => navigate('/workouts')}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    Track Workout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Calories Intake */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 hover:shadow-2xl transition-all transform hover:scale-105">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <span className="mr-2 text-xl">🔥</span>
                Calories Intake
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    🔥
                  </div>
                  <div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {stats.todayCalories.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Goal: 2,200 kcal</p>
                  </div>
                </div>
                
                <div>
                  <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all shadow-lg"
                      style={{ width: `${Math.min((stats.todayCalories / 2200) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-semibold">
                    {Math.round((stats.todayCalories / 2200) * 100)}% of daily goal
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Meals logged</span>
                    <span className="text-lg font-bold text-gray-900">{stats.todayMeals.length}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/meals')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                >
                  Log Meal
                </button>
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6 hover:shadow-2xl transition-all transform hover:scale-105">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                <span className="mr-2 text-xl">💧</span>
                Water Intake
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                    💧
                  </div>
                  <div>
                    <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                      {stats.todayWater.toFixed(1)} L
                    </p>
                    <p className="text-sm text-gray-600 font-medium">Goal: 3.0 L</p>
                  </div>
                </div>

                <div>
                  <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all shadow-lg"
                      style={{ width: `${Math.min((stats.todayWater / 3.0) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 font-semibold">
                    {Math.round((stats.todayWater / 3.0) * 100)}% of daily goal
                  </p>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-3 border border-cyan-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Glasses (250ml)</span>
                    <span className="text-lg font-bold text-gray-900">{Math.round(stats.todayWater * 4)} / 12</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setWaterModalOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                  >
                    Log Water
                  </button>
                  <button 
                    onClick={handleResetWater}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Workouts */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                  <span className="mr-2 text-2xl">🏋️</span>
                  Recent Workouts
                </h3>
                <button 
                  onClick={() => navigate('/workouts')}
                  className="text-purple-600 hover:text-purple-700 font-semibold text-sm transition-all transform hover:scale-110"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-3">
                {stats.recentWorkouts.length > 0 ? (
                  stats.recentWorkouts.map((workout) => (
                    <div key={workout._id || workout.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all shadow hover:shadow-md border border-gray-200 hover:border-purple-300">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                          {getWorkoutIcon(workout.type)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">
                            {workout.title || workout.name}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">
                            {workout.duration} mins • {format(new Date(workout.date || workout.created_at), 'MMM d')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right bg-white/60 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold text-gray-900">{workout.duration} mins</p>
                        <p className="text-xs text-gray-600 font-medium">
                          {workout.calories_burned || workout.caloriesBurned || 0} kcal
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <span className="text-6xl opacity-20">🏋️</span>
                    <p className="text-gray-500 mt-4 text-sm font-medium">No workouts yet this week</p>
                    <button
                      onClick={() => navigate('/workouts')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Log your first workout →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center">
                <span className="mr-2 text-2xl">📊</span>
                Weekly Progress
              </h3>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {stats.weeklyStats.workouts}
                    </span>
                    <span className="text-gray-700 text-base font-semibold">Workouts</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">This Week</p>
                </div>

                <div className="h-32 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.weeklyData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 600 }}
                      />
                      <YAxis hide />
                      <Bar 
                        dataKey="value" 
                        fill="url(#colorGradient)" 
                        radius={[8, 8, 0, 0]} 
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200">
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 text-center">
                    <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      {stats.weeklyStats.calories.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-700 font-semibold mt-1">Calories Burned</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 text-center">
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {stats.weeklyStats.hours} hrs
                    </p>
                    <p className="text-xs text-gray-700 font-semibold mt-1">Time Exercised</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/40 p-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center">
              <span className="mr-2 text-2xl">⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <button
                onClick={() => navigate('/workouts')}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 rounded-2xl transition-all shadow-md hover:shadow-xl border-2 border-blue-200 hover:border-blue-400 transform hover:scale-105"
              >
                <span className="text-3xl mb-2">💪</span>
                <span className="font-bold text-gray-900 text-sm">Workouts</span>
              </button>
              <button
                onClick={() => navigate('/meals')}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl transition-all shadow-md hover:shadow-xl border-2 border-green-200 hover:border-green-400 transform hover:scale-105"
              >
                <span className="text-3xl mb-2">🍽️</span>
                <span className="font-bold text-gray-900 text-sm">Meals</span>
              </button>
              <button
                onClick={() => navigate('/ai-coach')}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl transition-all shadow-md hover:shadow-xl border-2 border-purple-200 hover:border-purple-400 transform hover:scale-105"
              >
                <span className="text-3xl mb-2">🤖</span>
                <span className="font-bold text-gray-900 text-sm">AI Coach</span>
              </button>
              <button
                onClick={() => navigate('/ai-chat')}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-2xl transition-all shadow-md hover:shadow-xl border-2 border-indigo-200 hover:border-indigo-400 transform hover:scale-105"
              >
                <span className="text-3xl mb-2">💬</span>
                <span className="font-bold text-gray-900 text-sm">AI Chat</span>
              </button>
              <button
                onClick={() => navigate('/social')}
                className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl transition-all shadow-md hover:shadow-xl border-2 border-orange-200 hover:border-orange-400 transform hover:scale-105 col-span-2 sm:col-span-1"
              >
                <span className="text-3xl mb-2">👥</span>
                <span className="font-bold text-gray-900 text-sm">Social</span>
              </button>
            </div>
          </div>
        </div>

        <WaterLogModal
          isOpen={waterModalOpen}
          onClose={() => setWaterModalOpen(false)}
          onSuccess={handleLogWater}
        />
      </div>
    </div>
  );
};

export default Dashboard;