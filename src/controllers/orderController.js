const { ObjectId } = require('mongodb');

const orderController = (orderCollection) => {
    return {
        
        getCustomerOrders: async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Customer email is required" });
                }
                const result = await orderCollection.find({ customerEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching customer orders" });
            }
        },

        
        getChefOrders: async (req, res) => {
            try {
                const email = req.query.email;
                if (!email) {
                    return res.status(400).send({ message: "Chef email is required" });
                }
                const result = await orderCollection.find({ chefEmail: email }).toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ message: "Error fetching chef orders" });
            }
        },

        
        updateOrderStatus: async (req, res) => {
            try {
                const id = req.params.id;
                const { status } = req.body; 
                
                const query = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        orderStatus: status,
                    },
                };

                const result = await orderCollection.updateOne(query, updateDoc);
                
                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Order not found" });
                }
                
                res.send(result);
            } catch (error) {
                console.error("Error updating order status:", error);
                res.status(500).send({ message: "Failed to update order status" });
            }
        }
    };
};

module.exports = orderController;