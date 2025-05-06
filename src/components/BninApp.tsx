'use client';

import React from 'react';
import { useBnin } from '@/context/BninContext';
import HomeView from './views/HomeView';
import MyFridgeView from './views/MyFridgeView';
import MoodBiteView from './views/MoodBiteView';
import RecipeResultsView from './views/RecipeResultsView';
import RecipeDetailView from './views/RecipeDetailView';

// Define TypeScript interface for the BninContext
interface BninContextValue {
  currentView: string;
  navigate: (view: string) => void;
  isLoading: boolean;
}

/**
 * Main application component that handles view routing
 */
const BninApp: React.FC = () => {
  const { currentView, navigate, isLoading } = useBnin() as unknown as BninContextValue;

  // Loading spinner with proper accessibility
  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen" role="status">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
        aria-label="Loading content"
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );

  // Render the appropriate view based on currentView state
  const renderView = () => {
    if (isLoading) {
      return renderLoadingSpinner();
    }

    switch (currentView) {
      case 'home':
        return <HomeView navigate={navigate} />;
      case 'myFridge':
        return <MyFridgeView navigate={navigate} />;
      case 'moodBite':
        return <MoodBiteView navigate={navigate} />;
      case 'recipeResults':
        return <RecipeResultsView navigate={navigate} />;
      case 'recipeDetail':
        return <RecipeDetailView navigate={navigate} />;
      default:
        return <HomeView navigate={navigate} />;
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-amber-50 to-orange-100 min-h-screen font-sans"
      role="application"
      aria-label="BNIN Recipe App"
    >
      {renderView()}
    </div>
  );
};

export default BninApp;