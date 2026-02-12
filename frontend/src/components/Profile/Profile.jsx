import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RealDataProfile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMeals: 0,
    avgCalories: 0,
    totalCaloriesBurned: 0,
    weeklyWorkouts: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    activity_level: 'moderate',
    goal: 'maintain'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || 'male',
        height: user.height || '',
        weight: user.weight || '',
        activity_level: user.activity_level || 'moderate',
        goal: user.goal || 'maintain'
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getDetailedStats();
      const data = response.data;
      
      console.log('Detailed stats received:', data);
      
      setStats({
        totalWorkouts: data.all_time.total_workouts,
        totalMeals: data.all_time.total_meals,
        avgCalories: data.today.avg_calories_per_meal,
        totalCaloriesBurned: data.today.calories_burned,
        weeklyWorkouts: data.week.workouts
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load profile stats');
    }
  };

  const calculateBMR = () => {
    if (!user?.height || !user?.weight || !user?.age || !user?.gender) return 0;
    
    const weight = parseFloat(user.weight);
    const height = parseFloat(user.height);
    const age = parseInt(user.age);
    
    if (user.gender.toLowerCase() === 'male') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * (multipliers[user?.activity_level] || 1.55);
  };

  const getCalorieTarget = () => {
    const tdee = calculateTDEE();
    if (user?.goal === 'lose_weight') return Math.round(tdee - 500);
    if (user?.goal === 'gain_muscle') return Math.round(tdee + 300);
    return Math.round(tdee);
  };

  const getMacroTargets = () => {
    const calories = getCalorieTarget();
    let proteinRatio, carbsRatio, fatsRatio;

    if (user?.goal === 'lose_weight') {
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatsRatio = 0.30;
    } else if (user?.goal === 'gain_muscle') {
      proteinRatio = 0.30;
      carbsRatio = 0.45;
      fatsRatio = 0.25;
    } else {
      proteinRatio = 0.30;
      carbsRatio = 0.40;
      fatsRatio = 0.30;
    }

    return {
      protein: Math.round((calories * proteinRatio) / 4),
      carbs: Math.round((calories * carbsRatio) / 4),
      fats: Math.round((calories * fatsRatio) / 9)
    };
  };

  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return 0;
    const heightInMeters = parseFloat(user.height) / 100;
    const bmi = parseFloat(user.weight) / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-yellow-600' };
    if (bmiValue < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmiValue < 30) return { text: 'Overweight', color: 'text-orange-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  const getWaterRecommendation = () => {
    if (!user?.weight) return 2.5;
    const weight = parseFloat(user.weight);
    return ((weight * 33) / 1000).toFixed(1);
  };

  const getWorkoutRecommendation = () => {
    const recommendations = {
      sedentary: 3,
      light: 3,
      moderate: 4,
      active: 5,
      very_active: 6
    };
    return recommendations[user?.activity_level] || 4;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight)
      };

      const response = await userAPI.updateProfile(updateData);
      
      if (setUser) {
        const updatedUser = {
          ...user,
          ...response.data,
          id: response.data.id || user.id
        };
        setUser(updatedUser);
      }
      
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchUserStats();
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        age: user.age || '',
        gender: user.gender || 'male',
        height: user.height || '',
        weight: user.weight || '',
        activity_level: user.activity_level || 'moderate',
        goal: user.goal || 'maintain'
      });
    }
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading your amazing profile...</p>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const bmr = Math.round(calculateBMR());
  const tdee = Math.round(calculateTDEE());
  const calorieTarget = getCalorieTarget();
  const macros = getMacroTargets();
  const waterTarget = getWaterRecommendation();
  const workoutTarget = getWorkoutRecommendation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Gradient & Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  Your Profile
                  <span className="ml-3 text-5xl animate-pulse">👤</span>
                </h1>
                <p className="text-purple-100 text-base">Your personalized fitness dashboard</p>
              </div>
              <div className="hidden md:block">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="relative px-8 py-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-2xl font-semibold transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 border-2 border-white/40"
                  >
                    ✏️ Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-semibold transition-all border-2 border-white/40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="profile-form"
                      disabled={loading}
                      className="px-6 py-3 bg-white hover:bg-white/90 text-purple-600 rounded-xl font-semibold transition-all disabled:opacity-50 shadow-xl"
                    >
                      {loading ? 'Saving...' : '💾 Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile buttons */}
        <div className="md:hidden flex gap-3 justify-end">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>

        {editing ? (
          // Edit Form
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                <span className="mr-3 text-3xl">✏️</span>
                Edit Your Profile
              </h2>
              <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">👤</span> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🎂</span> Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                      min="13"
                      max="120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">⚧️</span> Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">📏</span> Height (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                      min="100"
                      max="250"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">⚖️</span> Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                      min="30"
                      max="300"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🏃</span> Activity Level
                    </label>
                    <select
                      name="activity_level"
                      value={formData.activity_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="sedentary">Sedentary (Little or no exercise)</option>
                      <option value="light">Light (Exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (Exercise 3-5 days/week)</option>
                      <option value="active">Active (Exercise 6-7 days/week)</option>
                      <option value="very_active">Very Active (Intense exercise daily)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                      <span className="mr-2">🎯</span> Fitness Goal
                    </label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="lose_weight">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain_muscle">Gain Muscle</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100"
                  >
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Profile Card */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40 hover:shadow-3xl transition-all">
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-2xl transform hover:scale-110 transition-all">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mt-6">{user.name || 'User'}</h2>
                  <p className="text-gray-600 text-base font-medium mt-1">{user.age || '0'} years old • {user.gender}</p>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b-2 border-gray-200">
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl">
                    <span className="text-gray-700 font-semibold flex items-center">
                      <span className="mr-2">📏</span> Height
                    </span>
                    <span className="font-bold text-blue-600 text-lg">{user.height} cm</span>
                  </div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
                    <span className="text-gray-700 font-semibold flex items-center">
                      <span className="mr-2">⚖️</span> Weight
                    </span>
                    <span className="font-bold text-green-600 text-lg">{user.weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl">
                    <span className="text-gray-700 font-semibold flex items-center">
                      <span className="mr-2">📊</span> BMI
                    </span>
                    <span className={`font-bold text-lg ${bmiCategory.color}`}>{bmi} ({bmiCategory.text})</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-0 group-hover/card:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                      <p className="text-xs text-blue-700 font-bold mb-1 flex items-center">
                        <span className="mr-2">🏃</span> Activity Level
                      </p>
                      <p className="font-bold text-blue-900 text-lg capitalize">{user.activity_level?.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover/card:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                      <p className="text-xs text-green-700 font-bold mb-1 flex items-center">
                        <span className="mr-2">🎯</span> Fitness Goal
                      </p>
                      <p className="font-bold text-green-900 text-lg capitalize">{user.goal?.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle & Right - Stats & Targets */}
            <div className="lg:col-span-2 space-y-6">
              {/* Metabolic Stats */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl p-8 text-white border-2 border-orange-400">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-3 text-3xl">📊</span>
                    Your Metabolic Profile
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative group/stat">
                      <div className="absolute inset-0 bg-white rounded-2xl blur opacity-20 group-hover/stat:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                        <p className="text-sm font-semibold opacity-90 mb-2">BMR</p>
                        <p className="text-4xl font-bold">{bmr}</p>
                        <p className="text-xs opacity-75 mt-1 font-medium">cal/day at rest</p>
                      </div>
                    </div>
                    <div className="relative group/stat">
                      <div className="absolute inset-0 bg-white rounded-2xl blur opacity-20 group-hover/stat:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                        <p className="text-sm font-semibold opacity-90 mb-2">TDEE</p>
                        <p className="text-4xl font-bold">{tdee}</p>
                        <p className="text-xs opacity-75 mt-1 font-medium">cal/day active</p>
                      </div>
                    </div>
                    <div className="relative group/stat">
                      <div className="absolute inset-0 bg-white rounded-2xl blur opacity-20 group-hover/stat:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/40 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                        <p className="text-sm font-semibold opacity-90 mb-2">Target</p>
                        <p className="text-4xl font-bold">{calorieTarget}</p>
                        <p className="text-xs opacity-75 mt-1 font-medium">cal/day goal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Targets */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center">
                    <span className="mr-3 text-3xl">🎯</span>
                    Daily Targets
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative group/card">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-orange-700 font-bold mb-2 flex items-center justify-center">
                          <span className="mr-1">🥩</span> Protein
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                          {macros.protein}
                        </p>
                        <p className="text-xs text-orange-600 mt-1 font-medium">grams/day</p>
                      </div>
                    </div>
                    <div className="relative group/card">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border-2 border-green-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-green-700 font-bold mb-2 flex items-center justify-center">
                          <span className="mr-1">🌾</span> Carbs
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                          {macros.carbs}
                        </p>
                        <p className="text-xs text-green-600 mt-1 font-medium">grams/day</p>
                      </div>
                    </div>
                    <div className="relative group/card">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 text-center border-2 border-yellow-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-yellow-700 font-bold mb-2 flex items-center justify-center">
                          <span className="mr-1">🧈</span> Fats
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                          {macros.fats}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1 font-medium">grams/day</p>
                      </div>
                    </div>
                    <div className="relative group/card">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-blue-700 font-bold mb-2 flex items-center justify-center">
                          <span className="mr-1">💧</span> Water
                        </p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                          {waterTarget}
                        </p>
                        <p className="text-xs text-blue-600 mt-1 font-medium">liters/day</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40 hover:shadow-3xl transition-all">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center">
                      <span className="mr-3 text-3xl">💪</span>
                      Workout Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold">Total Workouts:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{stats.totalWorkouts}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold">This Week:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.weeklyWorkouts}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold">Weekly Target:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{workoutTarget}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold text-sm flex items-center">
                          <span className="mr-2">🔥</span> Calories Burned (Today):
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{stats.totalCaloriesBurned}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/40 hover:shadow-3xl transition-all">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center">
                      <span className="mr-3 text-3xl">🍽️</span>
                      Nutrition Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold">Total Meals:</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalMeals}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold text-sm flex items-center">
                          <span className="mr-2">📊</span> Avg Calories (Today):
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{stats.avgCalories}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-all">
                        <span className="text-gray-700 font-semibold text-sm flex items-center">
                          <span className="mr-2">🎯</span> Daily Goal:
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{calorieTarget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-green-300 shadow-2xl hover:shadow-3xl transition-all">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <span className="mr-3 text-3xl">📈</span>
                    Weekly Progress
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between text-sm mb-3 font-semibold text-gray-700">
                        <span className="flex items-center">
                          <span className="mr-2">💪</span>
                          Workouts: {stats.weeklyWorkouts} / {workoutTarget}
                        </span>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {Math.round((stats.weeklyWorkouts / workoutTarget) * 100)}%
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-4 shadow-inner">
                        <div 
                          className="absolute top-0 left-0 h-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
                          style={{ width: `${Math.min((stats.weeklyWorkouts / workoutTarget) * 100, 100)}%` }}
                        ></div>
                        <div className="absolute inset-0 bg-white/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealDataProfile;