import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getRecommendationEngine } from '@/lib/ml/recommendationEngine';

const prisma = new PrismaClient();
const recommendationEngine = getRecommendationEngine();

export async function POST(request) {
  try {
    const body = await request.json();
    const { ingredientIds, userId } = body;
    
    if (!ingredientIds || !ingredientIds.length) {
      return NextResponse.json(
        { error: 'Ingredient IDs are required' }, 
        { status: 400 }
      );
    }
    
    // Use the ML recommendation engine
    const recommendations = await recommendationEngine.getRecommendationsByIngredients(
      ingredientIds,
      userId
    );
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' }, 
      { status: 500 }
    );
  }
}