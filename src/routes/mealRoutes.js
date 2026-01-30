const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

const mealRoutes = (mealsCollection) => {
   
    const { createMeal, getAllMeals, getMyMeals, getMealById } = mealController(mealsCollection);

    
    router.post('/create-meal', createMeal);

    
    router.get('/all-meals', getAllMeals);

    
    router.get('/my-meals', getMyMeals);

    
    router.get('/all-meals/:id', getMealById);

    return router;
};

module.exports = mealRoutes;