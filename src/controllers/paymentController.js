const { ObjectId } = require('mongodb');
const stripe = require('../utils/stripe');

const paymentController = (orderCollection) => {
    return {
        createCheckoutSession: async (req, res) => {
            try {
                
                const { 
                    foodId, foodName, foodImage, cost, 
                    chefName, chefId, chefEmail, 
                    customer_email, deliveryTime 
                } = req.body;

               
                if (!foodId || !cost || !customer_email) {
                    return res.status(400).json({ success: false, message: "Missing required payment fields." });
                }

                
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: 'usd',
                                
                                unit_amount: Math.round(parseFloat(cost) * 100), 
                                product_data: {
                                    name: foodName,
                                    images: foodImage ? [foodImage] : [],
                                },
                            },
                            quantity: 1,
                        },
                    ],
                    customer_email: customer_email,
                    mode: 'payment',
                    metadata: {
                        foodId: foodId.toString(),
                        chefId: chefId?.toString(),
                    },
                    
                    success_url: `${process.env.CLIENT_URL || 'https://fudex.netlify.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.CLIENT_URL || 'https://fudex.netlify.app'}/dashboard/payment-cancelled`,
                });

               
                const orderData = {
                    foodId: foodId.includes('-') ? foodId : new ObjectId(foodId), // আইডি অবজেক্ট আইডি কিনা চেক
                    foodName,
                    foodImage,
                    price: parseFloat(cost),
                    chefName,
                    chefId,
                    chefEmail,
                    customerEmail: customer_email,
                    deliveryTime,
                    stripeSessionId: session.id,
                    paymentStatus: "unpaid", 
                    orderStatus: "pending",
                    createdAt: new Date(),
                };

              
                await orderCollection.insertOne(orderData);

                
                return res.status(200).json({ 
                    success: true, 
                    url: session.url,
                    sessionId: session.id 
                });

            } catch (error) {
                console.error("Stripe checkout error:", error);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to create payment session' 
                });
            }
        }
    };
};

module.exports = paymentController;