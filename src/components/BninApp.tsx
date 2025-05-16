// src/components/BninApp.tsx
'use client';

import React, { useEffect } from 'react';
import { useBnin } from '@/context/BninContext';
import HomeView from './views/HomeView';
import MyFridgeView from './views/MyFridgeView';
import MoodBiteView from './views/MoodBiteView';
import RecipeResultsView from './views/RecipeResultsView';
import RecipeDetailView from './views/RecipeDetailView';

/**
 * Main application component that handles view routing
 */
const BninApp: React.FC = () => {
  const { currentView, navigate, isLoading } = useBnin();

  // Debug logging
  useEffect(() => {
    console.log("BninApp rendered with currentView:", currentView);
  }, [currentView]);

  // Loading spinner with proper accessibility
  const renderLoadingSpinner = () => (
    <div className="flex justify-center items-center min-h-screen" role="status">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"
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

    console.log(`Rendering view for: ${currentView}`);

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
        console.log("Default case - rendering HomeView");
        return <HomeView navigate={navigate} />;
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-amber-50 to-amber-100 min-h-screen font-sans"
      role="application"
      aria-label="BNIN Recipe App"
    >
      {/* Debug view indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs z-50">
          Current View: {currentView}
        </div>
      )}

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {renderView()}
      </div>
    </div>
  );
};

export default BninApp;