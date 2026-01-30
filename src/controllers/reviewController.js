const { ObjectId } = require('mongodb');

const reviewController = (reviewCollection) => {
    return {
        
        addReview: async (req, res) => {
            try {
                const reviewInfo = req.body;
                const result = await reviewCollection.insertOne(reviewInfo);
                res.status(201).send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to add review" });
            }
        },

       
        getReviewsByMeal: async (req, res) => {
            try {
                const id = req.params.id; 
                const query = { mealId: id };
                const result = await reviewCollection
                    .find(query)
                    .sort({ _id: -1 }) 
                    .toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching reviews" });
            }
        },

        
        getAllReviews: async (req, res) => {
            try {
                const result = await reviewCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching all reviews" });
            }
        },

        
        getMyReviews: async (req, res) => {
            try {
                const email = req.params.email;
                const query = { reviewerEmail: email };
                const result = await reviewCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching user reviews" });
            }
        },

        
        deleteReview: async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await reviewCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Review not found" });
                }
                res.send({ success: true, message: "Review deleted successfully" });
            } catch (error) {
                res.status(500).send({ message: "Failed to delete review" });
            }
        },

        
        updateReview: async (req, res) => {
            try {
                const id = req.params.id;
                const updatedData = req.body;
                const query = { _id: new ObjectId(id) };

                const updateDoc = {
                    $set: {
                        rating: updatedData.rating,
                        comment: updatedData.comment,
                    },
                };

                const result = await reviewCollection.updateOne(query, updateDoc);
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Failed to update review" });
            }
        }
    };
};

module.exports = reviewController;