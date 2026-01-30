// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (usersCollection) => {
    return {
        verifyToken: (req, res, next) => {
           
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send({ message: 'Unauthorized access: No token found' });
            }

            const token = authHeader.split(' ')[1];
            
           
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: 'Forbidden access: Invalid token' });
                }
                req.decoded = decoded; 
                next();
            });
        },

        verifyAdmin: async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden access: Admins only' });
            }
            next();
        }
    };
};

module.exports = authMiddleware;