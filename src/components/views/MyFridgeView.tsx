// src/components/views/MyFridgeView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { useBnin } from '@/context/BninContext';
import { Ingredient } from '@/context/BninContext'; // Import from context to ensure type consistency

interface MyFridgeViewProps {
  navigate: (view: string, params?: Record<string, string>) => void;
}

const MyFridgeView: React.FC<MyFridgeViewProps> = ({ navigate: propNavigate }) => {
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    console.log("MyFridgeView mounted");
  }, []);

  const { 
    selectedIngredients, 
    addIngredient, 
    removeIngredient, 
    getRecipesByIngredients,
    navigate: contextNavigate
  } = useBnin();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Updated ingredient list with emojis
  const availableIngredients: Ingredient[] = [
    { id: '1', name: 'Chicken', category: 'protein', emoji: '🍗' },
    { id: '2', name: 'Beef', category: 'protein', emoji: '🥩' },
    { id: '3', name: 'Rice', category: 'grain', emoji: '🍚' },
    { id: '4', name: 'Pasta', category: 'grain', emoji: '🍝' },
    { id: '5', name: 'Tomatoes', category: 'vegetable', emoji: '🍅' },
    { id: '6', name: 'Onions', category: 'vegetable', emoji: '🧅' },
    { id: '7', name: 'Bell Peppers', category: 'vegetable', emoji: '🫑' },
    { id: '8', name: 'Fish', category: 'protein', emoji: '🐟' },
    { id: '9', name: 'Eggs', category: 'protein', emoji: '🥚' },
    { id: '10', name: 'Garlic', category: 'vegetable', emoji: '🧄' },
    { id: '11', name: 'Potato', category: 'vegetable', emoji: '🥔' },
    { id: '12', name: 'Carrot', category: 'vegetable', emoji: '🥕' },
    { id: '13', name: 'Mushrooms', category: 'vegetable', emoji: '🍄' },
  ];

  // Enhanced with debug logging
  const handleGoHome = () => {
    console.log("Back button clicked, navigating to home");
    // Try context navigate first, then prop navigate as fallback
    if (typeof contextNavigate === 'function') {
      contextNavigate('home');
    } else if (typeof propNavigate === 'function') {
      propNavigate('home');
    } else {
      console.error("No navigate function available");
    }
  };

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
    // Use contextNavigate for consistency
    if (typeof contextNavigate === 'function') {
      contextNavigate('recipeResults');
    } else if (typeof propNavigate === 'function') {
      propNavigate('recipeResults');
    }
  };

  const filteredIngredients = availableIngredients.filter(
    ingredient => ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIngredientsByCategory = (category: string) => {
    return filteredIngredients.filter(ingredient => ingredient.category === category);
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-4 bg-amber-50">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={handleGoHome} 
          className="mr-3"
          aria-label="Back to home"
        >
          <ArrowLeft size={24} className="text-amber-700" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-amber-800">My Fridge</h1>
      </div>

      {/* Two-column layout on desktop */}
      <div className="md:flex md:gap-8">
        {/* Left column on desktop */}
        <div className="md:w-1/3">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white rounded-full py-3 pl-10 pr-4 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-label="Search ingredients"
            />
          </div>

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Selected Ingredients</h2>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map(ingredient => (
                  <div key={ingredient.id} className="bg-amber-100 rounded-full px-3 py-1 flex items-center">
                    <span className="mr-1">{ingredient.emoji}</span>
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

          {/* Find Recipes Button */}
          <button
            onClick={handleFindRecipes}
            disabled={selectedIngredients.length === 0}
            className={`w-full py-3 rounded-xl font-medium text-white ${
              selectedIngredients.length === 0 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
            aria-disabled={selectedIngredients.length === 0}
          >
            Find Recipes
          </button>
        </div>

        {/* Right column on desktop - Ingredient categories */}
        <div className="md:w-2/3">
          {/* Protein Category */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Proteins</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {getIngredientsByCategory('protein').map(ingredient => (
                <button 
                  key={ingredient.id} 
                  className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                    selectedIngredients.some(item => item.id === ingredient.id) 
                      ? 'ring-2 ring-amber-500' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleIngredient(ingredient)}
                  aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
                  aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
                >
                  {/* Emoji presentation */}
                  <div className="w-16 h-16 mx-auto mb-1 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-100 shadow-sm">
                    <span className="text-4xl" role="img" aria-label={ingredient.name}>
                      {ingredient.emoji}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-medium">{ingredient.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Vegetable Category */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Vegetables</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {getIngredientsByCategory('vegetable').map(ingredient => (
                <button 
                  key={ingredient.id} 
                  className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                    selectedIngredients.some(item => item.id === ingredient.id) 
                      ? 'ring-2 ring-amber-500' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleIngredient(ingredient)}
                  aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
                  aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
                >
                  <div className="w-16 h-16 mx-auto mb-1 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-100 shadow-sm">
                    <span className="text-4xl" role="img" aria-label={ingredient.name}>
                      {ingredient.emoji}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm font-medium">{ingredient.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Grain Category */}
          {getIngredientsByCategory('grain').length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-gray-700 mb-2">Grains</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {getIngredientsByCategory('grain').map(ingredient => (
                  <button 
                    key={ingredient.id} 
                    className={`bg-white rounded-lg p-2 shadow-sm text-center cursor-pointer transition ${
                      selectedIngredients.some(item => item.id === ingredient.id) 
                        ? 'ring-2 ring-amber-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => toggleIngredient(ingredient)}
                    aria-label={`${selectedIngredients.some(item => item.id === ingredient.id) ? 'Deselect' : 'Select'} ${ingredient.name}`}
                    aria-pressed={selectedIngredients.some(item => item.id === ingredient.id)}
                  >
                    <div className="w-16 h-16 mx-auto mb-1 rounded-full flex items-center justify-center bg-amber-50 border-2 border-amber-100 shadow-sm">
                      <span className="text-4xl" role="img" aria-label={ingredient.name}>
                        {ingredient.emoji}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm font-medium">{ingredient.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyFridgeView;