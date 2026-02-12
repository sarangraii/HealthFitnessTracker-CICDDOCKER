import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AICoach = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [calorieData, setCalorieData] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');
  const [expandedMeals, setExpandedMeals] = useState({});

  const generateDietPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getDietRecommendations({
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity_level: user.activity_level,
        goal: user.goal
      });
      setDietPlan(response.data);
      toast.success('Diet plan generated with real meals! 🍽️');
    } catch (error) {
      console.error('Diet plan error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate diet plan');
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getWorkoutPlan({
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity_level: user.activity_level,
        goal: user.goal
      });
      setWorkoutPlan(response.data);
      toast.success('Workout plan generated!');
    } catch (error) {
      console.error('Workout plan error:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate workout plan');
    } finally {
      setLoading(false);
    }
  };

  const predictCalories = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.predictCalories({
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activity_level: user.activity_level,
        goal: user.goal
      });
      setCalorieData(response.data);
      toast.success('Calorie prediction complete!');
    } catch (error) {
      console.error('Calorie prediction error:', error);
      toast.error(error.response?.data?.detail || 'Failed to predict calories');
    } finally {
      setLoading(false);
    }
  };

  const toggleMealExpanded = (mealType) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const getMealEmoji = (type) => {
    const emojis = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snacks: '🍎'
    };
    return emojis[type] || '🍽️';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header with Gradient & Animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  AI Coach
                  <span className="ml-3 text-5xl animate-pulse">✨</span>
                </h1>
                <p className="text-purple-100 text-base">Get personalized workout and diet recommendations powered by AI</p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-5xl">🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Modern Design */}
        <div className="flex space-x-2 mb-8 bg-white/60 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/40">
          <button
            onClick={() => setActiveTab('diet')}
            className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 text-base relative overflow-hidden ${
              activeTab === 'diet'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              🍎 Diet Plan
            </span>
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 text-base relative overflow-hidden ${
              activeTab === 'workout'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              💪 Workout Plan
            </span>
          </button>
          <button
            onClick={() => setActiveTab('calories')}
            className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 text-base relative overflow-hidden ${
              activeTab === 'calories'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center">
              🔥 Calorie Calculator
            </span>
          </button>
        </div>

        {/* Diet Plan Tab */}
        {activeTab === 'diet' && (
          <div className="space-y-6">
            {!dietPlan ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100">
                  <div className="text-8xl mb-6 animate-bounce">🥗</div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                    Generate Your Personalized Diet Plan
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                    Get a customized nutrition plan with real meal suggestions based on your goals.
                  </p>
                  <button
                    onClick={generateDietPlan}
                    disabled={loading}
                    className="relative px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-semibold transition-all disabled:opacity-50 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Diet Plan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Nutritional Targets */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/40">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
                      <span className="mr-3 text-3xl">🎯</span>
                      Your Nutrition Targets
                    </h3>
                    <button
                      onClick={generateDietPlan}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Regenerate
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-blue-700 font-medium mb-2">Daily Calories</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                          {dietPlan.daily_calories}
                        </p>
                        <p className="text-xs text-blue-600 mt-1 font-medium">kcal</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-green-700 font-medium mb-2">Protein</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                          {dietPlan.target_protein}
                        </p>
                        <p className="text-xs text-green-600 mt-1 font-medium">grams</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6 text-center border border-yellow-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-yellow-700 font-medium mb-2">Carbs</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                          {dietPlan.target_carbs}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1 font-medium">grams</p>
                      </div>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border border-orange-200 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                        <p className="text-sm text-orange-700 font-medium mb-2">Fats</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                          {dietPlan.target_fats}
                        </p>
                        <p className="text-xs text-orange-600 mt-1 font-medium">grams</p>
                      </div>
                    </div>
                  </div>

                  {/* Actual Totals from Generated Meals */}
                  {dietPlan.actual_totals && (
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
                        <p className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                          <span className="mr-2 text-xl">📊</span>
                          Meal Plan Totals
                        </p>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div className="bg-white/60 rounded-xl p-3 shadow">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {Math.round(dietPlan.actual_totals.calories)}
                            </p>
                            <p className="text-xs text-gray-600 font-medium mt-1">calories</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3 shadow">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {dietPlan.actual_totals.protein}g
                            </p>
                            <p className="text-xs text-gray-600 font-medium mt-1">protein</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3 shadow">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {dietPlan.actual_totals.carbs}g
                            </p>
                            <p className="text-xs text-gray-600 font-medium mt-1">carbs</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-3 shadow">
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {dietPlan.actual_totals.fats}g
                            </p>
                            <p className="text-xs text-gray-600 font-medium mt-1">fats</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Generated Meals */}
                {dietPlan.meals && dietPlan.meals.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/40">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center">
                      <span className="mr-3 text-3xl">🍽️</span>
                      Your Meal Plan
                    </h3>
                    <div className="space-y-4">
                      {dietPlan.meals.map((meal, idx) => {
                        const mealTotal = meal.foods.reduce((sum, food) => ({
                          calories: sum.calories + food.calories,
                          protein: sum.protein + food.protein,
                          carbs: sum.carbs + food.carbs,
                          fats: sum.fats + food.fats
                        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

                        return (
                          <div key={idx} className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                            <div className="relative border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-green-400 transition-all shadow-lg hover:shadow-2xl">
                              <div 
                                className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 cursor-pointer hover:from-green-50 hover:to-emerald-50 transition-all"
                                onClick={() => toggleMealExpanded(meal.type)}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-bold text-xl flex items-center text-gray-900">
                                      <span className="mr-3 text-3xl">{getMealEmoji(meal.type)}</span>
                                      {meal.name}
                                    </h4>
                                    <p className="text-sm text-gray-600 capitalize mt-1 font-medium">{meal.type}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                      {Math.round(mealTotal.calories)}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">kcal</p>
                                    <p className="text-sm text-green-600 font-semibold mt-2 flex items-center">
                                      {expandedMeals[meal.type] ? '▼ Hide' : '▶ Show'} details
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {expandedMeals[meal.type] && (
                                <div className="p-6 bg-white">
                                  <div className="space-y-3 mb-6">
                                    {meal.foods.map((food, foodIdx) => (
                                      <div key={foodIdx} className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-green-50 hover:to-emerald-50 transition-all shadow hover:shadow-md">
                                        <div>
                                          <p className="font-semibold text-base text-gray-900">{food.name}</p>
                                          <p className="text-sm text-gray-600 font-medium">{food.quantity}{food.unit}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="font-bold text-lg text-gray-900">{food.calories} kcal</p>
                                          <p className="text-xs text-gray-600 font-medium">
                                            P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {meal.preparation && (
                                    <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-md">
                                      <p className="text-sm font-bold text-amber-900 mb-2 flex items-center">
                                        <span className="mr-2 text-xl">👨‍🍳</span> Preparation
                                      </p>
                                      <p className="text-sm text-amber-800 leading-relaxed">{meal.preparation}</p>
                                    </div>
                                  )}

                                  <div className="mt-6 pt-6 border-t-2 border-gray-200 grid grid-cols-4 gap-4 text-center">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 shadow">
                                      <p className="text-xs text-blue-700 font-semibold mb-1">Total Cal</p>
                                      <p className="font-bold text-lg text-blue-900">{Math.round(mealTotal.calories)}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 shadow">
                                      <p className="text-xs text-green-700 font-semibold mb-1">Protein</p>
                                      <p className="font-bold text-lg text-green-900">{mealTotal.protein.toFixed(1)}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 shadow">
                                      <p className="text-xs text-yellow-700 font-semibold mb-1">Carbs</p>
                                      <p className="font-bold text-lg text-yellow-900">{mealTotal.carbs.toFixed(1)}g</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 shadow">
                                      <p className="text-xs text-orange-700 font-semibold mb-1">Fats</p>
                                      <p className="font-bold text-lg text-orange-900">{mealTotal.fats.toFixed(1)}g</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {dietPlan.recommendations && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-300 p-6 shadow-xl">
                      <h4 className="font-bold text-green-900 mb-4 flex items-center text-lg">
                        <span className="mr-3 text-2xl">✅</span>
                        Nutrition Recommendations
                      </h4>
                      <ul className="space-y-3">
                        {dietPlan.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-green-800 text-sm flex items-start bg-white/50 p-3 rounded-xl">
                            <span className="text-green-500 mr-3 mt-0.5 text-xl">✓</span>
                            <span className="font-medium">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Workout Plan Tab */}
        {activeTab === 'workout' && (
          <div className="space-y-6">
            {!workoutPlan ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100">
                  <div className="text-8xl mb-6 animate-bounce">🏋️</div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    Generate Your Personalized Workout Plan
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                    Based on your profile, we'll create a custom workout routine.
                  </p>
                  <button
                    onClick={generateWorkoutPlan}
                    disabled={loading}
                    className="relative px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all disabled:opacity-50 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Generating...' : 'Generate Workout Plan'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/40">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
                        <span className="mr-3 text-4xl">💪</span>
                        {workoutPlan.plan_name}
                      </h3>
                      <p className="text-gray-600 mt-2 text-base font-medium">Duration: {workoutPlan.duration_weeks} weeks</p>
                    </div>
                    <button
                      onClick={generateWorkoutPlan}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      Regenerate
                    </button>
                  </div>

                  <div className="space-y-4">
                    {workoutPlan.weekly_schedule.map((day, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 hover:from-blue-50 hover:to-cyan-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-blue-300">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 shadow-lg">
                                {day.type === 'strength' ? '💪' : day.type === 'cardio' ? '🏃' : '🧘'}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-xl">
                                  Day {day.day}: {day.focus}
                                </h4>
                                <span className="text-sm text-gray-600 capitalize font-semibold bg-blue-100 px-3 py-1 rounded-full">{day.type}</span>
                              </div>
                            </div>
                          </div>
                          {day.exercises && day.exercises.length > 0 && (
                            <div className="mt-4 ml-20 space-y-2">
                              {day.exercises.map((ex, i) => (
                                <div key={i} className="flex items-center justify-between text-sm text-gray-700 bg-white/60 p-3 rounded-xl shadow">
                                  <div className="flex items-center">
                                    <span className="text-blue-500 mr-2 font-bold">•</span>
                                    <span className="font-medium">{ex.name}</span>
                                  </div>
                                  {ex.sets && <span className="text-gray-600 font-semibold">{ex.sets}x{ex.reps}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {workoutPlan.tips && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-xl">
                      <h4 className="font-bold text-amber-900 mb-4 flex items-center text-lg">
                        <span className="mr-3 text-2xl">💡</span>
                        Tips for Success
                      </h4>
                      <ul className="space-y-3">
                        {workoutPlan.tips.map((tip, idx) => (
                          <li key={idx} className="text-amber-800 text-sm flex items-start bg-white/50 p-3 rounded-xl">
                            <span className="text-amber-600 mr-3 mt-0.5 text-xl">★</span>
                            <span className="font-medium">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Calorie Calculator Tab */}
        {activeTab === 'calories' && (
          <div className="space-y-6">
            {!calorieData ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-16 text-center border border-gray-100">
                  <div className="text-8xl mb-6 animate-bounce">🔢</div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
                    Calculate Your Daily Calorie Needs
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                    Get accurate calorie recommendations based on your metrics.
                  </p>
                  <button
                    onClick={predictCalories}
                    disabled={loading}
                    className="relative px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-semibold transition-all disabled:opacity-50 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Calculating...' : 'Calculate Calories'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">🔥</div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Basal Metabolic Rate</p>
                          <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {Math.round(calorieData.bmr)}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">kcal/day at rest</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-white rounded-3xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">⚡</div>
                        <div>
                          <p className="text-sm text-gray-600 font-semibold">Total Daily Energy</p>
                          <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {Math.round(calorieData.tdee)}
                          </p>
                          <p className="text-sm text-gray-500 font-medium">kcal/day with activity</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 border border-white/40">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center text-xl">
                    <span className="mr-3 text-3xl">🎯</span>
                    Recommendations by Goal
                  </h4>
                  <div className="space-y-4">
                    {Object.entries(calorieData.recommended_calories).map(([goal, cals]) => (
                      <div key={goal} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        <div className="relative flex justify-between items-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:from-purple-50 hover:to-pink-50 transition-all shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-purple-300">
                          <span className="font-bold capitalize text-gray-800 text-lg flex items-center">
                            <span className="mr-3 text-2xl">
                              {goal === 'lose_weight' ? '📉' : goal === 'maintain' ? '⚖️' : '📈'}
                            </span>
                            {goal.replace('_', ' ')}
                          </span>
                          <div className="text-right">
                            <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {cals}
                            </span>
                            <span className="text-sm text-gray-600 ml-2 font-medium">kcal/day</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={predictCalories}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all disabled:opacity-50 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100"
                >
                  {loading ? 'Recalculating...' : 'Recalculate'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AICoach;
