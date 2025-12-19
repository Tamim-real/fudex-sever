const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const requestsCollection = db.collection("roleRequests");

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

        app.get('/manage-requests', async (req, res) => {

            const result = await requestsCollection.find().toArray()
            res.send(result)
        })
        app.get('/all-users', async (req, res) => {

            const result = await usersCollection.find().toArray()
            res.send(result)
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

