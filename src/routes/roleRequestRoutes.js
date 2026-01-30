const express = require('express');
const router = express.Router();
const roleRequestController = require('../controllers/roleRequestController');

const roleRoutes = (requestsCollection, usersCollection) => {
   
    const { requestRole, getAllRequests, approveRoleRequest } = roleRequestController(requestsCollection, usersCollection);

    
    router.post('/role-request', requestRole);

    
    router.get('/manage-requests', getAllRequests);

    
    router.put('/manage-requests', approveRoleRequest);

    return router;
};

module.exports = roleRoutes;