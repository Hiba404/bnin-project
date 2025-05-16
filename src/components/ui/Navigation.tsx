// src/components/ui/Navigation.tsx
'use client';

import React from 'react';
import { useBnin } from '@/context/BninContext';

interface NavigationProps {
  // Make props optional with ? and provide default from context
  currentView?: string;
  navigate?: (view: string, params?: Record<string, string>) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView: propCurrentView, navigate: propNavigate }) => {
  // Get values from context as fallback
  const { currentView: contextCurrentView, navigate: contextNavigate } = useBnin();
  
  // Use props if provided, otherwise use context values
  const currentView = propCurrentView || contextCurrentView;
  const navigate = propNavigate || contextNavigate;
  
  // Add a simple handler function to log and execute navigation
  const handleNavigation = (view: string) => {
    console.log(`Navigation component - navigating to: ${view}`);
    
    // Check if navigate is a function
    if (typeof navigate === 'function') {
      navigate(view);
    } else {
      console.error("Navigate is not a function in Navigation component:", navigate);
    }
  };
  
  return (
    <nav className="hidden md:block">
      <ul className="flex space-x-8">
        <li>
          <button 
            className={`text-lg ${currentView === 'home' ? 'text-amber-800 font-medium' : 'text-amber-700 hover:text-amber-900'}`}
            onClick={() => handleNavigation('home')}
          >
            Home
          </button>
        </li>
        <li>
          <button 
            className={`text-lg ${currentView === 'myFridge' ? 'text-amber-800 font-medium' : 'text-amber-700 hover:text-amber-900'}`}
            onClick={() => handleNavigation('myFridge')}
          >
            My Fridge
          </button>
        </li>
        <li>
          <button 
            className={`text-lg ${currentView === 'moodBite' ? 'text-amber-800 font-medium' : 'text-amber-700 hover:text-amber-900'}`}
            onClick={() => handleNavigation('moodBite')}
          >
            MoodBite
          </button>
        </li>
        <li>
          <button 
            className="text-lg text-amber-700 hover:text-amber-900"
          >
            Favorites
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;