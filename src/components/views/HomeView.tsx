'use client';

import React from 'react';
import { ChefHat, Refrigerator, Heart, User } from 'lucide-react';
import { useBnin } from '@/context/BninContext';

// Define interfaces for the BninContext data
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

interface BninMessage {
  message: string;
  recipes?: BninRecipe[];
  actions?: BninAction[];
}

interface HomeViewProps {
  navigate: (view: string, params?: Record<string, string>) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ navigate }) => {
  // Make sure your useBnin hook is properly typed
  const { bninMessage } = useBnin();

  // Default message if bninMessage is null or message is undefined
  const defaultMessage = "It's cold outside! How about something warm and comforting today?";

  // Function to handle action button clicks
  const handleActionClick = (action: BninAction) => {
    if (action.destination && typeof navigate === 'function') {
      navigate(action.destination, action.params);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <ChefHat className="text-orange-500 mr-2" size={24} />
          <h1 className="text-2xl font-bold text-orange-800">BNIN</h1>
        </div>
        <button 
          className="bg-white p-2 rounded-full shadow-md" 
          aria-label="User profile"
        >
          <User size={20} className="text-orange-500" />
        </button>
      </div>

      {/* AI Assistant Avatar */}
      <div className="bg-white rounded-xl p-4 shadow-lg mb-6 flex items-start">
        <div className="bg-orange-500 rounded-full p-2 mr-3">
          <ChefHat size={24} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="font-medium text-gray-800 mb-1">Bnin Assistant</p>
          <p className="text-gray-600 text-sm">
            {bninMessage?.message || defaultMessage}
          </p>
          
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
          
          {bninMessage?.actions && bninMessage.actions.length > 0 && (
            <div className="mt-3 space-x-2">
              {bninMessage.actions.map((action: BninAction, index: number) => (
                <button
                  key={`action-${index}`}
                  onClick={() => handleActionClick(action)}
                  className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600"
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

      {/* Main Options */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => typeof navigate === 'function' ? navigate('myFridge') : null}
          className="bg-white rounded-xl p-6 shadow-md flex items-center transition transform hover:scale-105"
          aria-label="Go to My Fridge"
        >
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <Refrigerator size={24} className="text-blue-600" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="font-bold text-gray-800">My Fridge</h2>
            <p className="text-sm text-gray-600">Cook with what you have</p>
          </div>
        </button>

        <button
          onClick={() => typeof navigate === 'function' ? navigate('moodBite') : null}
          className="bg-white rounded-xl p-6 shadow-md flex items-center transition transform hover:scale-105"
          aria-label="Go to MoodBite"
        >
          <div className="bg-pink-100 p-3 rounded-full mr-4">
            <Heart size={24} className="text-pink-600" aria-hidden="true" />
          </div>
          <div className="text-left">
            <h2 className="font-bold text-gray-800">MoodBite</h2>
            <p className="text-sm text-gray-600">What are you craving?</p>
          </div>
        </button>
      </div>

      {/* Recommended Recipes Section */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Recommended For You</h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item: number) => (
            <button 
              key={item} 
              className="bg-white rounded-lg shadow-md overflow-hidden text-left"
              aria-label={`View recipe ${item} details`}
            >
              <div className="h-24 bg-gray-200">
                <img 
                  src="/api/placeholder/200/150" 
                  alt={`Recipe ${item} thumbnail`} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-2">
                <p className="font-medium text-sm text-gray-800 truncate">Delicious Recipe {item}</p>
                <p className="text-xs text-gray-500">20 min</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;