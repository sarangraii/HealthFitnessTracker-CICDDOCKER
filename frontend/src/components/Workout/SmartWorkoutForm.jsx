import React, { useState, useEffect } from 'react';
import { workoutAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SmartWorkoutForm = ({ onClose, userId }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    unit: 'lbs'
  });
  
  const [autoCalculated, setAutoCalculated] = useState({
    totalDuration: 0,
    caloriesBurned: 0,
    workoutType: 'strength',
    intensity: 'moderate'
  });

  const [notes, setNotes] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Exercise database with MET values (Metabolic Equivalent of Task)
  const exerciseDatabase = {
    // Strength Training (MET values)
    'bench press': { met: 6.0, type: 'strength', avgTime: 3 },
    'squat': { met: 6.0, type: 'strength', avgTime: 3 },
    'deadlift': { met: 6.0, type: 'strength', avgTime: 3 },
    'overhead press': { met: 5.5, type: 'strength', avgTime: 3 },
    'bicep curl': { met: 3.5, type: 'strength', avgTime: 2 },
    'tricep extension': { met: 3.5, type: 'strength', avgTime: 2 },
    'lat pulldown': { met: 5.0, type: 'strength', avgTime: 2.5 },
    'leg press': { met: 5.5, type: 'strength', avgTime: 3 },
    'pull-up': { met: 8.0, type: 'strength', avgTime: 2 },
    'push-up': { met: 3.8, type: 'strength', avgTime: 2 },
    'plank': { met: 4.0, type: 'strength', avgTime: 1 },
    'lunge': { met: 4.0, type: 'strength', avgTime: 2 },
    'dumbbell press': { met: 5.5, type: 'strength', avgTime: 3 },
    'cable row': { met: 5.0, type: 'strength', avgTime: 2.5 },
    
    // Cardio (MET values)
    'running': { met: 9.8, type: 'cardio', avgTime: 30 },
    'jogging': { met: 7.0, type: 'cardio', avgTime: 30 },
    'cycling': { met: 8.0, type: 'cardio', avgTime: 30 },
    'swimming': { met: 8.0, type: 'cardio', avgTime: 30 },
    'jump rope': { met: 12.3, type: 'cardio', avgTime: 10 },
    'rowing': { met: 7.0, type: 'cardio', avgTime: 20 },
    'elliptical': { met: 5.0, type: 'cardio', avgTime: 30 },
    'stairs': { met: 8.8, type: 'cardio', avgTime: 15 },
    'burpee': { met: 8.0, type: 'cardio', avgTime: 5 },
    'mountain climber': { met: 8.0, type: 'cardio', avgTime: 5 },
    
    // Default for unknown exercises
    'default': { met: 5.0, type: 'strength', avgTime: 3 }
  };

  // Calculate everything when exercises change
  useEffect(() => {
    if (exercises.length > 0) {
      calculateWorkoutStats();
    }
  }, [exercises]);

  const findExerciseData = (exerciseName) => {
    const name = exerciseName.toLowerCase();
    
    // Try exact match first
    if (exerciseDatabase[name]) {
      return exerciseDatabase[name];
    }
    
    // Try partial match
    for (const [key, value] of Object.entries(exerciseDatabase)) {
      if (name.includes(key) || key.includes(name)) {
        return value;
      }
    }
    
    // Return default
    return exerciseDatabase['default'];
  };

  const calculateWorkoutStats = () => {
    let totalDuration = 0;
    let totalCalories = 0;
    let typeCounter = { strength: 0, cardio: 0, flexibility: 0 };
    
    // User weight (use default if not available)
    const userWeight = user?.weight || 70; // kg
    
    exercises.forEach(exercise => {
      const exerciseData = findExerciseData(exercise.name);
      
      // Calculate duration for this exercise
      const setsTime = exercise.sets * exerciseData.avgTime;
      const restTime = exercise.sets * 1;
      const exerciseDuration = setsTime + restTime;
      
      // Calculate calories using MET formula
      const exerciseCalories = exerciseData.met * userWeight * (exerciseDuration / 60);
      
      totalDuration += exerciseDuration;
      totalCalories += exerciseCalories;
      typeCounter[exerciseData.type]++;
    });
    
    // Determine workout type (majority wins)
    const workoutType = Object.keys(typeCounter).reduce((a, b) => 
      typeCounter[a] > typeCounter[b] ? a : b
    );
    
    // Determine intensity based on average MET
    const avgMET = exercises.reduce((sum, ex) => {
      return sum + findExerciseData(ex.name).met;
    }, 0) / exercises.length;
    
    let intensity = 'moderate';
    if (avgMET > 8) intensity = 'high';
    else if (avgMET < 5) intensity = 'low';
    
    setAutoCalculated({
      totalDuration: Math.round(totalDuration),
      caloriesBurned: Math.round(totalCalories),
      workoutType,
      intensity
    });
  };

  const addExercise = () => {
    if (!currentExercise.name || !currentExercise.sets || !currentExercise.reps) {
      toast.error('Please fill in exercise name, sets, and reps');
      return;
    }

    const exercise = {
      name: currentExercise.name,
      sets: parseInt(currentExercise.sets),
      reps: parseInt(currentExercise.reps),
      ...(currentExercise.weight && {
        weight: parseFloat(currentExercise.weight),
        unit: currentExercise.unit
      })
    };

    setExercises([...exercises, exercise]);
    
    // Reset form
    setCurrentExercise({
      name: '',
      sets: '',
      reps: '',
      weight: '',
      unit: 'lbs'
    });

    toast.success('Exercise added!');
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
    toast.success('Exercise removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    setIsCalculating(true);

    const workoutData = {
      user_id: userId,
      title: `${autoCalculated.workoutType.charAt(0).toUpperCase() + autoCalculated.workoutType.slice(1)} Workout`,
      date: new Date().toISOString(),
      type: autoCalculated.workoutType,
      duration: autoCalculated.totalDuration,
      calories_burned: autoCalculated.caloriesBurned,
      exercises: exercises,
      notes: notes || `${autoCalculated.intensity.charAt(0).toUpperCase() + autoCalculated.intensity.slice(1)} intensity workout`
    };

    try {
      await workoutAPI.create(workoutData);
      toast.success('Workout logged successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to log workout');
    } finally {
      setIsCalculating(false);
    }
  };

  const getIntensityColor = (intensity) => {
    switch(intensity) {
      case 'high': return 'text-red-600 bg-gradient-to-r from-red-50 to-orange-50';
      case 'moderate': return 'text-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50';
      case 'low': return 'text-green-600 bg-gradient-to-r from-green-50 to-emerald-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'strength': return '💪';
      case 'cardio': return '🏃';
      case 'flexibility': return '🧘';
      default: return '🏋️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center">
                  <span className="mr-3 text-4xl animate-bounce">🏋️</span>
                  Log Workout
                </h2>
                <p className="text-purple-100 text-sm mt-2">Just add exercises - we'll calculate everything!</p>
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
          
          {/* Auto-Calculated Stats */}
          {exercises.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                  <span className="mr-3 text-2xl">✨</span>
                  Auto-Calculated Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Type</p>
                      <p className="text-2xl font-bold text-gray-900 capitalize">
                        {getTypeIcon(autoCalculated.workoutType)} {autoCalculated.workoutType}
                      </p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Duration</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        {autoCalculated.totalDuration}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">mins</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Calories</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        {autoCalculated.caloriesBurned}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">kcal</p>
                    </div>
                  </div>
                  <div className="relative group/card">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl blur opacity-20 group-hover/card:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white rounded-xl p-4 text-center shadow-md hover:shadow-xl transition-all transform hover:scale-105">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">Intensity</p>
                      <p className={`text-sm font-bold px-4 py-2 rounded-full inline-block ${getIntensityColor(autoCalculated.intensity)} shadow`}>
                        {autoCalculated.intensity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Exercise Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
                <span className="mr-3 text-2xl">💪</span>
                Add Exercises
              </h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={currentExercise.name}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  placeholder="Exercise name (e.g., Bench Press, Running, Squats)"
                />
                
                <div className="grid grid-cols-4 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    placeholder="Sets"
                  />
                  <input
                    type="number"
                    min="1"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    placeholder="Reps"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={currentExercise.weight}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                    placeholder="Weight"
                  />
                  <select
                    value={currentExercise.unit}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, unit: e.target.value })}
                    className="border-2 border-gray-200 rounded-xl px-3 py-3 focus:ring-2 focus:ring-purple-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={addExercise}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  + Add Exercise
                </button>
              </div>

              {/* Exercises List */}
              {exercises.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-bold text-gray-900 flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2 text-xl">📋</span>
                      Added Exercises ({exercises.length})
                    </span>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      Stats auto-update
                    </span>
                  </h4>
                  {exercises.map((exercise, index) => {
                    const exerciseData = findExerciseData(exercise.name);
                    return (
                      <div key={index} className="relative group/exercise">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl blur opacity-0 group-hover/exercise:opacity-20 transition-opacity"></div>
                        <div className="relative flex justify-between items-center bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-gray-100 hover:border-purple-300">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{exercise.name}</p>
                            <p className="text-xs text-gray-600 font-medium mt-1">
                              {exercise.sets} sets × {exercise.reps} reps
                              {exercise.weight && ` @ ${exercise.weight} ${exercise.unit}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <span className="mr-1">{getTypeIcon(exerciseData.type)}</span>
                              {exerciseData.type} • MET: {exerciseData.met}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="text-red-500 hover:text-white hover:bg-red-500 font-bold px-4 py-2 rounded-xl transition-all text-xs shadow-sm hover:shadow-md"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                rows="3"
                placeholder="How did the workout feel? Any observations?"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={exercises.length === 0 || isCalculating}
              className="flex-1 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100"
            >
              {isCalculating ? 'Logging...' : `Log Workout (${autoCalculated.caloriesBurned} cal)`}
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
                Smart Calculations
              </span>
              Duration and calories are calculated based on exercise type, intensity (MET values), your weight, and estimated rest periods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartWorkoutForm;