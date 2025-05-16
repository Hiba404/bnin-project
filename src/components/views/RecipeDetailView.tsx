// src/components/views/RecipeDetailView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Heart, Play, Bookmark, Users, Award } from 'lucide-react';
import { useBnin } from '@/context/BninContext';

interface RecipeDetailViewProps {
  navigate: (view: string, params?: Record<string, string>) => void;
}

const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({ navigate: propNavigate }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { 
    currentRecipe, 
    toggleFavorite, 
    isFavorite, 
    navigate: contextNavigate,
    fetchRecipeById
  } = useBnin();
  
  const navigate = contextNavigate || propNavigate;
  
  // Parse recipe servings
  const servings = currentRecipe?.servings || 2;
  
  // Handle favorite toggle
  const handleToggleFavorite = () => {
    if (currentRecipe) {
      toggleFavorite(currentRecipe.id);
    }
  };
  
  // Loading state
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // Error state if no recipe
  if (!currentRecipe) {
    return (
      <div className="max-w-md md:max-w-4xl mx-auto p-4 text-center">
        <p className="text-amber-800 mb-4">Recipe not found.</p>
        <button 
          onClick={() => navigate('home')}
          className="px-4 py-2 bg-amber-500 text-white rounded-md"
          aria-label="Go to home page"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('recipeResults')} 
            className="mr-3"
            aria-label="Back to recipe results"
          >
            <ArrowLeft size={24} className="text-amber-700" aria-hidden="true" />
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-amber-800 truncate">
            {currentRecipe.name}
          </h1>
        </div>
        
        {/* Favorite Button */}
        <button 
          className="bg-white rounded-full p-2 shadow-md"
          onClick={handleToggleFavorite}
          aria-label={isFavorite(currentRecipe.id) ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite(currentRecipe.id)}
        >
          <Heart 
            size={24} 
            className={isFavorite(currentRecipe.id) ? "text-red-500 fill-red-500" : "text-amber-500"} 
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="md:flex md:gap-8">
        {/* Left Column (Image and Recipe Info) */}
        <div className="md:w-1/2">
          {/* Recipe Image */}
          <div className="relative h-56 md:h-80 rounded-xl overflow-hidden mb-6">
            <img 
              src={currentRecipe.imageUrl} 
              alt={`${currentRecipe.name} dish`}
              className="w-full h-full object-cover"
            />
            
            {/* Cuisine Tag if available */}
            {currentRecipe.cuisineType && (
              <div className="absolute top-3 left-3 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm text-amber-800">
                {currentRecipe.cuisineType}
              </div>
            )}
          </div>

          {/* Recipe Quick Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Time Card */}
            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <Clock size={24} className="mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Cooking Time</p>
              <p className="font-medium text-amber-800">{currentRecipe.cookTime}</p>
            </div>
            
            {/* Servings Card */}
            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <Users size={24} className="mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Servings</p>
              <p className="font-medium text-amber-800">{servings}</p>
            </div>
            
            {/* Difficulty Card */}
            <div className="bg-white p-3 rounded-xl shadow-sm text-center">
              <Award size={24} className="mx-auto mb-1 text-amber-500" />
              <p className="text-xs text-gray-500">Difficulty</p>
              <p className="font-medium text-amber-800">{currentRecipe.difficulty}</p>
            </div>
          </div>
          
          {/* Nutrition Information */}
          {currentRecipe.nutrition && (
            <div className="bg-white rounded-xl p-4 shadow-md mb-6">
              <h2 className="font-bold text-lg text-amber-800 mb-3">Nutrition (per serving)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Calories</p>
                  <p className="font-bold text-amber-800">{currentRecipe.nutrition.calories}</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Protein</p>
                  <p className="font-bold text-amber-800">{currentRecipe.nutrition.protein}</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Carbs</p>
                  <p className="font-bold text-amber-800">{currentRecipe.nutrition.carbs}</p>
                </div>
                <div className="bg-amber-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Fat</p>
                  <p className="font-bold text-amber-800">{currentRecipe.nutrition.fat}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Ingredients and Description) */}
        <div className="md:w-1/2">
          {/* Description */}
          {currentRecipe.description && (
            <div className="mb-6 bg-white rounded-xl p-4 shadow-md">
              <h2 className="font-bold text-lg text-amber-800 mb-2">About this Recipe</h2>
              <div 
                className="text-gray-700 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: currentRecipe.description }}
              />
            </div>
          )}

          {/* Ingredients */}
          // Continue from previous code for RecipeDetailView.tsx

{/* Ingredients */}
<div className="mb-6">
  <h2 className="text-lg font-bold text-amber-800 mb-3">Ingredients</h2>
  <div className="bg-white rounded-xl p-4 shadow-md">
    <ul className="space-y-2">
      {currentRecipe.ingredients.map((ingredient) => (
        <li key={ingredient.id} className="flex items-center">
          <div className="w-6 h-6 bg-amber-100 rounded-full mr-3 flex items-center justify-center text-amber-800" aria-hidden="true">•</div>
          <span className="text-gray-700">
            {ingredient.quantity} {ingredient.unit} {ingredient.name}
          </span>
        </li>
      ))}
    </ul>
  </div>
</div>
</div>
</div>

{/* Instructions - Full width on both layouts */}
<div className="mb-6">
<h2 className="text-lg md:text-xl font-bold text-amber-800 mb-3">Instructions</h2>
<div className="bg-white rounded-xl p-4 md:p-6 shadow-md">
<ol className="space-y-4 md:space-y-6">
  {currentRecipe.instructions.map((instruction, index) => (
    <li key={`instruction-${index}`} className="flex">
      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center mr-3 flex-shrink-0">
        {index + 1}
      </div>
      <div>
        <p className="text-gray-700 md:text-lg">{instruction}</p>
      </div>
    </li>
  ))}
</ol>
</div>
</div>

{/* Action Buttons */}
<div className="grid grid-cols-2 gap-4 mb-6">
<button
className="py-3 rounded-xl font-medium text-white bg-amber-500 hover:bg-amber-600 flex items-center justify-center"
aria-label="Start cooking this recipe"
>
<Play size={20} className="mr-2" />
Start Cooking
</button>

<button
className="py-3 rounded-xl font-medium border-2 border-amber-500 text-amber-700 hover:bg-amber-50 flex items-center justify-center"
aria-label="Save recipe"
onClick={handleToggleFavorite}
>
<Bookmark size={20} className="mr-2" />
{isFavorite(currentRecipe.id) ? 'Saved' : 'Save Recipe'}
</button>
</div>
</div>
);
};

export default RecipeDetailView;