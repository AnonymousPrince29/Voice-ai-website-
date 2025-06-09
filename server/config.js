module.exports = {
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
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
