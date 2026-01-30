const { ObjectId } = require('mongodb');

const roleRequestController = (requestsCollection, usersCollection) => {
    return {
        
        requestRole: async (req, res) => {
            try {
                const { userId, requestedRole, email } = req.body;

                
                const existingPending = await requestsCollection.findOne({
                    userId: userId,
                    requestedRole: requestedRole,
                    status: "pending"
                });

                if (existingPending) {
                    return res.status(400).json({
                        message: `You already have a pending request for ${requestedRole}.`
                    });
                }

                const newRequest = {
                    ...req.body,
                    status: "pending",
                    createdAt: new Date(),
                };

                await requestsCollection.insertOne(newRequest);
                res.status(201).json({ message: "Request sent successfully" });

            } catch (err) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        },

       
        getAllRequests: async (req, res) => {
            try {
                const result = await requestsCollection.find().toArray();
                res.send(result);
            } catch (err) {
                res.status(500).send({ message: "Error fetching requests" });
            }
        },

       
        approveRoleRequest: async (req, res) => {
            try {
                const { email } = req.body;

                if (!email) {
                    return res.status(400).send({ message: "Email is required" });
                }

                const request = await requestsCollection.findOne({ email });

                if (!request) {
                    return res.status(404).send({ message: "Request not found" });
                }

                if (request.status !== "pending") {
                    return res.status(400).send({ message: "Request already processed" });
                }

               
                const updateData = {
                    role: request.requestedRole 
                };

                
                if (request.requestedRole === 'chef') {
                    updateData.chefId = 'CHEF-' + Math.floor(1000 + Math.random() * 9000);
                }

             
                const userUpdateResult = await usersCollection.updateOne(
                    { email },
                    { $set: updateData }
                );

                if (userUpdateResult.matchedCount === 0) {
                    return res.status(404).send({ message: "User not found" });
                }

                
                await requestsCollection.updateOne(
                    { email },
                    { $set: { status: "approved" } }
                );

                res.send({
                    success: true,
                    message: `User promoted to ${request.requestedRole} successfully`,
                });

            } catch (error) {
                console.error(error);
                res.status(500).send({ message: "Server error" });
            }
        }
    };
};

module.exports = roleRequestController;