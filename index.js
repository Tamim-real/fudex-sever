const express = require('express')
require('dotenv').config();
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE);

const port = 3000

app.use(cors())
app.use(express.json());

const uri = "mongodb+srv://fudexDB:K8a5lGYqTbwQTYAG@nexdev.5cutabm.mongodb.net/?appName=NexDev";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const db = client.db("fudexDB");
        const usersCollection = db.collection("usersCollection");
        const mealsCollection = db.collection("mealsCollection")
        const requestsCollection = db.collection("roleRequests");
        const orderCollection = db.collection("orderCollections");
        const reviewCollection = db.collection("reviewCollections")
        const favCollection = db.collection("favCollections");


        app.post("/users", async (req, res) => {
            const user = req.body;


            const existingUser = await usersCollection.findOne({ email: user.email });
            if (existingUser) {
                return res.send({ message: "User already exists" });
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        app.post('/api/role-request', async (req, res) => {
            try {
                const { userId, requestedRole } = req.body;

                const db = client.db("fudexDB");
                const requestsCollection = db.collection("roleRequests");


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
        });

        app.post('/create-meal', async (req, res) => {
            mealData = req.body;
            const result = await mealsCollection.insertOne(mealData);
            res.send(result);

        })

        app.get('/manage-requests', async (req, res) => {

            const result = await requestsCollection.find().toArray()
            res.send(result)
        })
        app.get('/all-users', async (req, res) => {

            const result = await usersCollection.find().toArray()
            res.send(result)
        });

        app.get('/my-meals', async (req, res) => {
            const email = req.query.email

            const result = await mealsCollection.find({ userEmail: email }).toArray();
            res.send(result)
        })
        app.get('/all-meals', async (req, res) => {

            const result = await mealsCollection.find().toArray();
            res.send(result)
        })



        app.get('/all-meals/:id', async (req, res) => {
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
        });




        app.get('/users/role/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });

            if (user) {
                res.send({ role: user.role });
            } else {
                res.status(404).send({ message: "User not found" });
            }
        });

        app.patch('/users/fraud/:email', async (req, res) => {

            const email = req.params.email;


            const filter = { email: email };


            const updateDoc = {
                $set: {
                    status: 'fraud'
                },
            };


            const result = await usersCollection.updateOne(filter, updateDoc);

            res.send(result);
        });


        app.put("/manage-requests", async (req, res) => {
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


                const generateRandomChefId = () => {
                    return 'CHEF-' + Math.floor(1000 + Math.random() * 9000);
                };

                const userUpdateResult = await usersCollection.updateOne(
                    { email },
                    {
                        $set: {
                            role: request.requestedRole,
                            chefId: generateRandomChefId()
                        }
                    }
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
                    message: "Role updated successfully",
                });
            } catch (error) {
                res.status(500).send({ message: "Server error" });
            }
        });

        //payment related APIs

        app.post('/create-checkout-session', async (req, res) => {
            try {
                const paymentInfo = req.body;


                const session = await stripe.checkout.sessions.create({
                    line_items: [
                        {
                            price_data: {
                                currency: 'usd',
                                unit_amount: Math.round(paymentInfo.cost * 100),
                                product_data: {
                                    name: paymentInfo.foodName,
                                    images: [paymentInfo.foodImage],
                                },
                            },
                            quantity: 1,
                        },
                    ],
                    customer_email: paymentInfo.customer_email,
                    mode: 'payment',
                    metadata: {
                        foodId: paymentInfo.foodId,
                        chefId: paymentInfo.chefId,
                    },
                    success_url: `${process.env.SITE_DOMAIN}/payment-success`,
                    cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
                });





                res.send({ url: session.url });

                const orderData = {
                    foodId: paymentInfo.foodId,
                    foodName: paymentInfo.foodName,
                    foodImage: paymentInfo.foodImage,
                    price: paymentInfo.cost,

                    chefName: paymentInfo.chefName,
                    chefId: paymentInfo.chefId,
                    chefEmail: paymentInfo.chefEmail,

                    customerEmail: paymentInfo.customer_email,
                    deliveryTime: paymentInfo.deliveryTime,

                    stripeSessionId: session.id,
                    paymentStatus: "paid",
                    orderStatus: "placed",

                    createdAt: new Date(),
                };

                await orderCollection.insertOne(orderData);

            } catch (error) {
                console.error("Stripe checkout error:", error);
                res.status(500).send({ message: 'Payment session failed' });
            }
        });

        //order related APIs

        app.get('/customer-orders', async (req, res) => {
            const email = req.query.email;
            const result = await orderCollection.find({ customerEmail: email }).toArray();
            res.send(result)
        })

        //order chef

        app.get('/chef-orders', async (req, res) => {
            const email = req.query.email;
            const result = await orderCollection.find({ chefEmail: email }).toArray();
            res.send(result)
        })

        //add review 

        app.post('/add-review', async (req, res) => {
            const reviewInfo = req.body

            const result = await reviewCollection.insertOne(reviewInfo);
            res.send(result)
        })

        // GET reviews for a specific meal
        app.get('/reviews/:id', async (req, res) => {
            try {
                const id = req.params.id;


                const query = { mealId: id };


                const result = await reviewCollection
                    .find(query)
                    .sort({ _id: -1 })
                    .toArray();

                res.send(result);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                res.status(500).send({ message: "Error fetching reviews" });
            }
        });

        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result)
        })

        app.get('/my-review/:email', async (req, res) => {
            const email = req.params.email;
            const query = { reviewerEmail: email };
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        });
        const { ObjectId } = require("mongodb");

        app.delete('/reviews/:id', async (req, res) => {
            try {
                const id = req.params.id;

                const query = { _id: new ObjectId(id) };

                const result = await reviewCollection.deleteOne(query);

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Review not found" });
                }

                res.send({
                    success: true,
                    message: "Review deleted successfully",
                    deletedCount: result.deletedCount,
                });
            } catch (error) {
                console.error("Error deleting review:", error);
                res.status(500).send({ message: "Failed to delete review" });
            }
        });
        app.patch('/reviews/:id', async (req, res) => {
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
                console.error("Error updating review:", error);
                res.status(500).send({ message: "Failed to UPDATE review" });
            }
        });

        //favorites api

        app.post('/favorites', async (req, res) => {
            const favData = req.body;

            const result = await favCollection.insertOne(favData);
            res.send(result)
        })

        app.get('/favorites', async (req, res) => {
            const email = req.query.email;

            const result = await favCollection.find({ userEmail: email }).toArray();
            res.send(result)
        })

        app.delete('/favorites/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const result = await favCollection.deleteOne(query);
            res.send(result)

        })

        app.get('/', (req, res) => {
            res.send('Hello w')
        })

        app.listen(port, () => {
            console.log(`Example app listening on port ${port}`)
        })


        // Send a ping to confirm a successful connection

        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);

