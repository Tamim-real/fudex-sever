const { ObjectId } = require('mongodb');

const mealController = (mealsCollection) => {
    return {
        // 1. Create a new meal (POST /create-meal)
        createMeal: async (req, res) => {
            try {
                const mealData = req.body;
                const result = await mealsCollection.insertOne(mealData);
                res.status(201).send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to create meal" });
            }
        },

        // 2. Get all meals (GET /all-meals)
        getAllMeals: async (req, res) => {
            try {
                const result = await mealsCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching meals" });
            }
        },

        // 3. Get meals by Chef Email (GET /my-meals?email=...)
        getMyMeals: async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Email is required" });
                }
                const result = await mealsCollection.find({ userEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching your meals" });
            }
        },

        // 4. Get a single meal by ID (GET /all-meals/:id)
        getMealById: async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await mealsCollection.findOne(query);

                if (result) {
                    res.send(result);
                } else {
                    res.status(404).send({ message: "Meal not found" });
                }
            } catch (error) {
                res.status(500).send({ message: "Invalid ID format or Server Error" });
            }
        }
    };
};

module.exports = mealController;