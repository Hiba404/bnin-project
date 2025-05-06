import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getRecommendationEngine } from '@/lib/ml/recommendationEngine';

const prisma = new PrismaClient();
const recommendationEngine = getRecommendationEngine();

export async function POST(request) {
  try {
    const body = await request.json();
    const { recommendationId, accepted, rating } = body;
    
    if (!recommendationId) {
      return NextResponse.json(
        { error: 'Recommendation ID is required' }, 
        { status: 400 }
      );
    }
    
    // Update the recommendation log
    const updatedLog = await prisma.recommendationLog.update({
      where: { id: recommendationId },
      data: {
        userAccepted: accepted,
      },
    });
    
    // If a rating was provided and the recommendation was accepted, log it in user history
    if (rating && accepted && updatedLog.userId && updatedLog.recipeId) {
      await prisma.userRecipeHistory.create({
        data: {
          userId: updatedLog.userId,
          recipeId: updatedLog.recipeId,
          rating,
          completed: true,
        },
      });
    }
    
    // Update the recommendation model
    await recommendationEngine.updateModel(recommendationId, accepted);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json(
      { error: 'Failed to record feedback' }, 
      { status: 500 }
    );
  }
}