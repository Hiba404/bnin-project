// src/services/databaseService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Save a recipe from the API to the database
export async function saveRecipeToDatabase(recipe: any, userId?: string) {
  try {
    // Check if recipe with this external ID already exists
    let externalIdNumber: number | null = null;
    if (recipe.id) {
      externalIdNumber = parseInt(recipe.id.toString());
    }

    const existingRecipe = await prisma.recipe.findFirst({
      where: { 
        externalId: externalIdNumber
      }
    });

    if (existingRecipe) {
      return existingRecipe;
    }

    // Parse ingredients from API response
    const ingredientsData = recipe.extendedIngredients?.map((ingredient: any) => ({
      name: ingredient.name || 'Unknown ingredient',
      amount: parseFloat(ingredient.amount) || 0,
      unit: ingredient.unit || ''
    })) || [];

    // Parse instructions from API response
    const instructionsData = recipe.analyzedInstructions?.[0]?.steps.map((step: any, index: number) => ({
      stepNo: step.number || index + 1,
      text: step.step || 'No instruction provided'
    })) || [];

    // Create the recipe
    const newRecipe = await prisma.recipe.create({
      data: {
        externalId: externalIdNumber,
        title: recipe.title || 'Untitled Recipe',
        description: recipe.summary || null,
        imageUrl: recipe.image || null,
        prepTime: recipe.preparationMinutes || 0,
        cookTime: recipe.readyInMinutes || 30,
        servings: recipe.servings || 2,
        difficulty: determineDifficulty(recipe.readyInMinutes, recipe.extendedIngredients?.length),
        cuisineType: recipe.cuisines && recipe.cuisines.length > 0 ? recipe.cuisines[0] : null,
        authorId: userId || null,
        favoriteCount: 0,
        ingredients: {
          create: ingredientsData
        },
        instructions: {
          create: instructionsData
        }
      },
      include: {
        ingredients: true,
        instructions: true
      }
    });

    return newRecipe;
  } catch (error) {
    console.error('Error saving recipe to database:', error);
    return null;
  }
}

// Determine difficulty level based on preparation time and ingredients count
function determineDifficulty(readyInMinutes?: number, ingredientCount?: number): string {
  if (!readyInMinutes && !ingredientCount) return 'Medium';
  
  // Base on time
  if (readyInMinutes) {
    if (readyInMinutes < 20) return 'Easy';
    if (readyInMinutes > 60) return 'Hard';
  }
  
  // Consider ingredients
  if (ingredientCount) {
    if (ingredientCount > 10) return 'Hard';
    if (ingredientCount < 5) return 'Easy';
  }
  
  return 'Medium';
}

// Toggle favorite status for a recipe
export async function toggleFavoriteRecipe(userId: string, recipeId: string) {
  try {
    const existingFavorite = await prisma.favoriteRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId
        }
      }
    });

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteRecipe.delete({
        where: {
          userId_recipeId: {
            userId,
            recipeId
          }
        }
      });
      
      // Decrement favorite count
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { favoriteCount: { decrement: 1 } }
      });
      
      return false; // No longer a favorite
    } else {
      // Add to favorites
      await prisma.favoriteRecipe.create({
        data: {
          userId,
          recipeId
        }
      });
      
      // Increment favorite count
      await prisma.recipe.update({
        where: { id: recipeId },
        data: { favoriteCount: { increment: 1 } }
      });
      
      return true; // Now a favorite
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
}

// Get user's favorite recipes
export async function getUserFavorites(userId: string) {
  try {
    const favorites = await prisma.favoriteRecipe.findMany({
      where: { userId },
      include: { 
        recipe: {
          include: {
            ingredients: true,
            instructions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return favorites.map(fav => fav.recipe);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
}