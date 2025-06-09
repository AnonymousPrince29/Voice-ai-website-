const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        select: false
    },
    name: { 
        type: String, 
        required: [true, 'Please add a name'] 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    apiKey: { 
        type: String, 
        unique: true 
    },
    subscription: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free'
    },
    charactersUsed: { 
        type: Number, 
        default: 0 
    },
    charactersLimit: { 
        type: Number, 
        default: 10000 
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    });
};

// Generate API key
UserSchema.methods.generateApiKey = function() {
    this.apiKey = require('crypto').randomBytes(16).toString('hex');
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
