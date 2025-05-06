'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useBnin } from '@/context/BninContext';

// Define proper TypeScript interfaces
interface Ingredient {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
}

interface BninContextValue {
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: string) => void;
  getRecipesByIngredients: () => Promise<void>;
}

interface MyFridgeViewProps {
  navigate: (view: string) => void;
}

const MyFridgeView: React.FC<MyFridgeViewProps> = ({ navigate }) => {
  const { 
    selectedIngredients, 
    addIngredient, 
    removeIngredient, 
    getRecipesByIngredients 
  } = useBnin() as unknown as BninContextValue;
  
  const [searchQuery, setSearchQuery] = useState('');

  const availableIngredients: Ingredient[] = [
    { id: '1', name: 'Chicken', category: 'protein', imageUrl: '/images/ingredients/chicken.jpg' },
    { id: '2', name: 'Beef', category: 'protein', imageUrl: '/images/ingredients/beef.jpg' },
    { id: '3', name: 'Rice', category: 'grain', imageUrl: '/images/ingredients/rice.jpg' },
    { id: '4', name: 'Pasta', category: 'grain', imageUrl: '/images/ingredients/pasta.jpg' },
    { id: '5', name: 'Tomatoes', category: 'vegetable', imageUrl: '/images/ingredients/tomatoes.jpg' },
    { id: '6', name: 'Onions', category: 'vegetable', imageUrl: '/images/ingredients/onions.jpg' },
    { id: '7', name: 'Bell Peppers', category: 'vegetable', imageUrl: '/images/ingredients/bell-peppers.jpg' },
    { id: '8', name: 'Cheese', category: 'dairy', imageUrl: '/images/ingredients/cheese.jpg' },
    { id: '9', name: 'Eggs', category: 'protein', imageUrl: '/images/ingredients/eggs.jpg' },
    { id: '10', name: 'Flour', category: 'baking', imageUrl: '/images/ingredients/flour.jpg' },
    { id: '11', name: 'Sugar', category: 'baking', imageUrl: '/images/ingredients/sugar.jpg' },
    { id: '12', name: 'Chocolate', category: 'sweet', imageUrl: '/images/ingredients/chocolate.jpg' },
  ];

  const toggleIngredient = (ingredient: Ingredient) => {
    const isSelected = selectedIngredients.some(item => item.id === ingredient.id);
    
    if (isSelected) {
      removeIngredient(ingredient.id);
    } else {
      // Logic check - prevent adding chocolate with chicken for example
      const proteinSelected = selectedIngredients.some(item => item.category === 'protein');
      const sweetSelected = selectedIngredients.some(item => item.category === 'sweet');
      
      if ((proteinSelected && ingredient.category === 'sweet') || 
          (sweetSelected && ingredient.category === 'protein')) {
        alert("That combination doesn't work well together!");
        return;
      }
      
      addIngredient(ingredient);
    }
  };

  const handleFindRecipes = async () => {
    await getRecipesByIngredients();
    navigate('recipeResults');
  };

  const filteredIngredients = availableIngredients.filter(
    ingredient => ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIngredientsByCategory = (category: string) => {
    return filteredIngredients.filter(ingredient => ingredient.category === category);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('home')} 
          className="mr-3"
          aria-label="Back to home"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Fridge</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white rounded-full py-3 pl-10 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Search ingredients"
        />
      </div>

      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Selected Ingredients</h2>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map(ingredient => (
              <div key={ingredient.id} className="bg-orange-100 rounded-full px-3 py-1 flex items-center">
                <span className="text-sm text-gray-800 mr-1">{ingredient.name}</span>
                <button 
                  onClick={() => toggleIngredient(ingredient)}
                  aria-label={`Remove ${ingredient.name}`}
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredient Categories */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Proteins</h2>
        <div className="grid grid-cols-3 gap-3">
          {getIngredientsByCategory('protein').map(ingredient => (
            <button 
              key={ingredient.id} 
              className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                selectedIngredients.some(item => item.id === ingredient.id) 
                  ? 'ring-2 ring-orange-500' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleIngredient(ingredient)}
              aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
              aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
            >
              <div className="w-16 h-16 mx-auto mb-1 rounded-full overflow-hidden bg-gray-100">
                <img 
                  src={ingredient.imageUrl} 
                  alt={`${ingredient.name} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium">{ingredient.name}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-2">Vegetables</h2>
        <div className="grid grid-cols-3 gap-3">
          {getIngredientsByCategory('vegetable').map(ingredient => (
            <button 
              key={ingredient.id} 
              className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                selectedIngredients.some(item => item.id === ingredient.id) 
                  ? 'ring-2 ring-orange-500' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => toggleIngredient(ingredient)}
              aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
              aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
            >
              <div className="w-16 h-16 mx-auto mb-1 rounded-full overflow-hidden bg-gray-100">
                <img 
                  src={ingredient.imageUrl} 
                  alt={`${ingredient.name} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs font-medium">{ingredient.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Other categories can be added here using the same pattern */}
      {getIngredientsByCategory('grain').length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Grains</h2>
          <div className="grid grid-cols-3 gap-3">
            {getIngredientsByCategory('grain').map(ingredient => (
              <button 
                key={ingredient.id} 
                className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                  selectedIngredients.some(item => item.id === ingredient.id) 
                    ? 'ring-2 ring-orange-500' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleIngredient(ingredient)}
                aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
                aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
              >
                <div className="w-16 h-16 mx-auto mb-1 rounded-full overflow-hidden bg-gray-100">
                  <img 
                    src={ingredient.imageUrl} 
                    alt={`${ingredient.name} thumbnail`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs font-medium">{ingredient.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Find Recipes Button */}
      <button
        onClick={handleFindRecipes}
        disabled={selectedIngredients.length === 0}
        className={`w-full py-3 rounded-xl font-medium text-white ${
          selectedIngredients.length === 0 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
        aria-disabled={selectedIngredients.length === 0}
      >
        Find Recipes
      </button>
    </div>
  );
};

export default MyFridgeView;