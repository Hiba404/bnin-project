const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting database seed...');
    
    // Clean up existing data
    await prisma.recommendationLog.deleteMany();
    await prisma.userRecipeHistory.deleteMany();
    await prisma.userFavorite.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.user.deleteMany();
    await prisma.recipeMood.deleteMany();
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();
    await prisma.ingredientCompatibility.deleteMany();
    await prisma.ingredient.deleteMany();
    await prisma.mood.deleteMany();
    console.log('Database cleared. Starting to add seed data...');
    
    // Seed Moods
    const moods = [
      { name: 'Sweet', description: 'Sweet treats and desserts' },
      { name: 'Savory', description: 'Rich, flavorful dishes' },
      { name: 'Spicy', description: 'Hot and spicy foods' },
      { name: 'Comfort', description: 'Warm, comforting dishes' },
      { name: 'Healthy', description: 'Nutritious and balanced meals' },
      { name: 'Quick', description: 'Fast and easy recipes' },
      { name: 'Hot', description: 'Warm dishes for cold days' },
      { name: 'Cold', description: 'Cool dishes for hot days' },
      { name: 'Breakfast', description: 'Morning meals' },
      { name: 'Lunch', description: 'Midday dishes' },
      { name: 'Dinner', description: 'Evening meals' },
      { name: 'Snack', description: 'Light bites between meals' },
      { name: 'Festive', description: 'Celebration dishes' },
      { name: 'Light', description: 'Light and refreshing options' },
      { name: 'Hearty', description: 'Filling and satisfying meals' }
    ];

    const createdMoods = {};
    for (const mood of moods) {
      const createdMood = await prisma.mood.create({ data: mood });
      createdMoods[mood.name.toLowerCase()] = createdMood;
      console.log(`Created mood: ${mood.name}`);
    }

    // Seed Ingredients
    const ingredients = [
      { name: 'Chicken', category: 'protein', imageUrl: '/images/ingredients/chicken.jpg', description: 'Lean meat, versatile for many dishes' },
      { name: 'Beef', category: 'protein', imageUrl: '/images/ingredients/beef.jpg', description: 'Red meat, good for hearty dishes' },
      { name: 'Pork', category: 'protein', imageUrl: '/images/ingredients/pork.jpg', description: 'Versatile meat for various recipes' },
      { name: 'Salmon', category: 'protein', imageUrl: '/images/ingredients/salmon.jpg', description: 'Fatty fish rich in omega-3' },
      { name: 'Tuna', category: 'protein', imageUrl: '/images/ingredients/tuna.jpg', description: 'Meaty fish for salads and more' },
      { name: 'Shrimp', category: 'protein', imageUrl: '/images/ingredients/shrimp.jpg', description: 'Quick-cooking seafood' },
      { name: 'Tofu', category: 'protein', imageUrl: '/images/ingredients/tofu.jpg', description: 'Plant-based protein' },
      { name: 'Eggs', category: 'protein', imageUrl: '/images/ingredients/eggs.jpg', description: 'Versatile for any meal' },
      { name: 'Lentils', category: 'protein', imageUrl: '/images/ingredients/lentils.jpg', description: 'Plant-based protein source' },
      { name: 'Chickpeas', category: 'protein', imageUrl: '/images/ingredients/chickpeas.jpg', description: 'Versatile legume' },
      
      { name: 'Tomatoes', category: 'vegetable', imageUrl: '/images/ingredients/tomatoes.jpg', description: 'Juicy and versatile' },
      { name: 'Onions', category: 'vegetable', imageUrl: '/images/ingredients/onions.jpg', description: 'Essential flavor base' },
      { name: 'Bell Peppers', category: 'vegetable', imageUrl: '/images/ingredients/bell-peppers.jpg', description: 'Sweet and colorful' },
      { name: 'Carrots', category: 'vegetable', imageUrl: '/images/ingredients/carrots.jpg', description: 'Sweet and crunchy' },
      { name: 'Broccoli', category: 'vegetable', imageUrl: '/images/ingredients/broccoli.jpg', description: 'Nutritious green vegetable' },
      { name: 'Spinach', category: 'vegetable', imageUrl: '/images/ingredients/spinach.jpg', description: 'Leafy green, rich in iron' },
      { name: 'Garlic', category: 'vegetable', imageUrl: '/images/ingredients/garlic.jpg', description: 'Aromatic flavor enhancer' },
      { name: 'Mushrooms', category: 'vegetable', imageUrl: '/images/ingredients/mushrooms.jpg', description: 'Earthy umami flavor' },
      
      { name: 'Rice', category: 'grain', imageUrl: '/images/ingredients/rice.jpg', description: 'Versatile grain staple' },
      { name: 'Pasta', category: 'grain', imageUrl: '/images/ingredients/pasta.jpg', description: 'Italian wheat-based staple' },
      
      { name: 'Cheese', category: 'dairy', imageUrl: '/images/ingredients/cheese.jpg', description: 'Wide variety of dairy product' },
      { name: 'Milk', category: 'dairy', imageUrl: '/images/ingredients/milk.jpg', description: 'Basic dairy beverage' },
      { name: 'Butter', category: 'dairy', imageUrl: '/images/ingredients/butter.jpg', description: 'Dairy fat for cooking' },
      
      { name: 'Flour', category: 'baking', imageUrl: '/images/ingredients/flour.jpg', description: 'Basic baking ingredient' },
      { name: 'Sugar', category: 'baking', imageUrl: '/images/ingredients/sugar.jpg', description: 'Sweetener for baking' },
      { name: 'Baking Powder', category: 'baking', imageUrl: '/images/ingredients/baking-powder.jpg', description: 'Leavening agent' },
      
      { name: 'Olive Oil', category: 'pantry', imageUrl: '/images/ingredients/olive-oil.jpg', description: 'Healthy cooking oil' },
      { name: 'Salt', category: 'pantry', imageUrl: '/images/ingredients/salt.jpg', description: 'Essential flavor enhancer' },
      { name: 'Pepper', category: 'pantry', imageUrl: '/images/ingredients/pepper.jpg', description: 'Spicy seasoning' },
      
      { name: 'Maple Syrup', category: 'sweet', imageUrl: '/images/ingredients/maple-syrup.jpg', description: 'Sweet tree sap syrup' },
      { name: 'Chocolate', category: 'sweet', imageUrl: '/images/ingredients/chocolate.jpg', description: 'Sweet cocoa-based treat' }
    ];

    const createdIngredients = {};
    for (const ingredient of ingredients) {
      const createdIngredient = await prisma.ingredient.create({ data: ingredient });
      createdIngredients[ingredient.name.toLowerCase()] = createdIngredient;
      console.log(`Created ingredient: ${ingredient.name}`);
    }

    // Seed Ingredient Compatibility
    console.log('Creating ingredient compatibility data...');
    
    const incompatiblePairs = [
      ['chocolate', 'chicken'],
      ['chocolate', 'beef'],
      ['chocolate', 'pork'],
      ['chocolate', 'salmon'],
      ['chocolate', 'tuna'],
      ['chocolate', 'shrimp'],
      ['maple syrup', 'tuna'],
      ['maple syrup', 'shrimp']
    ];

    for (const [ingredient1Name, ingredient2Name] of incompatiblePairs) {
      const ingredient1 = createdIngredients[ingredient1Name.toLowerCase()];
      const ingredient2 = createdIngredients[ingredient2Name.toLowerCase()];
      
      if (ingredient1 && ingredient2) {
        // Check if compatibility already exists
        const existingCompatibility = await prisma.ingredientCompatibility.findFirst({
          where: {
            ingredientId: ingredient1.id,
            compatibleWithId: ingredient2.id
          }
        });
        
        if (!existingCompatibility) {
          await prisma.ingredientCompatibility.create({
            data: {
              ingredientId: ingredient1.id,
              compatibleWithId: ingredient2.id,
              compatibilityScore: 1
            }
          });
          
          await prisma.ingredientCompatibility.create({
            data: {
              ingredientId: ingredient2.id,
              compatibleWithId: ingredient1.id,
              compatibilityScore: 1
            }
          });
        }
      }
    }

    const compatiblePairs = [
      ['tomatoes', 'basil'],
      ['cheese', 'pasta'],
      ['chicken', 'garlic'],
      ['beef', 'onions']
    ];

    for (const [ingredient1Name, ingredient2Name] of compatiblePairs) {
      const ingredient1 = createdIngredients[ingredient1Name.toLowerCase()];
      const ingredient2 = createdIngredients[ingredient2Name.toLowerCase()];
      
      if (ingredient1 && ingredient2) {
        const existingCompatibility = await prisma.ingredientCompatibility.findFirst({
          where: {
            ingredientId: ingredient1.id,
            compatibleWithId: ingredient2.id
          }
        });

        if (!existingCompatibility) {
          await prisma.ingredientCompatibility.create({
            data: {
              ingredientId: ingredient1.id,
              compatibleWithId: ingredient2.id,
              compatibilityScore: 10
            }
          });

          await prisma.ingredientCompatibility.create({
            data: {
              ingredientId: ingredient2.id,
              compatibleWithId: ingredient1.id,
              compatibilityScore: 10
            }
          });
        }
      }
    }

    // Seed Recipes
    const recipes = [
      {
        name: 'Classic Pancakes',
        description: 'Fluffy and delicious pancakes, perfect for a weekend breakfast',
        instructions: ['In a large bowl, combine flour, sugar, baking powder, and salt.', 'In another bowl, beat eggs, milk, and melted butter.', 'Stir the wet ingredients into the dry ingredients until just combined.', 'Heat a lightly oiled griddle or frying pan over medium-high heat.', 'Pour the batter onto the griddle, using approximately 1/4 cup for each pancake.', 'Cook until bubbles form and the edges are dry, then flip and cook until browned on the other side.', 'Serve hot with maple syrup.'],
        prepTime: 10,
        cookTime: 15,
        difficulty: 'Easy',
        servings: 4,
        imageUrl: '/images/recipes/pancakes.jpg',
        videoUrl: '/videos/recipes/pancakes.mp4',
        ingredients: [
          { name: 'Flour', quantity: '1.5', unit: 'cups' },
          { name: 'Sugar', quantity: '3.5', unit: 'tablespoons' },
          { name: 'Baking Powder', quantity: '1', unit: 'tablespoon' },
          { name: 'Salt', quantity: '0.25', unit: 'teaspoon' },
          { name: 'Eggs', quantity: '1', unit: 'large' },
          { name: 'Milk', quantity: '1.25', unit: 'cups' },
          { name: 'Butter', quantity: '3', unit: 'tablespoons', note: 'melted' },
          { name: 'Maple Syrup', quantity: 'to taste', unit: '' }
        ],
        moods: ['breakfast', 'sweet', 'comfort']
      },
      {
        name: 'Chicken Stir Fry',
        description: 'A quick and flavorful stir fry with chicken and vegetables',
        instructions: ['Cut chicken into bite-sized pieces.', 'Slice vegetables.', 'Heat oil in a wok or large frying pan.', 'Add chicken and cook until no longer pink.', 'Add vegetables and stir-fry until tender-crisp.', 'Add sauce and cook until thickened.', 'Serve hot over rice.'],
        prepTime: 15,
        cookTime: 10,
        difficulty: 'Medium',
        servings: 4,
        imageUrl: '/images/recipes/chicken-stir-fry.jpg',
        videoUrl: '/videos/recipes/chicken-stir-fry.mp4',
        ingredients: [
          { name: 'Chicken', quantity: '500', unit: 'g' },
          { name: 'Bell Peppers', quantity: '2', unit: '' },
          { name: 'Onions', quantity: '1', unit: 'large' },
          { name: 'Garlic', quantity: '2', unit: 'cloves' },
          { name: 'Olive Oil', quantity: '2', unit: 'tablespoons' },
          { name: 'Rice', quantity: '2', unit: 'cups', note: 'cooked' }
        ],
        moods: ['dinner', 'quick', 'healthy']
      }
    ];

    // Create the recipes in the database
    for (const recipe of recipes) {
      const { ingredients: recipeIngredients, moods: recipeMoods, ...recipeData } = recipe;
      
      // Create recipe
      const createdRecipe = await prisma.recipe.create({
        data: recipeData
      });
      
      console.log(`Created recipe: ${recipe.name}`);
      
      // Add ingredients to recipe
      for (const ingredient of recipeIngredients) {
        const dbIngredient = await prisma.ingredient.findFirst({
          where: {
            name: {
              contains: ingredient.name,
              mode: 'insensitive'
            }
          }
        });
        
        if (dbIngredient) {
          await prisma.recipeIngredient.create({
            data: {
              recipeId: createdRecipe.id,
              ingredientId: dbIngredient.id,
              quantity: ingredient.quantity,
              unit: ingredient.unit || ''
            }
          });
        } else {
          console.warn(`Warning: Ingredient "${ingredient.name}" not found in the database.`);
        }
      }
      
      // Add moods to recipe
      for (const moodName of recipeMoods) {
        const dbMood = createdMoods[moodName.toLowerCase()];
        
        if (dbMood) {
          await prisma.recipeMood.create({
            data: {
              recipeId: createdRecipe.id,
              moodId: dbMood.id,
              relevanceScore: 8 // Default high relevance score
            }
          });
        } else {
          console.warn(`Warning: Mood "${moodName}" not found in the database.`);
        }
      }
    }

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: '$2a$10$dZzQkVkVVSPW9xBjUDPMheQ3U7zgjdXGu6xjkQG.l.eBfrGY7hkZW', // 'password'
        profileImage: '/images/users/default.jpg'
      }
    });
    
    console.log('Created test user: testuser');

    // Create user preferences
    await prisma.userPreference.create({
      data: {
        userId: testUser.id,
        preferredIngredients: [
          createdIngredients['chicken'].id,
          createdIngredients['pasta'].id,
          createdIngredients['cheese'].id
        ],
        dislikedIngredients: [
          createdIngredients['mushrooms'].id
        ],
        allergies: [],
        dietaryRestrictions: [],
        preferredMoods: [
          createdMoods['comfort'].id,
          createdMoods['quick'].id
        ]
      }
    });
    
    console.log('Created user preferences for test user');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();