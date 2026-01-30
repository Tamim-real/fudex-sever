const { ObjectId } = require('mongodb');

const favoriteController = (favCollection) => {
    return {
        
        addToFavorites: async (req, res) => {
            try {
                const favData = req.body;
                const result = await favCollection.insertOne(favData);
                res.status(201).send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add to favorites" });
            }
        },

        
        getMyFavorites: async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "User email is required" });
                }
                const result = await favCollection.find({ userEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching favorites" });
            }
        },

     
        removeFromFavorites: async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await favCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Item not found in favorites" });
                }
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to remove from favorites" });
            }
        }
    };
};

module.exports = favoriteController;