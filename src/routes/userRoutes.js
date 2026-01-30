const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const userRoutes = (usersCollection) => {
    
    const { createUser, getAllUsers, getUserRole, markAsFraud } = userController(usersCollection);

 
    router.post('/users', createUser);

    
    router.get('/all-users', getAllUsers);

    
    router.get('/users/role/:email', getUserRole);

    
    router.patch('/users/fraud/:email', markAsFraud);

    return router;
};

module.exports = userRoutes;