// RecipeResultsView.tsx - Updated for responsive design
'use client';

import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useBnin } from '@/context/BninContext';
import { Recipe } from '@/types'; // You may need to adjust this import path

interface RecipeResultsViewProps {
  navigate: (view: string, params?: Record<string, string>) => void;
}

const RecipeResultsView: React.FC<RecipeResultsViewProps> = ({ navigate }) => {
  const { selectedIngredients, selectedMood, setCurrentRecipe } = useBnin();

  // Sample recipes data - in a real app, you would get this from your context or API
  const recipes = [
    {
      id: '1',
      name: 'Chicken Stir Fry',
      imageUrl: '/images/recipes/chicken-stir-fry.jpg',
      prepTime: '25 mins',
      difficulty: 'Easy',
      ingredients: ['chicken', 'bell peppers', 'onions', 'soy sauce'],
      missingIngredients: 0
    },
    {
      id: '2',
      name: 'Pasta Primavera',
      imageUrl: '/images/recipes/pasta-primavera.jpg',
      prepTime: '20 mins',
      difficulty: 'Easy',
      ingredients: ['pasta', 'tomatoes', 'zucchini', 'olive oil'],
      missingIngredients: 1
    }
  ];

  // Handle recipe click
  const handleRecipeClick = (recipe: any) => {
    // Set current recipe in context (if available)
    if (setCurrentRecipe) {
      setCurrentRecipe(recipe);
    }
    
    // Navigate to recipe detail page
    navigate('recipeDetail', { recipeId: recipe.id });
  };

  return (
    <div className="max-w-md md:max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('home')} className="mr-3">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          {selectedMood ? `${selectedMood.name} Recipes` : 'Recipes For You'}
        </h1>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">{recipes.length} recipes found</p>
        
        {selectedIngredients.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            <span className="text-xs text-gray-500">Using: </span>
            {selectedIngredients.map((ingredient, index) => (
              <span key={ingredient.id} className="text-xs text-gray-500">
                {ingredient.name}{index < selectedIngredients.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipe List - Grid on desktop */}
      <div className="md:grid md:grid-cols-2 md:gap-6 space-y-4 md:space-y-0">
        {recipes.map((recipe) => (
          <div 
            key={recipe.id} 
            className="bg-white rounded-xl overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleRecipeClick(recipe)}
          >
            <div className="h-48 md:h-56 bg-gray-200">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 md:p-5">
              <h3 className="font-bold text-lg md:text-xl text-gray-800 mb-2">{recipe.name}</h3>
              
              <div className="flex items-center mb-3">
                <Clock size={16} className="text-gray-500 mr-1" />
                <span className="text-gray-600 text-sm mr-3">{recipe.prepTime}</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {recipe.difficulty}
                </span>
              </div>
              
              <div>
                <p className="text-sm md:text-base text-gray-600 mb-2">Main ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <span 
                      key={index} 
                      className="text-xs md:text-sm bg-gray-100 rounded-full px-2 py-1 text-gray-700"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
              
              {recipe.missingIngredients > 0 && (
                <div className="mt-3 text-xs md:text-sm text-orange-600">
                  Missing {recipe.missingIngredients} ingredient{recipe.missingIngredients > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeResultsView;