module.exports = {
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'sk_6d07ebb8c2262774b366e3b0e2caf4993c0e5ab898d7f138',
        expiresIn: '30d'
    },
    
    // API configuration
    api: {
        prefix: '/api',
        version: 'v1'
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // CORS options
    corsOptions: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
