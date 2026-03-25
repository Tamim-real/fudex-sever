
const stripe = require('../utils/stripe');

const paymentController = (orderCollection) => {
    return {
       
        createCheckoutSession: async (req, res) => {
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
                    
                    success_url: `https://fudex.netlify.app/payment-success`,
                    cancel_url: `https://fudex.netlify.app/dashboard/payment-cancelled`,
                });

              
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
                    orderStatus: "pending",

                    createdAt: new Date(),
                };

                
                await orderCollection.insertOne(orderData);

              
                res.send({ url: session.url });

            } catch (error) {
                console.error("Stripe checkout error:", error);
                res.status(500).send({ message: 'Payment session failed' });
            }
        }
    };
};

module.exports = paymentController;