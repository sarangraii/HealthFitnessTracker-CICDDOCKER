import React, { useState } from 'react';
import { mealAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SmartMealForm = ({ foodDatabase, onClose }) => {
  const [mealType, setMealType] = useState('breakfast');
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Custom food form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    quantity: ''
  });

  const filteredFoods = foodDatabase.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setSearchTerm(food.name);
    setShowDropdown(false);
    setQuantity('100');
  };

  const handleAddFood = () => {
    if (!selectedFood || !quantity) {
      toast.error('Please search and select a food, then enter quantity');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (quantityNum <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    const multiplier = quantityNum / 100;

    setFoods([...foods, {
      name: selectedFood.name,
      quantity: quantityNum,
      unit: 'g',
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fats: Math.round(selectedFood.fats * multiplier * 10) / 10
    }]);

    setSearchTerm('');
    setSelectedFood(null);
    setQuantity('');
    toast.success('Food added!');
  };

  const handleAddCustomFood = () => {
    const { name, calories, protein, carbs, fats, quantity } = customFood;
    
    // Validation
    if (!name || !calories || !quantity) {
      toast.error('Please enter at least food name, calories, and quantity');
      return;
    }

    const caloriesNum = parseFloat(calories);
    const quantityNum = parseFloat(quantity);
    const proteinNum = parseFloat(protein) || 0;
    const carbsNum = parseFloat(carbs) || 0;
    const fatsNum = parseFloat(fats) || 0;

    if (caloriesNum <= 0 || quantityNum <= 0) {
      toast.error('Calories and quantity must be greater than 0');
      return;
    }

    setFoods([...foods, {
      name: name,
      quantity: quantityNum,
      unit: 'g',
      calories: Math.round(caloriesNum),
      protein: Math.round(proteinNum * 10) / 10,
      carbs: Math.round(carbsNum * 10) / 10,
      fats: Math.round(fatsNum * 10) / 10
    }]);

    // Reset custom form
    setCustomFood({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      quantity: ''
    });
    setShowCustomForm(false);
    toast.success('Custom food added!');
  };

  const handleRemoveFood = (index) => {
    setFoods(foods.filter((_, i) => i !== index));
    toast.success('Food removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (foods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setLoading(true);
    try {
      await mealAPI.create({
        type: mealType,
        foods,
        notes: notes || undefined
      });
      toast.success('Meal logged successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Meal creation error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to log meal';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
  const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
  const totalFats = foods.reduce((sum, f) => sum + f.fats, 0);

  const getMealIcon = (type) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[type] || '🍽️';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <span className="mr-3 text-4xl animate-bounce">🍽️</span>
                  Log New Meal
                </h2>
                <p className="text-green-100 text-sm mt-2">Search foods or add custom items</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white text-3xl w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2 text-xl">🕐</span>
              Meal Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`relative group p-5 rounded-xl border-2 transition-all transform hover:scale-105 ${
                    mealType === type
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-2">{getMealIcon(type)}</div>
                  <div className="text-xs font-bold capitalize">{type}</div>
                  {mealType === type && (
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-20"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Calculated Totals */}
          {foods.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center">
                  <span className="mr-3 text-2xl">📊</span>
                  Meal Totals
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Calories</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{totalCalories}</p>
                      <p className="text-xs text-gray-500 font-medium">kcal</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Protein</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{totalProtein.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 font-medium">grams</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Carbs</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{totalCarbs.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 font-medium">grams</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Fats</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">{totalFats.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 font-medium">grams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Food Input */}
          {!showCustomForm && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-gray-900 flex items-center">
                    <span className="mr-2 text-xl">🔍</span>
                    Search Foods from Database
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCustomForm(true)}
                    className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    + Add Custom Food
                  </button>
                </div>
                <div className="relative">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pl-12 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                        placeholder="Search for food..."
                      />
                      <span className="absolute left-4 top-3 text-gray-400 text-xl">🔍</span>
                      
                      {/* Dropdown */}
                      {showDropdown && searchTerm && filteredFoods.length > 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                          {filteredFoods.slice(0, 10).map((food) => (
                            <button
                              key={food.name}
                              type="button"
                              onClick={() => handleSelectFood(food)}
                              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all border-b border-gray-100 last:border-b-0"
                            >
                              <p className="font-bold text-gray-900 text-sm">{food.name}</p>
                              <p className="text-xs text-gray-600 font-medium">
                                {food.calories} cal • P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g (per 100g)
                              </p>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results message */}
                      {showDropdown && searchTerm && filteredFoods.length === 0 && (
                        <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4">
                          <p className="text-sm text-gray-600 text-center font-medium">
                            No foods found. Try a different search or{' '}
                            <button
                              type="button"
                              onClick={() => setShowCustomForm(true)}
                              className="text-green-600 hover:text-green-700 font-bold"
                            >
                              add a custom food
                            </button>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="Grams"
                      min="1"
                      step="1"
                    />
                    
                    <button
                      type="button"
                      onClick={handleAddFood}
                      disabled={!selectedFood || !quantity}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Food Form */}
          {showCustomForm && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-gray-900 flex items-center">
                    <span className="mr-2 text-xl">➕</span>
                    Add Custom Food
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomFood({
                        name: '',
                        calories: '',
                        protein: '',
                        carbs: '',
                        fats: '',
                        quantity: ''
                      });
                    }}
                    className="text-xs text-gray-600 hover:text-gray-900 bg-white px-3 py-2 rounded-lg font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Food Name *</label>
                    <input
                      type="text"
                      value={customFood.name}
                      onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="e.g., Homemade Pizza"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Calories *</label>
                    <input
                      type="number"
                      value={customFood.calories}
                      onChange={(e) => setCustomFood({...customFood, calories: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="kcal"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Quantity (g) *</label>
                    <input
                      type="number"
                      value={customFood.quantity}
                      onChange={(e) => setCustomFood({...customFood, quantity: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="grams"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Protein (g)</label>
                    <input
                      type="number"
                      value={customFood.protein}
                      onChange={(e) => setCustomFood({...customFood, protein: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="Optional"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Carbs (g)</label>
                    <input
                      type="number"
                      value={customFood.carbs}
                      onChange={(e) => setCustomFood({...customFood, carbs: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="Optional"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Fats (g)</label>
                    <input
                      type="number"
                      value={customFood.fats}
                      onChange={(e) => setCustomFood({...customFood, fats: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                      placeholder="Optional"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomFood}
                  className="w-full mt-5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-sm transform hover:scale-105"
                >
                  Add Custom Food
                </button>
              </div>
            </div>
          )}

          {/* Added Foods List */}
          {foods.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 flex items-center">
                <span className="mr-2 text-xl">📋</span>
                Foods Added ({foods.length})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {foods.map((food, index) => (
                  <div key={index} className="relative group/food">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-0 group-hover/food:opacity-20 transition-opacity"></div>
                    <div className="relative flex items-center justify-between bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all shadow-md hover:shadow-lg">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">{food.name}</p>
                        <div className="flex gap-4 text-xs text-gray-600 mt-2 font-medium">
                          <span>{food.quantity}g</span>
                          <span className="font-bold text-orange-600">{food.calories} cal</span>
                          <span>P: {food.protein}g</span>
                          <span>C: {food.carbs}g</span>
                          <span>F: {food.fats}g</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFood(index)}
                        className="text-red-500 hover:text-white hover:bg-red-500 font-bold px-4 py-2 rounded-xl transition-all text-xs shadow-sm hover:shadow-md"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center">
                <span className="mr-2 text-xl">📝</span>
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                rows="3"
                placeholder="How did you feel? Any observations?"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 text-sm shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || foods.length === 0}
              className="flex-1 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-sm transform hover:scale-105 disabled:scale-100"
            >
              {loading ? 'Logging...' : `Log ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-6 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-5 shadow-lg">
            <p className="text-sm text-gray-700 font-medium">
              <span className="font-bold text-blue-900 flex items-center mb-2">
                <span className="mr-2 text-xl">💡</span>
                Quick Tip
              </span>
              Search from our database or add your own custom foods with nutritional info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartMealForm;