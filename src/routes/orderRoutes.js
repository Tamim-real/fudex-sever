const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

const orderRoutes = (orderCollection) => {
  
    const { getCustomerOrders, getChefOrders, updateOrderStatus } = orderController(orderCollection);

    
    router.get('/customer-orders', getCustomerOrders);

    
    router.get('/chef-orders', getChefOrders);

   
    router.patch('/chef-orders/:id', updateOrderStatus);

    return router;
};

module.exports = orderRoutes;