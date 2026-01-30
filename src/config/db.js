const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();


const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connectDB = async () => {
  try {
    
    await client.connect();
    console.log("✅ MongoDB Connected successfully!");
    
    
    return client.db("fudexDB"); 
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); 
  }
};

module.exports = connectDB;