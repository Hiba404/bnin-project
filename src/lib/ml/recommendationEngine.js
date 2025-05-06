// File: /lib/ml/recommendationEngine.js

import * as tf from 'tensorflow';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * BNIN Recipe Recommendation Engine
 * 
 * This engine uses a hybrid approach combining:
 * 1. Content-based filtering (ingredients, moods)
 * 2. Collaborative filtering (user behavior)
 * 3. Contextual awareness (time, weather, etc.)
 */
class RecommendationEngine {
  constructor() {
    this.model = null;
    this.initialized = false;
  }

  /**
   * Initialize the recommendation engine
   */
  async initialize() {
    try {
      // Load the pre-trained model or train a new one
      this.model = await this.loadModel();
      this.initialized = true;
      console.log('Recommendation engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize recommendation engine:', error);
      throw error;
    }
  }

  /**
   * Load the TensorFlow model or train a new one if not available
   */
  async loadModel() {
    try {
      // Try to load existing model
      return await tf.loadLayersModel('file:///path/to/model/model.json');
    } catch (error) {
      console.log('No existing model found, training new model...');
      return await this.trainModel();
    }
  }

  /**
   * Train a new recommendation model using historical data
   */
  async trainModel() {
    // Get training data from database
    const trainingData = await this.getTrainingData();
    
    // Prepare features and labels
    const { features, labels } = this.prepareTrainingData(trainingData);
    
    // Define model architecture
    const model = tf.sequential();
    
    // Input layer - size depends on our feature vector
    model.add(tf.layers.dense({
      units: 128,
      activation: 'relu',
      inputShape: [features[0].length]
    }));
    
    // Hidden layers
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu'
    }));
    
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    // Output layer - predicts recipe relevance score
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile the model
    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Convert data to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    // Train the model
    await model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
        }
      }
    });
    
    // Save the model
    await model.save('file:///path/to/model');
    
    return model;
  }

  /**
   * Get training data from database
   */
  async getTrainingData() {
    // Fetch recommendation logs with user feedback
    const recommendationLogs = await prisma.recommendationLog.findMany({
      where: {
        userAccepted: {
          not: null
        }
      },
      include: {
        user: {
          include: {
            preferences: true
          }
        },
        recipe: {
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
        }
      }
    });
    
    // Fetch user recipe history with ratings
    const userHistory = await prisma.userRecipeHistory.findMany({
      where: {
        rating: {
          not: null
        }
      },
      include: {
        user: true,
        recipe: true
      }
    });
    
    return {
      recommendationLogs,
      userHistory
    };
  }

  /**
   * Prepare training data for ML model
   */
  prepareTrainingData(data) {
    const { recommendationLogs, userHistory } = data;
    const features = [];
    const labels = [];
    
    // Process recommendation logs
    recommendationLogs.forEach(log => {
      // Create feature vector
      const featureVector = this.createFeatureVector(
        log.user,
        log.recipe,
        log.inputIngredients,
        log.inputMoodId
      );
      
      features.push(featureVector);
      
      // Label: 1 if user accepted recommendation, 0 if not
      labels.push([log.userAccepted ? 1 : 0]);
    });
    
    // Process user history for additional training data
    userHistory.forEach(history => {
      // Skip entries with no rating
      if (history.rating === null) return;
      
      // Create feature vector
      const featureVector = this.createFeatureVector(
        history.user,
        history.recipe,
        [], // No input ingredients for this type of data
        null // No input mood for this type of data
      );
      
      features.push(featureVector);
      
      // Label: normalize rating from 1-5 to 0-1
      labels.push([history.rating / 5]);
    });
    
    return { features, labels };
  }

  /**
   * Create a feature vector for the ML model
   * @param {Object} user - User data
   * @param {Object} recipe - Recipe data
   * @param {Array} inputIngredients - Ingredient IDs selected by user
   * @param {String} inputMoodId - Mood ID selected by user
   * @returns {Array} - Feature vector
   */
  createFeatureVector(user, recipe, inputIngredients, inputMoodId) {
    // Initialize feature vector
    const featureVector = [];
    
    // === Recipe features ===
    
    // Difficulty (normalized)
    const difficultyMap = {
      'Easy': 0,
      'Medium': 0.5,
      'Hard': 1
    };
    featureVector.push(difficultyMap[recipe.difficulty] || 0.5);
    
    // Preparation time (normalized to 0-1, assuming max 120 minutes)
    featureVector.push(Math.min(recipe.prepTime / 120, 1));
    
    // Cook time (normalized to 0-1, assuming max 180 minutes)
    featureVector.push(Math.min(recipe.cookTime / 180, 1));
    
    // === Ingredient features ===
    
    // Percentage of input ingredients used in recipe
    if (inputIngredients.length > 0) {
      const recipeIngredientIds = recipe.ingredients.map(ri => ri.ingredientId);
      const matchingIngredients = inputIngredients.filter(id => 
        recipeIngredientIds.includes(id)
      );
      featureVector.push(matchingIngredients.length / inputIngredients.length);
    } else {
      featureVector.push(0);
    }
    
    // === Mood features ===
    
    // Mood relevance
    if (inputMoodId && recipe.moods.length > 0) {
      const moodRelevance = recipe.moods.find(m => m.moodId === inputMoodId)?.relevanceScore || 0;
      featureVector.push(moodRelevance / 10); // Normalize to 0-1
    } else {
      featureVector.push(0);
    }
    
    // === User preference features ===
    
    if (user && user.preferences) {
      // Check if recipe contains any preferred ingredients
      const preferredIngredientsUsed = recipe.ingredients.filter(ri => 
        user.preferences.preferredIngredients.includes(ri.ingredientId)
      ).length;
      featureVector.push(preferredIngredientsUsed > 0 ? 1 : 0);
      
      // Check if recipe contains any disliked ingredients
      const dislikedIngredientsUsed = recipe.ingredients.filter(ri => 
        user.preferences.dislikedIngredients.includes(ri.ingredientId)
      ).length;
      featureVector.push(dislikedIngredientsUsed > 0 ? 0 : 1);
      
      // Check if recipe contains any allergens
      const allergensUsed = recipe.ingredients.filter(ri => 
        user.preferences.allergies.includes(ri.ingredientId)
      ).length;
      featureVector.push(allergensUsed > 0 ? 0 : 1);
    } else {
      // Default values if no user preferences
      featureVector.push(0.5, 0.5, 1);
    }
    
    // Add more features as needed...
    
    return featureVector;
  }

  /**
   * Get recipe recommendations based on ingredients
   * @param {Array} ingredientIds - Array of selected ingredient IDs
   * @param {String} userId - User ID (optional)
   * @returns {Array} - Sorted array of recommended recipes
   */
  async getRecommendationsByIngredients(ingredientIds, userId = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Get all recipes that contain at least one of the selected ingredients
    const recipes = await prisma.recipe.findMany({
      where: {
        ingredients: {
          some: {
            ingredientId: {
              in: ingredientIds,
            },
          },
        },
      },
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
    });
    
    // Get user data if available
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
        },
      });
    }
    
    // Score recipes using ML model
    const scoredRecipes = await Promise.all(recipes.map(async (recipe) => {
      // Create feature vector
      const featureVector = this.createFeatureVector(
        user,
        recipe,
        ingredientIds,
        null // No mood for ingredient-based recommendations
      );
      
      // Get prediction from model
      const prediction = await this.predict(featureVector);
      
      // Calculate additional metrics
      const userIngredientsUsed = recipe.ingredients.filter(
        ri => ingredientIds.includes(ri.ingredientId)
      );
      const coveragePercentage = userIngredientsUsed.length / recipe.ingredients.length;
      const missingIngredients = recipe.ingredients.length - userIngredientsUsed.length;
      
      return {
        ...recipe,
        score: prediction,
        coveragePercentage,
        missingIngredients,
      };
    }));
    
    // Sort recipes by score (descending)
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Log recommendation for model improvement
    if (userId && scoredRecipes.length > 0) {
      await prisma.recommendationLog.create({
        data: {
          userId,
          recipeId: scoredRecipes[0]?.id,
          inputIngredients: ingredientIds,
          confidenceScore: scoredRecipes[0]?.score,
          // userAccepted will be updated later
        },
      });
    }
    
    return scoredRecipes;
  }

  /**
   * Get recipe recommendations based on mood
   * @param {String} moodId - Selected mood ID
   * @param {String} userId - User ID (optional)
   * @returns {Array} - Sorted array of recommended recipes
   */
  async getRecommendationsByMood(moodId, userId = null) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Get recipes associated with the selected mood
    const recipes = await prisma.recipe.findMany({
      where: {
        moods: {
          some: {
            moodId,
          },
        },
      },
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
    });
    
    // Get user data if available
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
        },
      });
    }
    
    // Score recipes using ML model
    const scoredRecipes = await Promise.all(recipes.map(async (recipe) => {
      // Create feature vector
      const featureVector = this.createFeatureVector(
        user,
        recipe,
        [], // No ingredients for mood-based recommendations
        moodId
      );
      
      // Get prediction from model
      const prediction = await this.predict(featureVector);
      
      // Get mood relevance
      const moodRelevance = recipe.moods.find(m => m.moodId === moodId)?.relevanceScore || 0;
      
      return {
        ...recipe,
        score: prediction,
        moodRelevance,
      };
    }));
    
    // Sort recipes by score (descending)
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Log recommendation for model improvement
    if (userId && scoredRecipes.length > 0) {
      await prisma.recommendationLog.create({
        data: {
          userId,
          recipeId: scoredRecipes[0]?.id,
          inputMoodId: moodId,
          confidenceScore: scoredRecipes[0]?.score,
          // userAccepted will be updated later
        },
      });
    }
    
    return scoredRecipes;
  }

  /**
   * Get predictions from the ML model
   * @param {Array} featureVector - Feature vector
   * @returns {Number} - Prediction score (0-1)
   */
  async predict(featureVector) {
    // Convert feature vector to tensor
    const inputTensor = tf.tensor2d([featureVector]);
    
    // Get prediction
    const predictionTensor = this.model.predict(inputTensor);
    const prediction = await predictionTensor.data();
    
    // Clean up tensors
    inputTensor.dispose();
    predictionTensor.dispose();
    
    return prediction[0];
  }

  /**
   * Update the model with new user feedback
   * @param {String} recommendationId - ID of the recommendation log
   * @param {Boolean} accepted - Whether the user accepted the recommendation
   */
  async updateModel(recommendationId, accepted) {
    // Get the recommendation log
    const log = await prisma.recommendationLog.findUnique({
      where: { id: recommendationId },
      include: {
        user: {
          include: {
            preferences: true
          }
        },
        recipe: {
          include: {
            ingredients: true,
            moods: true
          }
        }
      }
    });
    
    if (!log) {
      throw new Error('Recommendation log not found');
    }
    
    // Update the log with user feedback
    await prisma.recommendationLog.update({
      where: { id: recommendationId },
      data: {
        userAccepted: accepted
      }
    });
    
    // If we have enough new feedback data, retrain the model
    const feedbackCount = await prisma.recommendationLog.count({
      where: {
        userAccepted: {
          not: null
        },
        updatedAt: {
          gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });
    
    // Retrain if we have at least 50 new feedback entries
    if (feedbackCount >= 50) {
      console.log('Retraining recommendation model with new feedback data...');
      this.model = await this.trainModel();
      console.log('Model retraining complete');
    }
  }
}

// Export singleton instance
let recommendationEngine;

export function getRecommendationEngine() {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
  }
  return recommendationEngine;
}