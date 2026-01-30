const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connectDB = require('./config/db');


const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');
const roleRoutes = require('./routes/roleRequestRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

async function run() {
    try {
        const db = await connectDB();

        
        const usersCollection = db.collection("usersCollection");
        const mealsCollection = db.collection("mealsCollection");
        const requestsCollection = db.collection("roleRequests");
        const orderCollection = db.collection("orderCollections");
        const reviewCollection = db.collection("reviewCollections");
        const favCollection = db.collection("favCollections");

        // --- Auth / JWT API ---
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.send({ token });
        });

        // --- Routes Setup ---
        // আমরা প্রত্যেকটি রাউট ফাইলে প্রয়োজনীয় কালেকশনগুলো পাস করে দিচ্ছি
        app.use('/', userRoutes(usersCollection));
        app.use('/', mealRoutes(mealsCollection));
        app.use('/api', roleRoutes(requestsCollection, usersCollection));
        app.use('/', orderRoutes(orderCollection));
        app.use('/', paymentRoutes(orderCollection));
        app.use('/', reviewRoutes(reviewCollection));
        app.use('/', favoriteRoutes(favCollection));

     
        app.get('/', (req, res) => {
            res.send('Fudex Server is running...');
        });

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

run().catch(console.dir);