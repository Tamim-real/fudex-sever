const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

const reviewRoutes = (reviewCollection) => {
    
    const { 
        addReview, 
        getReviewsByMeal, 
        getAllReviews, 
        getMyReviews, 
        deleteReview, 
        updateReview 
    } = reviewController(reviewCollection);

   
    router.post('/add-review', addReview);

    
    router.get('/reviews/:id', getReviewsByMeal);

   
    router.get('/reviews', getAllReviews);

   
    router.get('/my-review/:email', getMyReviews);

    
    router.delete('/reviews/:id', deleteReview);

    
    router.patch('/reviews/:id', updateReview);

    return router;
};

module.exports = reviewRoutes;