const jwt = require('jsonwebtoken');

const authMiddleware = (usersCollection) => {
    return {
        // 1. Verify if JWT is valid and decoded
        verifyToken: (req, res, next) => {
            const authHeader = req.headers.authorization;
            
            // Check for header and make sure it starts with 'Bearer '
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).send({ message: 'Unauthorized access: No valid token structure found' });
            }

            const token = authHeader.split(' ')[1];
            if (!token) {
                return res.status(401).send({ message: 'Unauthorized access: Token missing' });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: 'Forbidden access: Invalid or expired token' });
                }
                req.decoded = decoded; 
                next();
            });
        },

        // 2. Verify if the decoded user holds the 'admin' role
        verifyAdmin: async (req, res, next) => {
            try {
                // Ensure verifyToken was called beforehand
                if (!req.decoded || !req.decoded.email) {
                    return res.status(401).send({ message: 'Unauthorized access: Decoded user info missing' });
                }

                const email = req.decoded.email;
                const user = await usersCollection.findOne({ email });

                if (!user || user.role !== 'admin') {
                    return res.status(403).send({ message: 'Forbidden access: Admins only' });
                }

                next();
            } catch (err) {
                console.error("Error in verifyAdmin middleware:", err);
                res.status(500).send({ message: 'Internal Server Error during authorization' });
            }
        }
    };
};

module.exports = authMiddleware;