// src/components/views/MoodBiteView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBnin } from '@/context/BninContext';
import { Mood } from '@/context/BninContext';

interface MoodBiteViewProps {
  navigate: (view: string) => void;
}

const MoodBiteView: React.FC<MoodBiteViewProps> = ({ navigate: propNavigate }) => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { setSelectedMood, getRecipesByMood, navigate: contextNavigate } = useBnin();
  
  const navigate = contextNavigate || propNavigate;

  // Enhanced mood options with search terms
  const moodOptions: Mood[] = [
    { 
      id: '1', 
      name: 'Sweet', 
      color: 'bg-pink-100 text-pink-800',
      queryTerms: ['dessert', 'sweet', 'cake', 'cookie', 'chocolate']
    },
    { 
      id: '2', 
      name: 'Savory', 
      color: 'bg-amber-100 text-amber-800',
      queryTerms: ['savory', 'umami', 'roast', 'hearty', 'meat']
    },
    { 
      id: '3', 
      name: 'Spicy', 
      color: 'bg-red-100 text-red-800',
      queryTerms: ['spicy', 'hot', 'curry', 'chili', 'pepper']
    },
    { 
      id: '4', 
      name: 'Comfort', 
      color: 'bg-yellow-100 text-yellow-800',
      queryTerms: ['comfort food', 'casserole', 'stew', 'soup', 'pasta']
    },
    { 
      id: '5', 
      name: 'Healthy', 
      color: 'bg-green-100 text-green-800',
      queryTerms: ['healthy', 'salad', 'vegetable', 'low calorie', 'low fat']
    },
    { 
      id: '6', 
      name: 'Quick', 
      color: 'bg-blue-100 text-blue-800',
      queryTerms: ['quick', 'easy', '30 minute', 'simple', 'fast']
    },
    { 
      id: '7', 
      name: 'Energizing', 
      color: 'bg-orange-100 text-orange-800',
      queryTerms: ['protein', 'energy', 'breakfast', 'smoothie', 'power bowl']
    },
    { 
      id: '8', 
      name: 'Refreshing', 
      color: 'bg-indigo-100 text-indigo-800',
      queryTerms: ['refreshing', 'light', 'fresh', 'citrus', 'summer']
    },
    { 
      id: '9', 
      name: 'Indulgent', 
      color: 'bg-purple-100 text-purple-800',
      queryTerms: ['indulgent', 'rich', 'decadent', 'gourmet', 'luxury']
    },
    { 
      id: '10', 
      name: 'Cozy', 
      color: 'bg-amber-100 text-amber-800',
      queryTerms: ['cozy', 'winter', 'warm', 'baked', 'holiday']
    },
    { 
      id: '11', 
      name: 'Exotic', 
      color: 'bg-lime-100 text-lime-800',
      queryTerms: ['exotic', 'international', 'fusion', 'ethnic', 'worldly']
    },
    { 
      id: '12', 
      name: 'Nostalgic', 
      color: 'bg-cyan-100 text-cyan-800',
      queryTerms: ['classic', 'traditional', 'old-fashioned', 'retro', 'childhood']
    },
  ];

  const selectMood = async (mood: Mood) => {
    setSelectedMood(mood);
    await getRecipesByMood();
    navigate('recipeResults');
  };
  
  // Loading state
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md md:max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('home')} 
          className="mr-3"
          aria-label="Back to home"
        >
          <ArrowLeft size={24} className="text-amber-700" aria-hidden="true" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-amber-800">MoodBite</h1>
      </div>

      {/* Question with illustration elements */}
      <div className="text-center mb-8 relative">
        <div className="absolute -top-10 -left-4 text-5xl transform -rotate-12 opacity-10">🍲</div>
        <div className="absolute -bottom-6 -right-4 text-5xl transform rotate-12 opacity-10">🍕</div>
        
        <h2 className="text-2xl md:text-3xl font-bold text-amber-800 mb-2">What are you craving?</h2>
        <p className="text-gray-600 md:text-lg">Select your mood to find the perfect recipe</p>
      </div>

      {/* Mood Grid - 2 columns on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        {moodOptions.map((mood) => (
          <button
            key={mood.id}
            onClick={() => selectMood(mood)}
            className={`${mood.color} rounded-xl p-6 md:p-8 shadow-md text-center transition transform hover:scale-105 hover:shadow-lg`}
            aria-label={`Select ${mood.name} mood`}
          >
            <span className="font-bold text-lg md:text-xl">{mood.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodBiteView;