// File: /lib/bnin-assistant.js

import { getRecommendationEngine } from './ml/recommendationEngine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * BNIN Chatbot Assistant Class
 * 
 * Provides contextual and personalized recommendations to users
 * based on various factors including weather, time of day, 
 * user preferences, and past behavior.
 */
class BninAssistant {
  constructor() {
    this.name = 'Bnin';
    this.avatarUrl = '/images/bnin-avatar.png';
    this.recommendationEngine = getRecommendationEngine();
  }

  /**
   * Get a contextual greeting based on various factors
   * @param {String} userId - User ID (optional)
   * @param {Object} context - Contextual information
   * @returns {Object} - Greeting message and suggestions
   */
  async getContextualGreeting(userId = null, context = {}) {
    // Get user data if available
    let user = null;
    let userName = 'there';
    
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (user) {
        userName = user.username;
      }
    }
    
    // Extract context variables or use defaults
    const {
      location = null,
      weather = null,
      temperature = null,
      timeOfDay = this.getTimeOfDay(),
      dayOfWeek = new Date().getDay(),
    } = context;
    
    // Base greeting based on time of day
    let greeting = '';
    
    switch (timeOfDay) {
      case 'morning':
        greeting = `Good morning, ${userName}! Ready for breakfast?`;
        break;
      case 'afternoon':
        greeting = `Good afternoon, ${userName}! Need some lunch ideas?`;
        break;
      case 'evening':
        greeting = `Good evening, ${userName}! Thinking about dinner?`;
        break;
      case 'night':
        greeting = `Hello ${userName}! Looking for a late night snack?`;
        break;
      default:
        greeting = `Hello ${userName}! What are you craving today?`;
    }
    
    // Add weather-based suggestions if available
    let suggestions = [];
    
    if (weather && temperature) {
      suggestions = await this.suggestRecipesByWeather(weather, temperature);
    } else {
      // Default to time-based suggestions
      suggestions = await this.suggestRecipesByTimeOfDay(timeOfDay);
    }
    
    // Add personalized suggestions if user is logged in
    if (userId) {
      const personalSuggestions = await this.getPersonalizedSuggestions(userId);
      
      if (personalSuggestions.length > 0) {
        suggestions = [...personalSuggestions, ...suggestions].slice(0, 3);
      }
    }
    
    // Format response
    const response = {
      greeting,
      suggestions,
    };
    
    // Special cases for days of the week
    if (dayOfWeek === 5) { // Friday
      response.specialSuggestion = "It's Friday! How about something festive?";
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      response.specialSuggestion = "Weekend cooking time! Try something new?";
    }
    
