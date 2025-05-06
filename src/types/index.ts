// Common type definitions for the app

export interface User {
    id: string;
    username: string;
    email: string;
    profileImage?: string;
  }
  
  export interface Ingredient {
    id: string;
    name: string;
    category: string;
    imageUrl: string | null;
    description: string | null;
  }
  
  export interface Mood {
    id: string;
    name: string;
    description: string | null;
  }
  
  export interface RecipeIngredient {
    id: string;
    recipeId: string;
    ingredientId: string;
    quantity: string;
    unit: string;
    ingredient: Ingredient;
  }
  
  export interface RecipeMood {
    id: string;
    recipeId: string;
    moodId: string;
    relevanceScore: number;
    mood: Mood;
  }
  
  export interface Recipe {
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
    ingredients?: RecipeIngredient[];
    moods?: RecipeMood[];
  }
  
  export interface BninMessage {
    message: string;
    recipes?: {
      id: string;
      name: string;
      imageUrl: string | null;
      missingIngredients?: number;
    }[];
    actions?: {
      type: 'navigate' | 'suggestion';
      destination?: string;
      params?: Record<string, string>;
      label: string;
    }[];
  }
  
  export interface WeatherData {
    location: string;
    weather: string;
    temperature: number;
  }