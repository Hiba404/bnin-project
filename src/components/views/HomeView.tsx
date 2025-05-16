// src/components/views/HomeView.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ChefHat, Refrigerator, Heart, User } from 'lucide-react';
import { useBnin } from '@/context/BninContext';
import Navigation from '../ui/Navigation';

// Define the interfaces
interface BninRecipe {
  id: string;
  name: string;
  imageUrl?: string | null;
  missingIngredients?: number;
}

interface BninAction {
  type: 'navigate' | 'suggestion';
  destination?: string;
  params?: Record<string, string>;
  label: string;
}

interface HomeViewProps {
  navigate: (view: string, params?: Record<string, string>) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ navigate: propNavigate }) => {
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
    console.log("HomeView mounted");
  }, []);

  // Get values from context
  const { bninMessage, currentView, navigate: contextNavigate } = useBnin();
  
  // Use contextNavigate first, or propNavigate as fallback
  const navigate = typeof contextNavigate === 'function' ? contextNavigate : propNavigate;
  
  const defaultMessage = "It's cold outside! How about something warm and comforting today?";

  const handleActionClick = (action: BninAction) => {
    console.log("Action clicked:", action);
    if (action.destination && typeof navigate === 'function') {
      navigate(action.destination, action.params);
    }
  };
  
  // Client-side rendering to avoid hydration errors
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-none mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <span className="text-3xl mr-2">🍳</span>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-800">BNIN</h1>
        </div>
        
        {/* Pass both required props to Navigation */}
        <Navigation currentView={currentView} navigate={navigate} />
        
        <button 
          className="bg-white rounded-full p-2 shadow-md border-2 border-amber-200" 
          aria-label="User profile"
        >
          <User size={20} className="text-amber-600" />
        </button>
      </div>

      {/* AI Assistant Card with illustration style */}
      <div className="bg-white rounded-xl p-5 shadow-lg mb-8 border-2 border-amber-200 relative overflow-hidden">
        {/* Decorative food illustration elements */}
        <div className="absolute -top-3 -right-3 w-12 h-12 text-4xl transform rotate-12 opacity-30">🌿</div>
        <div className="absolute -bottom-2 -left-2 w-12 h-12 text-4xl transform -rotate-12 opacity-30">🍅</div>
        
        <div className="flex items-start relative z-10">
          <div className="bg-amber-500 rounded-full p-3 mr-4 shadow-md">
            <ChefHat size={24} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium text-gray-800 mb-1 text-lg">Bnin Assistant</p>
            <p className="text-gray-600">
              {bninMessage?.message || defaultMessage}
            </p>
            
            {/* Recipes from bninMessage */}
            {bninMessage?.recipes && bninMessage.recipes.length > 0 && (
              <div className="mt-3 space-y-2">
                {bninMessage.recipes.map((recipe: BninRecipe) => (
                  <div key={recipe.id} className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                    {recipe.imageUrl && (
                      <img 
                        src={recipe.imageUrl} 
                        alt={`${recipe.name} thumbnail`} 
                        className="w-12 h-12 rounded-md object-cover" 
                      />
                    )}
                    <span className="text-sm font-medium">{recipe.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Actions from bninMessage */}
            {bninMessage?.actions && bninMessage.actions.length > 0 && (
              <div className="mt-3 space-x-2">
                {bninMessage.actions.map((action: BninAction, index: number) => (
                  <button
                    key={`action-${index}`}
                    onClick={() => handleActionClick(action)}
                    className="text-xs bg-amber-500 text-white px-3 py-1 rounded-full hover:bg-amber-600"
                    aria-label={action.label}
                    disabled={!action.destination}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Options with food illustration style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => {
            console.log("MyFridge button clicked");
            navigate('myFridge');
          }}
          className="bg-white rounded-xl p-6 shadow-lg flex items-center transition transform hover:scale-105 border-2 border-amber-200 relative overflow-hidden"
          aria-label="Go to My Fridge"
        >
          {/* Decoration */}
          <div className="absolute -top-2 -left-2 w-12 h-12 text-3xl transform -rotate-12 opacity-20">🥕</div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12 text-3xl transform rotate-12 opacity-20">🧅</div>
          
          <div className="bg-blue-100 p-3 rounded-full mr-4 shadow-md z-10">
            <Refrigerator size={24} className="text-blue-600" aria-hidden="true" />
          </div>
          <div className="text-left z-10">
            <h2 className="font-bold text-gray-800 text-lg">My Fridge</h2>
            <p className="text-gray-600">Cook with what you have</p>
          </div>
        </button>

        <button
          onClick={() => {
            console.log("MoodBite button clicked");
            navigate('moodBite');
          }}
          className="bg-white rounded-xl p-6 shadow-lg flex items-center transition transform hover:scale-105 border-2 border-amber-200 relative overflow-hidden"
          aria-label="Go to MoodBite"
        >
          {/* Decoration */}
          <div className="absolute -top-2 -right-2 w-12 h-12 text-3xl transform rotate-12 opacity-20">🍲</div>
          <div className="absolute -bottom-3 -left-2 w-12 h-12 text-3xl transform -rotate-12 opacity-20">🌶️</div>
          
          <div className="bg-pink-100 p-3 rounded-full mr-4 shadow-md z-10">
            <Heart size={24} className="text-pink-600" aria-hidden="true" />
          </div>
          <div className="text-left z-10">
            <h2 className="font-bold text-gray-800 text-lg">MoodBite</h2>
            <p className="text-gray-600">What are you craving?</p>
          </div>
        </button>
      </div>

      {/* Recommended Recipes Section with food illustration style */}
      <div className="mb-6">
        <h2 className="text-lg md:text-xl font-bold text-amber-800 mb-4 flex items-center">
          <span className="text-2xl mr-2">🍽️</span> Recommended For You
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((item: number) => (
            <button 
              key={item} 
              className="bg-white rounded-lg shadow-md overflow-hidden text-left hover:shadow-lg transition-shadow border-2 border-amber-200"
              aria-label={`View recipe ${item} details`}
              onClick={() => navigate('recipeDetail', { recipeId: item.toString() })}
            >
              <div className="h-24 md:h-36 bg-gray-200 relative">
                <img 
                  src="/api/placeholder/200/150" 
                  alt={`Recipe ${item} thumbnail`} 
                  className="w-full h-full object-cover"
                />
                {/* Add a little decoration */}
                <div className="absolute top-2 right-2 w-6 h-6 text-lg bg-white rounded-full flex items-center justify-center shadow-sm">
                  {item % 2 === 0 ? '❤️' : '⭐'}
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm md:text-base text-gray-800">Delicious Recipe {item}</p>
                <p className="text-xs md:text-sm text-amber-600 flex items-center">
                  <span className="text-xs mr-1">⏱️</span> 20 min
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;