    return response;
  }

  /**
   * Get the current time of day
   * @returns {String} - Time of day category
   */
  getTimeOfDay() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'evening';
    } else {
      return 'night';
    }
  }

  /**
   * Suggest recipes based on weather conditions
   * @param {String} weather - Weather condition
   * @param {Number} temperature - Temperature in celsius
   * @returns {Array} - Array of recipe suggestions
   */
  async suggestRecipesByWeather(weather, temperature) {
    // Map weather conditions to moods
    const weatherMoodMap = {
      'sunny': ['refreshing', 'light', 'cold'],
      'rainy': ['comfort', 'hot', 'savory'],
      'cloudy': ['comfort', 'savory'],
      'snowy': ['hot', 'comfort', 'sweet'],
      'stormy': ['comfort', 'savory', 'hot'],
      'windy': ['hot', 'savory'],
      'foggy': ['hot', 'spicy', 'comfort'],
    };
    
    // Map temperature ranges to moods
    let tempMoods = [];
    
    if (temperature < 5) {
      tempMoods = ['hot', 'comfort', 'soup'];
    } else if (temperature < 15) {
      tempMoods = ['warm', 'comfort'];
    } else if (temperature < 25) {
      tempMoods = ['balanced', 'refreshing'];
    } else if (temperature < 32) {
      tempMoods = ['cold', 'refreshing', 'light'];
    } else {
      tempMoods = ['cold', 'hydrating', 'light'];
    }
    
    // Combine weather and temperature moods
    let combinedMoods = [];
    
    if (weather && weatherMoodMap[weather.toLowerCase()]) {
      combinedMoods = [...weatherMoodMap[weather.toLowerCase()], ...tempMoods];
    } else {
      combinedMoods = tempMoods;
    }
    
    // Get unique mood names
    const uniqueMoods = [...new Set(combinedMoods)];
    
    // Get mood IDs from database
    const moods = await prisma.mood.findMany({
      where: {
        name: {
          in: uniqueMoods.map(m => m.charAt(0).toUpperCase() + m.slice(1)) // Capitalize first letter
        }
      }
    });
    
    // Get recipe suggestions based on moods
    const suggestions = [];
    
    for (const mood of moods) {
      if (suggestions.length >= 3) break;
      
      const recipes = await prisma.recipe.findMany({
        where: {
          moods: {
            some: {
              moodId: mood.id,
              relevanceScore: {
                gte: 7 // Only highly relevant recipes
              }
            }
          }
        },
        take: 2,
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Format recipe suggestions
      for (const recipe of recipes) {
        if (suggestions.length >= 3) break;
        
        suggestions.push({
          id: recipe.id,
          name: recipe.name,
          message: this.getWeatherSuggestionMessage(weather, temperature, mood.name, recipe.name),
          imageUrl: recipe.imageUrl,
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Generate a weather-based suggestion message
   */
  getWeatherSuggestionMessage(weather, temperature, mood, recipeName) {
    // Cold weather messages
    if (temperature < 10) {
      if (weather === 'snowy') {
        return `It's snowing outside! How about warming up with this ${recipeName}?`;
      } else if (weather === 'rainy') {
        return `Cold and rainy today! This ${recipeName} will warm you right up.`;
      } else {
        return `It's cold out there! Try this ${recipeName} to stay warm.`;
      }
    }
    // Hot weather messages
    else if (temperature > 25) {
      if (weather === 'sunny') {
        return `Hot and sunny today! Cool down with this refreshing ${recipeName}.`;
      } else {
        return `It's pretty warm today. This ${recipeName} won't overheat you.`;
      }
    }
    // Moderate temperature messages
    else {
      if (weather === 'rainy') {
        return `Rainy day comfort food alert! Try this ${recipeName}.`;
      } else if (weather === 'cloudy') {
        return `Cloudy day? Brighten it up with this ${recipeName}.`;
      } else {
        return `Perfect weather for this ${recipeName}!`;
      }
    }
  }

  /**
   * Suggest recipes based on time of day
   * @param {String} timeOfDay - Time of day category
   * @returns {Array} - Array of recipe suggestions
   */
  async suggestRecipesByTimeOfDay(timeOfDay) {
    // Map time of day to recipe categories
    const timeCategories = {
      'morning': ['breakfast', 'brunch', 'quick'],
      'afternoon': ['lunch', 'salad', 'sandwich', 'quick'],
      'evening': ['dinner', 'main course', 'family meal'],
      'night': ['snack', 'dessert', 'light']
    };
    
    const categories = timeCategories[timeOfDay] || ['quick', 'any'];
    
    // Get mood IDs from database that match these categories
    const moods = await prisma.mood.findMany({
      where: {
        name: {
          in: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)) // Capitalize first letter
        }
      }
    });
    
    const moodIds = moods.map(m => m.id);
    
    // Get recipe suggestions based on moods
    const recipes = await prisma.recipe.findMany({
      where: {
        moods: {
          some: {
            moodId: {
              in: moodIds
            }
          }
        }
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Format recipe suggestions
    return recipes.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      message: this.getTimeBasedSuggestionMessage(timeOfDay, recipe.name),
      imageUrl: recipe.imageUrl,
    }));
  }

  /**
   * Generate a time-based suggestion message
   */
  getTimeBasedSuggestionMessage(timeOfDay, recipeName) {
    switch (timeOfDay) {
      case 'morning':
        return `Jump start your day with this ${recipeName}!`;
      case 'afternoon':
        return `Perfect lunch option: ${recipeName}`;
      case 'evening':
        return `For a delicious dinner tonight: ${recipeName}`;
      case 'night':
        return `Late night craving? Try this ${recipeName}`;
      default:
        return `How about trying this ${recipeName}?`;
    }
  }

  /**
   * Get personalized recipe suggestions based on user preferences and history
   * @param {String} userId - User ID
   * @returns {Array} - Array of personalized recipe suggestions
   */
  async getPersonalizedSuggestions(userId) {
    // Get user preferences
    const userPreferences = await prisma.userPreference.findUnique({
      where: { userId }
    });
    
    // Get user recipe history
    const userHistory = await prisma.userRecipeHistory.findMany({
      where: { userId },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 10,
      include: {
        recipe: {
          include: {
            ingredients: true,
            moods: true
          }
        }
      }
    });
    
    // If we don't have enough user data, return empty array
    if (!userPreferences && userHistory.length === 0) {
      return [];
    }
    
    // Extract preferred ingredients and moods
    const preferredIngredients = userPreferences?.preferredIngredients || [];
    const preferredMoods = userPreferences?.preferredMoods || [];
    
    // Extract ingredients and moods from highly rated recipes in history
    const highlyRatedRecipes = userHistory.filter(h => h.rating && h.rating >= 4);
    
    const historicalIngredients = new Set();
    const historicalMoods = new Set();
    
    highlyRatedRecipes.forEach(historyItem => {
      historyItem.recipe.ingredients.forEach(ri => {
        historicalIngredients.add(ri.ingredientId);
      });
      
      historyItem.recipe.moods.forEach(rm => {
        historicalMoods.add(rm.moodId);
      });
    });
    
    // Combine preferences and history
    const combinedIngredients = [...new Set([...preferredIngredients, ...historicalIngredients])];
    const combinedMoods = [...new Set([...preferredMoods, ...historicalMoods])];
    
    // If we still don't have enough data, return empty array
    if (combinedIngredients.length === 0 && combinedMoods.length === 0) {
      return [];
    }
    
    // Get personalized recommendations
    let personalizedRecipes = [];
    
    // Try ingredient-based recommendations first
    if (combinedIngredients.length > 0) {
      personalizedRecipes = await this.recommendationEngine.getRecommendationsByIngredients(
        combinedIngredients,
        userId
      );
    }
    
    // If we don't have enough, try mood-based recommendations
    if (personalizedRecipes.length < 3 && combinedMoods.length > 0) {
      const moodId = combinedMoods[Math.floor(Math.random() * combinedMoods.length)];
      
      const moodRecipes = await this.recommendationEngine.getRecommendationsByMood(
        moodId,
        userId
      );
      
      // Add mood recipes that aren't already in personalized recipes
      const existingIds = new Set(personalizedRecipes.map(r => r.id));
      
      for (const recipe of moodRecipes) {
        if (!existingIds.has(recipe.id)) {
          personalizedRecipes.push(recipe);
          if (personalizedRecipes.length >= 3) break;
        }
      }
    }
    
    // Format personalized suggestions
    return personalizedRecipes.slice(0, 3).map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      message: this.getPersonalizedSuggestionMessage(recipe.name),
      imageUrl: recipe.imageUrl,
    }));
  }

  /**
   * Generate a personalized suggestion message
   * @param {String} recipeName - Recipe name
   * @returns {String} - Personalized suggestion message
   */
  getPersonalizedSuggestionMessage(recipeName) {
    const personalPhrases = [
      `Based on your favorites, you might love this ${recipeName}!`,
      `You've enjoyed similar recipes, try this ${recipeName}!`,
      `This ${recipeName} matches your taste preferences!`,
      `We think you'll really enjoy this ${recipeName}!`,
      `Specially selected for you: ${recipeName}`,
    ];
    
    return personalPhrases[Math.floor(Math.random() * personalPhrases.length)];
  }

  /**
   * Get weather data from external API
   * @param {String} location - User location
   * @returns {Object} - Weather data
   */
  async getWeatherData(location) {
    try {
      // This would be replaced with an actual weather API call
      // For demonstration purposes, we'll return mock data
      const mockWeatherData = {
        location: location || 'Unknown',
        weather: 'sunny',
        temperature: 22,
        humidity: 45,
        windSpeed: 10,
      };
      
      return mockWeatherData;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  /**
   * Handle user query in chat
   * @param {String} userId - User ID (optional)
   * @param {String} query - User query text
   * @returns {Object} - Response with message and action suggestions
   */
  async handleChatQuery(userId, query) {
    // Convert query to lowercase for case-insensitive matching
    const lowercaseQuery = query.toLowerCase();
    
    // Check for ingredient-related queries
    if (lowercaseQuery.includes('what can i make with') || 
        lowercaseQuery.includes('recipes with') ||
        lowercaseQuery.includes('have these ingredients')) {
      return this.handleIngredientQuery(userId, query);
    }
    
    // Check for mood-related queries
    if (lowercaseQuery.includes('feeling') || 
        lowercaseQuery.includes('in the mood for') ||
        lowercaseQuery.includes('craving')) {
      return this.handleMoodQuery(userId, query);
    }
    
    // Check for time-related queries
    if (lowercaseQuery.includes('breakfast') || 
        lowercaseQuery.includes('lunch') ||
        lowercaseQuery.includes('dinner') ||
        lowercaseQuery.includes('snack')) {
      return this.handleTimeBasedQuery(userId, query);
    }
    
    // Check for weather-related queries
    if (lowercaseQuery.includes('cold') || 
        lowercaseQuery.includes('hot') ||
        lowercaseQuery.includes('rainy') ||
        lowercaseQuery.includes('weather')) {
      return this.handleWeatherQuery(userId, query);
    }
    
    // If no specific intent is detected, provide a generic response
    return {
      message: "I'm not quite sure what you're looking for. Would you like to browse recipes by ingredients, mood, or get a recommendation?",
      actions: [
        {
          type: 'navigate',
          destination: 'myFridge',
          label: 'Browse by Ingredients'
        },
        {
          type: 'navigate',
          destination: 'moodBite',
          label: 'Browse by Mood'
        },
        {
          type: 'suggestion',
          label: 'Recommend something for dinner'
        }
      ]
    };
  }

  /**
   * Handle ingredient-related queries
   * @param {String} userId - User ID (optional)
   * @param {String} query - User query text
   * @returns {Object} - Response with message and action suggestions
   */
  async handleIngredientQuery(userId, query) {
    // Extract ingredients from query using NLP
    // This would be more sophisticated in a real implementation
    const ingredients = this.extractIngredientsFromQuery(query);
    
    if (ingredients.length === 0) {
      return {
        message: "I'd be happy to help you find recipes based on ingredients you have. What ingredients would you like to use?",
        actions: [
          {
            type: 'navigate',
            destination: 'myFridge',
            label: 'Select Ingredients'
          }
        ]
      };
    }
    
    // Get ingredients from database
    const dbIngredients = await prisma.ingredient.findMany({
      where: {
        name: {
          in: ingredients.map(ing => ing.charAt(0).toUpperCase() + ing.slice(1)) // Capitalize first letter
        }
      }
    });
    
    if (dbIngredients.length === 0) {
      return {
        message: `I couldn't find any recipes with ${ingredients.join(', ')}. Would you like to browse all available ingredients?`,
        actions: [
          {
            type: 'navigate',
            destination: 'myFridge',
            label: 'Browse Ingredients'
          }
        ]
      };
    }
    
    // Get ingredient IDs
    const ingredientIds = dbIngredients.map(ing => ing.id);
    
    // Get recipe recommendations
    const recommendations = await this.recommendationEngine.getRecommendationsByIngredients(
      ingredientIds,
      userId
    );
    
    if (recommendations.length === 0) {
      return {
        message: `I couldn't find any recipes with ${ingredients.join(', ')}. Would you like to browse all available ingredients?`,
        actions: [
          {
            type: 'navigate',
            destination: 'myFridge',
            label: 'Browse Ingredients'
          }
        ]
      };
    }
    
    // Format response
    const topRecipes = recommendations.slice(0, 3);
    
    return {
      message: `Great! Here are some recipes you can make with ${ingredients.join(', ')}:`,
      recipes: topRecipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl,
        missingIngredients: recipe.missingIngredients
      })),
      actions: [
        {
          type: 'navigate',
          destination: 'recipeDetail',
          params: { recipeId: topRecipes[0].id },
          label: `View ${topRecipes[0].name}`
        },
        {
          type: 'navigate',
          destination: 'myFridge',
          label: 'Select Different Ingredients'
        }
      ]
    };
  }

  /**
   * Extract ingredients from user query
   * @param {String} query - User query text
   * @returns {Array} - Array of ingredient names
   */
  extractIngredientsFromQuery(query) {
    // This would be more sophisticated in a real implementation
    // using NLP or a dedicated entity extraction service
    
    // Basic implementation: look for keywords and extract words after them
    const keywordPatterns = [
      /what can i make with\s+(.+)/i,
      /recipes with\s+(.+)/i,
      /have\s+(.+)/i,
      /using\s+(.+)/i,
    ];
    
    for (const pattern of keywordPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        // Split the matching text by commas and 'and'
        return match[1].split(/,|\sand\s/)
          .map(item => item.trim().toLowerCase())
          .filter(item => item.length > 0);
      }
    }
    
    return [];
  }

  /**
   * Handle mood-related queries
   * @param {String} userId - User ID (optional)
   * @param {String} query - User query text
   * @returns {Object} - Response with message and action suggestions
   */
  async handleMoodQuery(userId, query) {
    // Extract mood from query using NLP
    // This would be more sophisticated in a real implementation
    const mood = this.extractMoodFromQuery(query);
    
    if (!mood) {
      return {
        message: "I'd be happy to suggest recipes based on your mood. What are you craving?",
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Select Mood'
          }
        ]
      };
    }
    
    // Get mood from database
    const dbMood = await prisma.mood.findFirst({
      where: {
        name: {
          equals: mood.charAt(0).toUpperCase() + mood.slice(1) // Capitalize first letter
        }
      }
    });
    
    if (!dbMood) {
      return {
        message: `I don't have any recipes categorized as "${mood}". Would you like to browse all mood categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Moods'
          }
        ]
      };
    }
    
    // Get recipe recommendations
    const recommendations = await this.recommendationEngine.getRecommendationsByMood(
      dbMood.id,
      userId
    );
    
    if (recommendations.length === 0) {
      return {
        message: `I couldn't find any ${mood} recipes right now. Would you like to browse all mood categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Moods'
          }
        ]
      };
    }
    
    // Format response
    const topRecipes = recommendations.slice(0, 3);
    
    return {
      message: `Here are some ${mood} recipes you might enjoy:`,
      recipes: topRecipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl
      })),
      actions: [
        {
          type: 'navigate',
          destination: 'recipeDetail',
          params: { recipeId: topRecipes[0].id },
          label: `View ${topRecipes[0].name}`
        },
        {
          type: 'navigate',
          destination: 'moodBite',
          label: 'Select Different Mood'
        }
      ]
    };
  }

  /**
   * Extract mood from user query
   * @param {String} query - User query text
   * @returns {String} - Mood name or null
   */
  extractMoodFromQuery(query) {
    // This would be more sophisticated in a real implementation
    // using NLP or a dedicated entity extraction service
    
    // Common mood keywords
    const moodKeywords = [
      'sweet', 'savory', 'spicy', 'comfort', 'healthy',
      'quick', 'hot', 'cold', 'refreshing', 'light',
      'hearty', 'decadent', 'simple', 'fancy', 'festive'
    ];
    
    // Check for direct mentions of moods
    for (const mood of moodKeywords) {
      if (query.toLowerCase().includes(mood)) {
        return mood;
      }
    }
    
    // Check for phrases indicating moods
    const moodPhrases = [
      { phrase: /in the mood for\s+(.+)/i, group: 1 },
      { phrase: /craving\s+(.+)/i, group: 1 },
      { phrase: /feeling like\s+(.+)/i, group: 1 },
      { phrase: /want\s+(.+)/i, group: 1 }
    ];
    
    for (const { phrase, group } of moodPhrases) {
      const match = query.match(phrase);
      if (match && match[group]) {
        const extractedText = match[group].trim().toLowerCase();
        
        // Look for mood keywords in the extracted text
        for (const mood of moodKeywords) {
          if (extractedText.includes(mood)) {
            return mood;
          }
        }
        
        // If no mood keyword is found, use the first word of the extracted text
        const firstWord = extractedText.split(' ')[0];
        if (firstWord && firstWord.length > 2) {
          return firstWord;
        }
      }
    }
    
    return null;
  }

  /**
   * Handle time-based queries (breakfast, lunch, dinner, etc.)
   * @param {String} userId - User ID (optional)
   * @param {String} query - User query text
   * @returns {Object} - Response with message and action suggestions
   */
  async handleTimeBasedQuery(userId, query) {
    const lowercaseQuery = query.toLowerCase();
    let mealType = '';
    
    if (lowercaseQuery.includes('breakfast')) {
      mealType = 'Breakfast';
    } else if (lowercaseQuery.includes('lunch')) {
      mealType = 'Lunch';
    } else if (lowercaseQuery.includes('dinner')) {
      mealType = 'Dinner';
    } else if (lowercaseQuery.includes('snack')) {
      mealType = 'Snack';
    } else if (lowercaseQuery.includes('dessert')) {
      mealType = 'Dessert';
    } else {
      mealType = 'Quick'; // Default if no specific meal type is mentioned
    }
    
    // Get mood from database
    const dbMood = await prisma.mood.findFirst({
      where: {
        name: mealType
      }
    });
    
    if (!dbMood) {
      return {
        message: `I don't have any recipes categorized as "${mealType}". Would you like to browse all recipe categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Categories'
          }
        ]
      };
    }
    
    // Get recipe recommendations
    const recommendations = await this.recommendationEngine.getRecommendationsByMood(
      dbMood.id,
      userId
    );
    
    if (recommendations.length === 0) {
      return {
        message: `I couldn't find any ${mealType.toLowerCase()} recipes right now. Would you like to browse all categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Categories'
          }
        ]
      };
    }
    
    // Format response
    const topRecipes = recommendations.slice(0, 3);
    
    return {
      message: `Here are some ${mealType.toLowerCase()} ideas for you:`,
      recipes: topRecipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl
      })),
      actions: [
        {
          type: 'navigate',
          destination: 'recipeDetail',
          params: { recipeId: topRecipes[0].id },
          label: `View ${topRecipes[0].name}`
        }
      ]
    };
  }

  /**
   * Handle weather-related queries
   * @param {String} userId - User ID (optional)
   * @param {String} query - User query text
   * @returns {Object} - Response with message and action suggestions
   */
  async handleWeatherQuery(userId, query) {
    const lowercaseQuery = query.toLowerCase();
    let weatherCondition = '';
    
    if (lowercaseQuery.includes('cold')) {
      weatherCondition = 'cold';
    } else if (lowercaseQuery.includes('hot')) {
      weatherCondition = 'hot';
    } else if (lowercaseQuery.includes('rainy')) {
      weatherCondition = 'rainy';
    } else if (lowercaseQuery.includes('snowy')) {
      weatherCondition = 'snowy';
    } else {
      // Get actual weather data if available
      const location = this.extractLocationFromQuery(query);
      const weatherData = await this.getWeatherData(location);
      
      if (weatherData) {
        weatherCondition = weatherData.weather;
      } else {
        weatherCondition = 'any'; // Default if no specific weather is mentioned or detected
      }
    }
    
    // Get mood related to weather
    let moodName = '';
    
    switch (weatherCondition) {
      case 'cold':
      case 'snowy':
        moodName = 'Hot';
        break;
      case 'hot':
        moodName = 'Cold';
        break;
      case 'rainy':
        moodName = 'Comfort';
        break;
      default:
        moodName = 'Any';
    }
    
    // Get mood from database
    const dbMood = await prisma.mood.findFirst({
      where: {
        name: moodName
      }
    });
    
    if (!dbMood) {
      return {
        message: `I don't have any recipes specifically for ${weatherCondition} weather. Would you like to browse all categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Categories'
          }
        ]
      };
    }
    
    // Get recipe recommendations
    const recommendations = await this.recommendationEngine.getRecommendationsByMood(
      dbMood.id,
      userId
    );
    
    if (recommendations.length === 0) {
      return {
        message: `I couldn't find any recipes for ${weatherCondition} weather right now. Would you like to browse all categories?`,
        actions: [
          {
            type: 'navigate',
            destination: 'moodBite',
            label: 'Browse Categories'
          }
        ]
      };
    }
    
    // Format response
    const topRecipes = recommendations.slice(0, 3);
    let message = '';
    
    switch (weatherCondition) {
      case 'cold':
      case 'snowy':
        message = `For this cold weather, I recommend these warming recipes:`;
        break;
      case 'hot':
        message = `To beat the heat, try these refreshing recipes:`;
        break;
      case 'rainy':
        message = `Perfect comfort food for a rainy day:`;
        break;
      default:
        message = `Based on the weather, you might enjoy these recipes:`;
    }
    
    return {
      message,
      recipes: topRecipes.map(recipe => ({
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl
      })),
      actions: [
        {
          type: 'navigate',
          destination: 'recipeDetail',
          params: { recipeId: topRecipes[0].id },
          label: `View ${topRecipes[0].name}`
        }
      ]
    };
  }

  /**
   * Extract location from user query
   * @param {String} query - User query text
   * @returns {String} - Location or null
   */
  extractLocationFromQuery(query) {
    // This would be more sophisticated in a real implementation
    // using NLP or a dedicated entity extraction service
    
    // Check for location phrases
    const locationPhrases = [
      { phrase: /in\s+(.+)/i, group: 1 },
      { phrase: /at\s+(.+)/i, group: 1 },
      { phrase: /for\s+(.+)\s+weather/i, group: 1 }
    ];
    
    for (const { phrase, group } of locationPhrases) {
      const match = query.match(phrase);
      if (match && match[group]) {
        return match[group].trim();
      }
    }
    
    return null;
  }
}

// Export singleton instance
let bninAssistant;

export function getBninAssistant() {
  if (!bninAssistant) {
    bninAssistant = new BninAssistant();
  }
  return bninAssistant;
}