import React, { useState, useEffect } from 'react';
import { mealAPI, aiAPI } from '../../services/api';
import SmartMealForm from './SmartMealForm';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

const BeautifulMealTracker = () => {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [foodDatabase, setFoodDatabase] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
    fetchFoodDatabase();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const response = await mealAPI.getAll({ 
        start_date: todayStr,
        end_date: todayStr 
      });
      
      const mealsData = Array.isArray(response.data) ? response.data : [];
      setMeals(mealsData);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
      toast.error('Failed to fetch meals');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodDatabase = async () => {
    try {
      const response = await aiAPI.getFoodDatabase();
      setFoodDatabase(response.data.foods || []);
    } catch (error) {
      console.error('Failed to fetch food database:', error);
      setFoodDatabase([]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await mealAPI.delete(id);
        toast.success('Meal deleted');
        fetchMeals();
      } catch (error) {
        console.error('Failed to delete meal:', error);
        toast.error('Failed to delete meal');
      }
    }
  };

  const dailyStats = meals.reduce((acc, meal) => ({
    totalCalories: acc.totalCalories + (meal.total_calories || 0),
    totalProtein: acc.totalProtein + (meal.total_protein || 0),
    totalCarbs: acc.totalCarbs + (meal.total_carbs || 0),
    totalFats: acc.totalFats + (meal.total_fats || 0)
  }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });

  const getMealIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600 mx-auto mb-4 shadow-xl"></div>
          </div>
          <p className="text-gray-700 text-base font-semibold">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with Gradient & Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
                  <span className="mr-3 text-5xl animate-pulse">🍽️</span>
                  Meals
                </h1>
                <p className="text-green-100 text-base">Track your daily nutrition</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="hidden md:block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/30"
              >
                Log New Meal
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Add Button */}
        <button
          onClick={() => setShowForm(true)}
          className="md:hidden w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-xl"
        >
          Log New Meal
        </button>

        {/* Smart Form */}
        {showForm && (
          <SmartMealForm
            foodDatabase={foodDatabase}
            onClose={() => {
              setShowForm(false);
              fetchMeals();
            }}
          />
        )}

        {/* Daily Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Calories</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{dailyStats.totalCalories}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">kcal</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🔥
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Protein</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{dailyStats.totalProtein.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">grams</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  💪
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Carbs</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{dailyStats.totalCarbs.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">grams</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🌾
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/40 hover:shadow-2xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Fats</p>
                  <p className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{dailyStats.totalFats.toFixed(0)}</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">grams</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🥑
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meals Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3 text-3xl">📊</span>
            Today's Meals
          </h2>

          {meals.length > 0 ? (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-white/40 hover:border-green-300">
                    <div className="flex">
                      {/* Icon Section */}
                      <div className="w-24 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border-r border-green-200">
                        <span className="text-5xl">{getMealIcon(meal.type)}</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 capitalize">
                              {meal.type}: {meal.foods && meal.foods.length > 0 ? meal.foods[0].name : 'Meal'}
                              {meal.foods && meal.foods.length > 1 && ` & ${meal.foods.length - 1} more`}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              {meal.date ? format(parseISO(meal.date), 'h:mm a') : 'Just now'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDelete(meal.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition p-2 rounded-lg"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Food Items */}
                        <div className="space-y-2 mb-3">
                          {meal.foods && meal.foods.slice(0, 3).map((food, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-green-50 p-2 rounded-lg font-medium">
                              <span>{food.name} • {food.quantity}g</span>
                              <span className="font-bold text-orange-600">{food.calories} kcal</span>
                            </div>
                          ))}
                          {meal.foods && meal.foods.length > 3 && (
                            <p className="text-xs text-gray-500 italic font-medium">+ {meal.foods.length - 3} more items</p>
                          )}
                        </div>

                        {/* Macros */}
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="text-blue-700 font-semibold">{(meal.total_protein || 0).toFixed(0)}g protein</span>
                          </div>
                          <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-green-700 font-semibold">{(meal.total_carbs || 0).toFixed(0)}g carbs</span>
                          </div>
                          <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="text-yellow-700 font-semibold">{(meal.total_fats || 0).toFixed(0)}g fats</span>
                          </div>
                        </div>

                        {/* Notes */}
                        {meal.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 italic font-medium">"{meal.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Calories Section */}
                      <div className="w-28 bg-gradient-to-br from-orange-50 to-red-50 flex flex-col items-center justify-center p-4 border-l border-orange-200">
                        <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{meal.total_calories || 0}</p>
                        <p className="text-xs text-gray-600 font-bold mt-1">kcal</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center border border-white/40">
                <div className="text-8xl mb-6 animate-bounce">🍽️</div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">No meals logged today</h3>
                <p className="text-gray-600 mb-8 text-base font-medium">Start tracking your nutrition journey!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl font-bold transition-all text-base shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Log Your First Meal
                </button>

                {/* Features */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">🔍</div>
                      <h4 className="font-bold text-gray-900 mb-2">Search Foods</h4>
                      <p className="text-sm text-gray-600 font-medium">Quickly find and add foods with smart search</p>
                    </div>
                  </div>
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">📊</div>
                      <h4 className="font-bold text-gray-900 mb-2">Auto-Calculate</h4>
                      <p className="text-sm text-gray-600 font-medium">Nutrition totals calculated automatically</p>
                    </div>
                  </div>
                  <div className="relative group/feature">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur opacity-10 group-hover/feature:opacity-20 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
                      <div className="text-4xl mb-3">📈</div>
                      <h4 className="font-bold text-gray-900 mb-2">Track Progress</h4>
                      <p className="text-sm text-gray-600 font-medium">Monitor daily calories and macros</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nutrition Tip */}
        {meals.length > 0 && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300 shadow-xl">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-base">
                <span className="text-2xl">💡</span>
                Daily Tip
              </h3>
              <p className="text-sm text-gray-700 font-medium">
                {dailyStats.totalProtein < 100 
                  ? "Try to include more protein in your meals for better muscle recovery and satiety."
                  : dailyStats.totalCalories < 1500
                  ? "Make sure you're eating enough to fuel your body properly!"
                  : "Great job tracking your meals! Consistency is key to reaching your goals."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeautifulMealTracker;

























// import React, { useState, useEffect } from 'react';
// import { mealAPI, aiAPI } from '../../services/api';
// import SmartMealForm from './SmartMealForm';
// import toast from 'react-hot-toast';
// import { format, parseISO } from 'date-fns';

// const BeautifulMealTracker = () => {
//   const [meals, setMeals] = useState([]);
//   const [showForm, setShowForm] = useState(false);
//   const [foodDatabase, setFoodDatabase] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchMeals();
//     fetchFoodDatabase();
//   }, []);

//   const fetchMeals = async () => {
//     try {
//       setLoading(true);
//       const today = new Date();
//       const todayStr = today.toISOString().split('T')[0];
      
//       const response = await mealAPI.getAll({ 
//         start_date: todayStr,
//         end_date: todayStr 
//       });
      
//       const mealsData = Array.isArray(response.data) ? response.data : [];
//       setMeals(mealsData);
//     } catch (error) {
//       console.error('Failed to fetch meals:', error);
//       toast.error('Failed to fetch meals');
//       setMeals([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchFoodDatabase = async () => {
//     try {
//       const response = await aiAPI.getFoodDatabase();
//       setFoodDatabase(response.data.foods || []);
//     } catch (error) {
//       console.error('Failed to fetch food database:', error);
//       setFoodDatabase([]);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this meal?')) {
//       try {
//         await mealAPI.delete(id);
//         toast.success('Meal deleted');
//         fetchMeals();
//       } catch (error) {
//         console.error('Failed to delete meal:', error);
//         toast.error('Failed to delete meal');
//       }
//     }
//   };

//   const dailyStats = meals.reduce((acc, meal) => ({
//     totalCalories: acc.totalCalories + (meal.total_calories || 0),
//     totalProtein: acc.totalProtein + (meal.total_protein || 0),
//     totalCarbs: acc.totalCarbs + (meal.total_carbs || 0),
//     totalFats: acc.totalFats + (meal.total_fats || 0)
//   }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });

//   const getMealIcon = (type) => {
//     const icons = {
//       breakfast: '🌅',
//       lunch: '☀️',
//       dinner: '🌙',
//       snack: '🍎'
//     };
//     return icons[type] || '🍽️';
//   };

//   const getMealImage = (meal) => {
//     // Generate gradient based on meal type
//     const gradients = {
//       breakfast: 'from-orange-400 to-pink-400',
//       lunch: 'from-green-400 to-blue-400',
//       dinner: 'from-purple-400 to-indigo-400',
//       snack: 'from-yellow-400 to-orange-400'
//     };
//     return gradients[meal.type] || 'from-gray-400 to-gray-500';
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading meals...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-4xl font-bold text-gray-900">Meals</h1>
//           <p className="text-gray-600 mt-1">Track your daily nutrition</p>
//         </div>
//         <button
//           onClick={() => setShowForm(true)}
//           className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
//         >
//           <span className="text-xl">+</span>
//           Log New Meal
//         </button>
//       </div>

//       {/* Smart Form */}
//       {showForm && (
//         <SmartMealForm
//           foodDatabase={foodDatabase}
//           onClose={() => {
//             setShowForm(false);
//             fetchMeals();
//           }}
//         />
//       )}

//       {/* Daily Stats Banner */}
//       <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
//         <div className="flex justify-between items-center">
//           <div>
//             <p className="text-blue-100 text-sm font-medium mb-1">Today</p>
//             <p className="text-4xl font-bold">{dailyStats.totalCalories} <span className="text-2xl">kcal</span></p>
//           </div>
//           <div className="flex gap-6">
//             <div className="text-center">
//               <p className="text-blue-100 text-xs mb-1">Protein</p>
//               <p className="text-2xl font-bold">{dailyStats.totalProtein.toFixed(0)}g</p>
//             </div>
//             <div className="text-center">
//               <p className="text-blue-100 text-xs mb-1">Carbs</p>
//               <p className="text-2xl font-bold">{dailyStats.totalCarbs.toFixed(0)}g</p>
//             </div>
//             <div className="text-center">
//               <p className="text-blue-100 text-xs mb-1">Fats</p>
//               <p className="text-2xl font-bold">{dailyStats.totalFats.toFixed(0)}g</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Meals Section */}
//       <div>
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-bold text-gray-900">Today</h2>
//           <p className="text-gray-600">{dailyStats.totalCalories} kcal • {dailyStats.totalCalories > 2000 ? `${dailyStats.totalCalories - 2000} over` : `${2000 - dailyStats.totalCalories} left`}</p>
//         </div>

//         {meals.length > 0 ? (
//           <div className="space-y-4">
//             {meals.map((meal) => (
//               <div
//                 key={meal.id}
//                 className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100"
//               >
//                 <div className="flex">
//                   {/* Image/Icon Section */}
//                   <div className={`w-24 bg-gradient-to-br ${getMealImage(meal)} flex items-center justify-center`}>
//                     <span className="text-5xl">{getMealIcon(meal.type)}</span>
//                   </div>

//                   {/* Content Section */}
//                   <div className="flex-1 p-5">
//                     <div className="flex justify-between items-start mb-3">
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900 capitalize">
//                           {meal.type}: {meal.foods && meal.foods.length > 0 ? meal.foods[0].name : 'Meal'}
//                           {meal.foods && meal.foods.length > 1 && ` & ${meal.foods.length - 1} more`}
//                         </h3>
//                         <p className="text-sm text-gray-500 mt-1">
//                           {meal.date ? format(parseISO(meal.date), 'h:mm a') : 'Just now'}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => handleDelete(meal.id)}
//                         className="text-gray-400 hover:text-red-500 transition"
//                       >
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                         </svg>
//                       </button>
//                     </div>

//                     {/* Food Items */}
//                     <div className="space-y-1 mb-3">
//                       {meal.foods && meal.foods.slice(0, 3).map((food, idx) => (
//                         <div key={idx} className="flex justify-between text-sm text-gray-600">
//                           <span>{food.name} • {food.quantity}g</span>
//                           <span className="font-medium">{food.calories} kcal</span>
//                         </div>
//                       ))}
//                       {meal.foods && meal.foods.length > 3 && (
//                         <p className="text-xs text-gray-500 italic">+ {meal.foods.length - 3} more items</p>
//                       )}
//                     </div>

//                     {/* Macros */}
//                     <div className="flex gap-4 text-sm">
//                       <div className="flex items-center gap-1">
//                         <span className="w-2 h-2 rounded-full bg-blue-500"></span>
//                         <span className="text-gray-600">{(meal.total_protein || 0).toFixed(0)}g protein</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <span className="w-2 h-2 rounded-full bg-green-500"></span>
//                         <span className="text-gray-600">{(meal.total_carbs || 0).toFixed(0)}g carbs</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
//                         <span className="text-gray-600">{(meal.total_fats || 0).toFixed(0)}g fats</span>
//                       </div>
//                     </div>

//                     {/* Notes */}
//                     {meal.notes && (
//                       <div className="mt-3 pt-3 border-t border-gray-100">
//                         <p className="text-sm text-gray-600 italic">"{meal.notes}"</p>
//                       </div>
//                     )}
//                   </div>

//                   {/* Calories Section */}
//                   <div className="w-32 bg-gray-50 flex flex-col items-center justify-center p-4 border-l border-gray-100">
//                     <p className="text-3xl font-bold text-gray-900">{meal.total_calories || 0}</p>
//                     <p className="text-xs text-gray-500 uppercase tracking-wide">kcal</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           // Empty State
//           <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
//             <div className="text-6xl mb-4">🍽️</div>
//             <h3 className="text-2xl font-bold text-gray-900 mb-2">No meals logged today</h3>
//             <p className="text-gray-600 mb-6">Start tracking your nutrition journey!</p>
//             <button
//               onClick={() => setShowForm(true)}
//               className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
//             >
//               <span className="text-xl">+</span>
//               Log Your First Meal
//             </button>

//             {/* Features */}
//             <div className="mt-12 grid grid-cols-3 gap-6 text-left">
//               <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
//                 <div className="text-3xl mb-2">🔍</div>
//                 <h4 className="font-semibold text-gray-900 mb-1">Search Foods</h4>
//                 <p className="text-xs text-gray-600">Quickly find and add foods with smart search</p>
//               </div>
//               <div className="bg-green-50 rounded-xl p-4 border border-green-100">
//                 <div className="text-3xl mb-2">📊</div>
//                 <h4 className="font-semibold text-gray-900 mb-1">Auto-Calculate</h4>
//                 <p className="text-xs text-gray-600">Nutrition totals calculated automatically</p>
//               </div>
//               <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
//                 <div className="text-3xl mb-2">📈</div>
//                 <h4 className="font-semibold text-gray-900 mb-1">Track Progress</h4>
//                 <p className="text-xs text-gray-600">Monitor daily calories and macros</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Nutrition Tips */}
//       {meals.length > 0 && (
//         <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
//           <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
//             <span>💡</span>
//             Daily Tip
//           </h3>
//           <p className="text-sm text-gray-700">
//             {dailyStats.totalProtein < 100 
//               ? "Try to include more protein in your meals for better muscle recovery and satiety."
//               : dailyStats.totalCalories < 1500
//               ? "Make sure you're eating enough to fuel your body properly!"
//               : "Great job tracking your meals! Consistency is key to reaching your goals."}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BeautifulMealTracker;