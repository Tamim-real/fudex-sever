const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

const paymentRoutes = (orderCollection) => {
   
    const { createCheckoutSession } = paymentController(orderCollection);

    
    router.post('/create-checkout-session', createCheckoutSession);

    return router;
};

module.exports = paymentRoutes;