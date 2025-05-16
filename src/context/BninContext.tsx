// BninContext.tsx - FIXED
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define TypeScript interfaces
export interface Ingredient {
  id: string;
  name: string;
  category: string;
  emoji: string;
  imageUrl?: string; // Optional fallback for ingredients without suitable emojis
}

export interface Mood {
  id: string;
  name: string;
  color: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: number;
  ingredients: {
    id: string;
    name: string;
    quantity: string;
    unit: string;
  }[];
  instructions: string[];
}

export interface BninAction {
  type: 'navigate' | 'suggestion';
  destination?: string;
  params?: Record<string, string>;
  label: string;
}

export interface BninMessage {
  message: string;
  recipes?: {
    id: string;
    name: string;
    imageUrl?: string | null;
    missingIngredients?: number;
  }[];
  actions?: BninAction[];
}

// Define the shape of our context
interface BninContextProps {
  currentView: string;
  bninMessage: BninMessage | null;
  selectedIngredients: Ingredient[];
  selectedMood: Mood | null;
  currentRecipe: Recipe | null;
  isLoading: boolean;
  favoriteRecipes: string[];
  navigate: (view: string, params?: Record<string, string>) => void;
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: string) => void;
  setSelectedMood: (mood: Mood) => void;
  getRecipesByIngredients: () => Promise<void>;
  getRecipesByMood: () => Promise<void>;
  setCurrentRecipe: (recipe: Recipe) => void;
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

// Create context with default values
const BninContext = createContext<BninContextProps | undefined>(undefined);

// Provider component that wraps the app
interface BninProviderProps {
  children: ReactNode;
}

export const BninProvider: React.FC<BninProviderProps> = ({ children }) => {
  // App state
  const [currentView, setCurrentView] = useState('home');
  const [bninMessage, setBninMessage] = useState<BninMessage | null>({
    message: "It's cold outside! How about something warm and comforting today?",
    actions: [
      {
        type: 'navigate',
        destination: 'moodBite',
        label: 'Find comfort food'
      }
    ]
  });
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([]);

  // Debug current view for troubleshooting
  useEffect(() => {
    console.log(`Current view changed to: ${currentView}`);
  }, [currentView]);

  // Navigation function with enhanced debugging
  const navigate = (view: string, params?: Record<string, string>) => {
    console.log(`Navigating to: ${view}`, params ? `with params: ${JSON.stringify(params)}` : '');
    
    // Set the current view state
    setCurrentView(view);
    
    // If navigating to recipe detail with a recipeId but no current recipe is set
    if (view === 'recipeDetail' && params?.recipeId && !currentRecipe) {
      // Fetch recipe details (this is a placeholder - you would fetch from API)
      const mockRecipe: Recipe = {
        id: params.recipeId,
        name: 'Chicken Stir Fry',
        description: 'A quick and easy stir fry with chicken and vegetables',
        imageUrl: '/images/recipes/chicken-stir-fry.jpg',
        videoUrl: '/videos/recipes/chicken-stir-fry.mp4',
        prepTime: '15 mins',
        cookTime: '10 mins',
        difficulty: 'Easy',
        servings: 2,
        ingredients: [
          { id: '1', name: 'Chicken', quantity: '300', unit: 'g' },
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
      setCurrentRecipe(mockRecipe);
    }
  };

  // Ingredient management
  const addIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => [...prev, ingredient]);
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => prev.filter(item => item.id !== ingredientId));
  };

  // Recipe search functions (placeholders - would connect to API)
  const getRecipesByIngredients = async (): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    setIsLoading(false);
  };

  const getRecipesByMood = async (): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    setIsLoading(false);
  };

  // Favorite recipe management
  const toggleFavorite = (recipeId: string) => {
    setFavoriteRecipes(prev => {
      if (prev.includes(recipeId)) {
        return prev.filter(id => id !== recipeId);
      } else {
        return [...prev, recipeId];
      }
    });
  };

  const isFavorite = (recipeId: string): boolean => {
    return favoriteRecipes.includes(recipeId);
  };

  // Context value
  const contextValue: BninContextProps = {
    currentView,
    bninMessage,
    selectedIngredients,
    selectedMood,
    currentRecipe,
    isLoading,
    favoriteRecipes,
    navigate,
    addIngredient,
    removeIngredient,
    setSelectedMood,
    getRecipesByIngredients,
    getRecipesByMood,
    setCurrentRecipe,
    toggleFavorite,
    isFavorite
  };

  return (
    <BninContext.Provider value={contextValue}>
      {children}
    </BninContext.Provider>
  );
};

// Custom hook for using the context
export const useBnin = () => {
  const context = useContext(BninContext);
  if (context === undefined) {
    throw new Error('useBnin must be used within a BninProvider');
  }
  return context;
};