// Update src/app/api/favorites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params (in a real app, use authentication)
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get user's favorites
    const favorites = await prisma.favoriteRecipe.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            ingredients: true,
            instructions: { orderBy: { stepNo: 'asc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(favorites.map(fav => fav.recipe));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, recipeId } = await request.json();
    
    if (!userId || !recipeId) {
      return NextResponse.json({ error: 'User ID and Recipe ID are required' }, { status: 400 });
    }
    
    // Check if favorite already exists
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
      
      return NextResponse.json({ isFavorite: false });
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
      
      return NextResponse.json({ isFavorite: true });
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    return NextResponse.json({ error: 'Failed to update favorite status' }, { status: 500 });
  }
}