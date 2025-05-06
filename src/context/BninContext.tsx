import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define interfaces for the types used in the context
interface Ingredient {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  description: string | null;
}

interface Mood {
  id: string;
  name: string;
  description: string | null;
}

interface Recipe {
  id: string;
  name: string;
  description: string | null;
  instructions: string[];
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  imageUrl: string | null;
  videoUrl: string | null;
  ingredients?: {
    id: string;
    quantity: string;
    unit: string;
    ingredient: Ingredient;
  }[];
  moods?: {
    id: string;
    relevanceScore: number;
    mood: Mood;
  }[];
}

interface BninRecipe {
  id: string;
  name: string;
  imageUrl: string | null;
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

interface WeatherData {
  location: string;
  weather: string;
  temperature: number;
}

// Define the context type
interface BninContextType {
  // User state
  user: { id: string; username: string } | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Ingredient selection state
  selectedIngredients: Ingredient[];
  addIngredient: (ingredient: Ingredient) => void;
  removeIngredient: (ingredientId: string) => void;
  clearIngredients: () => void;
  
  // Mood selection state
  selectedMood: Mood | null;
  setSelectedMood: (mood: Mood | null) => void;
  
  // Recipe state
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  favoriteRecipes: Recipe[];
  toggleFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  
  // Search and recommendations
  searchRecipes: (query: string) => Promise<Recipe[]>;
  getRecommendedRecipes: () => Promise<Recipe[]>;
  getRecipesByIngredients: () => Promise<Recipe[]>;
  getRecipesByMood: () => Promise<Recipe[]>;
  
  // Bnin Assistant
  bninMessage: BninMessage | null;
  sendMessageToBnin: (message: string) => Promise<void>;
  clearBninMessage: () => void;
  
  // Context data
  weatherData: WeatherData | null;
  getWeatherData: () => Promise<WeatherData | null>;
  
  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentView: string;
  navigate: (view: string, params?: Record<string, string>) => void;
  
  // Original properties (keeping for backward compatibility)
  isBninActive: boolean;
  toggleBnin: () => void;
}

// Create the context with a default value of undefined
const BninContext = createContext<BninContextType | undefined>(undefined);

// Create a Provider that wraps your app and provides the state
export const BninProvider = ({ children }: { children: ReactNode }) => {
  // Original state
  const [isBninActive, setIsBninActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User state
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  
  // Ingredient selection state
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  
  // Mood selection state
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  
  // Recipe state
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  
  // Bnin Assistant
  const [bninMessage, setBninMessage] = useState<BninMessage | null>({
    message: "It's cold outside! How about something warm and comforting today?"
  });
  
  // Context data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  
  // UI State
  const [currentView, setCurrentView] = useState<string>('home');

  // Function to toggle Bnin state
  const toggleBnin = () => setIsBninActive(prev => !prev);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Your authentication logic here
      // This is a placeholder - replace with your actual authentication code
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // For demonstration, return true if email includes @ and password is not empty
      const success = email.includes('@') && password.length > 0;
      
      if (success) {
        setUser({ id: '1', username: email.split('@')[0] });
      }
      
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    setUser(null);
    setFavoriteRecipes([]);
    setCurrentView('home');
  };
  
  // Ingredient selection functions
  const addIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients(prev => [...prev, ingredient]);
  };
  
  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => 
      prev.filter(ingredient => ingredient.id !== ingredientId)
    );
  };
  
  const clearIngredients = () => {
    setSelectedIngredients([]);
  };
  
  // Recipe functions
  const toggleFavorite = async (recipeId: string): Promise<void> => {
    // Implementation here
    // This is a placeholder
    console.log('Toggle favorite for recipe:', recipeId);
  };
  
  const isFavorite = (recipeId: string): boolean => {
    return favoriteRecipes.some(recipe => recipe.id === recipeId);
  };
  
  // Search and recommendation functions
  const searchRecipes = async (query: string): Promise<Recipe[]> => {
    // Implementation here
    // This is a placeholder
    return [];
  };
  
  const getRecommendedRecipes = async (): Promise<Recipe[]> => {
    // Implementation here
    // This is a placeholder
    return [];
  };
  
  const getRecipesByIngredients = async (): Promise<Recipe[]> => {
    // Implementation here
    // This is a placeholder
    return [];
  };
  
  const getRecipesByMood = async (): Promise<Recipe[]> => {
    // Implementation here
    // This is a placeholder
    return [];
  };
  
  // Bnin Assistant functions
  const sendMessageToBnin = async (message: string): Promise<void> => {
    // Implementation here
    // This is a placeholder
    console.log('Message to Bnin:', message);
  };
  
  const clearBninMessage = () => {
    setBninMessage(null);
  };
  
  // Context data functions
  const getWeatherData = async (): Promise<WeatherData | null> => {
    // This is a placeholder
    const mockWeatherData: WeatherData = {
      location: 'Current Location',
      weather: 'sunny',
      temperature: 22
    };
    
    setWeatherData(mockWeatherData);
    return mockWeatherData;
  };
  
  // Navigation function
  const navigate = (view: string, params?: Record<string, string>) => {
    setCurrentView(view);
    
    // If we're navigating to a recipe detail, set the current recipe
    if (view === 'recipeDetail' && params?.recipeId) {
      // Fetch recipe by id
      console.log('Fetch recipe:', params.recipeId);
    }
  };

  return (
    <BninContext.Provider value={{
      // Original properties
      isBninActive,
      toggleBnin,
      
      // User state
      user,
      isLoggedIn: !!user,
      login,
      logout,
      
      // Ingredient selection state
      selectedIngredients,
      addIngredient,
      removeIngredient,
      clearIngredients,
      
      // Mood selection state
      selectedMood,
      setSelectedMood,
      
      // Recipe state
      currentRecipe,
      setCurrentRecipe,
      favoriteRecipes,
      toggleFavorite,
      isFavorite,
      
      // Search and recommendations
      searchRecipes,
      getRecommendedRecipes,
      getRecipesByIngredients,
      getRecipesByMood,
      
      // Bnin Assistant
      bninMessage,
      sendMessageToBnin,
      clearBninMessage,
      
      // Context data
      weatherData,
      getWeatherData,
      
      // UI State
      isLoading,
      setIsLoading,
      currentView,
      navigate
    }}>
      {children}
    </BninContext.Provider>
  );
};

// Custom hook to access the context
export const useBnin = () => {
  const context = useContext(BninContext);
  if (!context) {
    throw new Error('useBnin must be used within a BninProvider');
  }
  return context;
};

export default BninContext;