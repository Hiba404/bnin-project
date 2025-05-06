import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    
    const ingredients = await prisma.ingredient.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category, imageUrl, description } = body;
    
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' }, 
        { status: 400 }
      );
    }
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        category,
        imageUrl,
        description,
      },
    });
    
    return NextResponse.json(ingredient, { status: 201 });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to create ingredient' }, 
      { status: 500 }
    );
  }
}