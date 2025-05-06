'use client';

import React from 'react';
import { ArrowLeft, Clock, Heart, Play } from 'lucide-react';
import { useBnin } from '@/context/BninContext';

// Define TypeScript interfaces
interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
}

interface BninContextValue {
  currentRecipe: Recipe | null;
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

interface RecipeDetailViewProps {
  navigate: (view: string) => void;
}

const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({ navigate }) => {
  const { currentRecipe, toggleFavorite, isFavorite } = useBnin() as unknown as BninContextValue;
  
  // Example recipe data - in a real app, this would come from the context
  const recipe = currentRecipe || {
    id: '1',
    name: 'Chicken Stir Fry',
    description: 'A quick and easy stir fry with chicken and vegetables',
    imageUrl: '/images/recipes/chicken-stir-fry.jpg',
    videoUrl: '/videos/recipes/chicken-stir-fry.mp4',
    prepTime: '15 mins',
    cookTime: '10 mins',
    difficulty: 'Easy',
    servings: 2,
    ingredients: [
      { id: '1', name: 'Chicken', quantity: '300g', unit: 'g' },
      { id: '2', name: 'Bell Peppers', quantity: '1', unit: '' },
      { id: '3', name: 'Onions', quantity: '1', unit: '' },
      { id: '4', name: 'Soy Sauce', quantity: '2', unit: 'tbsp' },
      { id: '5', name: 'Garlic', quantity: '2', unit: 'cloves' }
    ],
    instructions: [
      'Cut chicken into bite-sized pieces.',
      'Slice bell peppers and onions.',
      'Heat oil in a wok or large frying pan over high heat.',
      'Add chicken and stir-fry until golden, about 5 minutes.',
      'Add vegetables and stir-fry for 3 minutes more.',
      'Add soy sauce and garlic, cook for 1 minute.',
      'Serve hot over rice.'
    ]
  };

  const handleToggleFavorite = () => {
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  };

  if (!recipe) {
    return (
      <div className="max-w-md mx-auto p-4 text-center">
        <p>Recipe not found.</p>
        <button 
          onClick={() => navigate('home')}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md"
          aria-label="Go to home page"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button 
          onClick={() => navigate('recipeResults')} 
          className="mr-3"
          aria-label="Back to recipe results"
        >
          <ArrowLeft size={24} className="text-gray-700" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 truncate">{recipe.name}</h1>
      </div>

      {/* Recipe Image */}
      <div className="relative h-56 rounded-xl overflow-hidden mb-6">
        <img 
          src={recipe.imageUrl} 
          alt={`${recipe.name} dish`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-3 right-3">
          <button 
            className="bg-white rounded-full p-2 shadow-md"
            onClick={handleToggleFavorite}
            aria-label={isFavorite(recipe.id) ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite(recipe.id)}
          >
            <Heart 
              size={20} 
              className={isFavorite(recipe.id) ? "text-red-500 fill-red-500" : "text-gray-700"} 
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* Recipe Info */}
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          <Clock size={16} className="text-gray-500 mr-1" aria-hidden="true" />
          <span className="text-gray-600 text-sm">{recipe.prepTime} prep · {recipe.cookTime} cook</span>
        </div>
        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
          {recipe.difficulty}
        </span>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full ml-2">
          Serves {recipe.servings}
        </span>
      </div>

      {/* Description */}
      {recipe.description && (
        <div className="mb-6">
          <p className="text-gray-700">{recipe.description}</p>
        </div>
      )}

      {/* Video Preview */}
      {recipe.videoUrl && (
        <div className="bg-gray-100 rounded-xl overflow-hidden mb-6 relative">
          <img 
            src="/api/placeholder/400/200" 
            alt="Recipe video thumbnail" 
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              className="bg-white rounded-full p-3 shadow-md"
              aria-label="Play recipe video"
            >
              <Play size={24} className="text-orange-500" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Ingredients</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient.id} className="flex items-center">
                <div className="w-6 h-6 bg-orange-100 rounded-full mr-3" aria-hidden="true"></div>
                <span className="text-gray-700">
                  {ingredient.quantity} {ingredient.unit} {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Instructions</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={`instruction-${index}`} className="flex">
                <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <div>
                  <p className="text-gray-700">{instruction}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Start Cooking Button */}
      <button
        className="w-full py-3 rounded-xl font-medium text-white bg-orange-500 hover:bg-orange-600 mb-4"
        aria-label="Start cooking this recipe"
      >
        Start Cooking
      </button>
    </div>
  );
};

export default RecipeDetailView;