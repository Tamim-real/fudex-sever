require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE);

module.exports = stripe;