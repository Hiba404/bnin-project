import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const ingredients = searchParams.get('ingredients');
    const mood = searchParams.get('mood');
    const difficulty = searchParams.get('difficulty');
    
    let whereClause = {};
    
    // Search by name or description
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Filter by ingredients if provided
    if (ingredients) {
      const ingredientIds = ingredients.split(',');
      whereClause.ingredients = {
        some: {
          ingredientId: {
            in: ingredientIds,
          },
        },
      };
    }
    
    // Filter by mood if provided
    if (mood) {
      whereClause.moods = {
        some: {
          moodId: mood,
        },
      };
    }
    
    // Filter by difficulty if provided
    if (difficulty) {
      whereClause.difficulty = difficulty;
    }
    
    const recipes = await prisma.recipe.findMany({
      where: whereClause,
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        moods: {
          include: {
            mood: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      instructions, 
      prepTime, 
      cookTime, 
      difficulty, 
      servings,
      imageUrl,
      videoUrl,
      ingredients,
      moods 
    } = body;
    
    if (!name || !instructions || !ingredients) {
      return NextResponse.json(
        { error: 'Name, instructions, and ingredients are required' }, 
        { status: 400 }
      );
    }
    
    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        instructions,
        prepTime,
        cookTime,
        difficulty,
        servings,
        imageUrl,
        videoUrl,
        ingredients: {
          create: ingredients.map(ing => ({
            quantity: ing.quantity,
            unit: ing.unit,
            ingredient: {
              connect: {
                id: ing.ingredientId
              }
            }
          }))
        },
        moods: {
          create: moods?.map(m => ({
            relevanceScore: m.relevanceScore || 5,
            mood: {
              connect: {
                id: m.moodId
              }
            }
          })) || []
        }
      },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        },
        moods: {
          include: {
            mood: true
          }
        }
      }
    });
    
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create recipe' }, 
      { status: 500 }
    );
  }
}