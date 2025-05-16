// src/services/recipeService.ts
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

export interface DetailedRecipe extends SpoonacularRecipe {
  summary: string;
  instructions: string;
  extendedIngredients: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  analyzedInstructions: {
    name: string;
    steps: {
      number: number;
      step: string;
      ingredients: { id: number; name: string; image: string }[];
      equipment: { id: number; name: string; image: string }[];
    }[];
  }[];
  dishTypes: string[];
  diets: string[];
  nutrition?: {
    nutrients: {
      name: string;
      amount: number;
      unit: string;
    }[];
  };
}

// Search recipes by ingredients
export async function searchRecipesByIngredients(ingredients: string[], limit = 12): Promise<SpoonacularRecipe[]> {
  try {
    const ingredientsParam = ingredients.join(',');
    const response = await fetch(
      `${BASE_URL}/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredientsParam}&number=${limit}&ranking=1`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipes by ingredients:', error);
    return [];
  }
}

// Search recipes by query (for mood-based searching)
export async function searchRecipesByQuery(query: string, limit = 12): Promise<SpoonacularRecipe[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/complexSearch?apiKey=${API_KEY}&query=${query}&number=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching recipes by query:', error);
    return [];
  }
}

// Get detailed recipe information
export async function getRecipeDetails(recipeId: number): Promise<DetailedRecipe | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/recipes/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=true`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}