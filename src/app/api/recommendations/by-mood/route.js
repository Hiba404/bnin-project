import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getRecommendationEngine } from '@/lib/ml/recommendationEngine';

const prisma = new PrismaClient();
const recommendationEngine = getRecommendationEngine();

export async function POST(request) {
  try {
    const body = await request.json();
    const { moodId, userId } = body;
    
    if (!moodId) {
      return NextResponse.json(
        { error: 'Mood ID is required' }, 
        { status: 400 }
      );
    }
    
    // Use the ML recommendation engine
    const recommendations = await recommendationEngine.getRecommendationsByMood(
      moodId,
      userId
    );
    
    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating mood-based recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' }, 
      { status: 500 }
    );
  }
}