const { ObjectId } = require('mongodb');



const userController = (usersCollection) => {
    return {
        // 1. Create User (POST /users)
        createUser: async (req, res) => {
            const user = req.body;
            const existingUser = await usersCollection.findOne({ email: user.email });
            if (existingUser) {
                return res.send({ message: "User already exists" });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        },

        // 2. Get All Users (GET /all-users)
        getAllUsers: async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        },

        // 3. Get User Role (GET /users/role/:email)
        getUserRole: async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            if (user) {
                res.send({ role: user.role });
            } else {
                res.status(404).send({ message: "User not found" });
            }
        },

        // 4. Mark User as Fraud (PATCH /users/fraud/:email)
        markAsFraud: async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { status: 'fraud' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        }
    };
};

module.exports = userController;