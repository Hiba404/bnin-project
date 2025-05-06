'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useBnin } from '@/context/BninContext';

// Define proper interfaces
interface Mood {
  id: string;
  name: string;
  color: string;
}

interface BninContextValue {
  setSelectedMood: (mood: Mood) => void;
  getRecipesByMood: () => Promise<void>;
}

interface MoodBiteViewProps {
  navigate: (view: string) => void;
}

const MoodBiteView: React.FC<MoodBiteViewProps> = ({ navigate }) => {
  const { setSelectedMood, getRecipesByMood } = useBnin() as unknown as BninContextValue;

  const moodOptions: Mood[] = [
    { id: '1', name: 'Sweet', color: 'bg-pink-100 text-pink-800' },
    { id: '2', name: 'Savory', color: 'bg-amber-100 text-amber-800' },
    { id: '3', name: 'Spicy', color: 'bg-red-100 text-red-800' },
    { id: '4', name: 'Comfort', color: 'bg-yellow-100 text-yellow-800' },
    { id: '5', name: 'Healthy', color: 'bg-green-100 text-green-800' },
    { id: '6', name: 'Quick', color: 'bg-blue-100 text-blue-800' },
    { id: '7', name: 'Hot', color: 'bg-orange-100 text-orange-800' },
    { id: '8', name: 'Cold', color: 'bg-indigo-100 text-indigo-800' },
  ];

  const selectMood = async (mood: Mood) => {
    setSelectedMood(mood);
    await getRecipesByMood();
    navigate('recipeResults');
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
          <ArrowLeft size={24} className="text-gray-700" aria-hidden="true" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">MoodBite</h1>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What are you craving?</h2>
        <p className="text-gray-600">Select your mood to find the perfect recipe</p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {moodOptions.map((mood) => (
          <button
            key={mood.id}
            onClick={() => selectMood(mood)}
            className={`${mood.color} rounded-xl p-6 shadow-md text-center transition transform hover:scale-105`}
            aria-label={`Select ${mood.name} mood`}
          >
            <span className="font-bold text-lg">{mood.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodBiteView;