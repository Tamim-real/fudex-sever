const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

const favoriteRoutes = (favCollection) => {
    
    const { addToFavorites, getMyFavorites, removeFromFavorites } = favoriteController(favCollection);

    
    router.post('/favorites', addToFavorites);

    
    router.get('/favorites', getMyFavorites);

    
    router.delete('/favorites/:id', removeFromFavorites);

    return router;
};

module.exports = favoriteRoutes;