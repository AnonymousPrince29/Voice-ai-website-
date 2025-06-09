const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.post(
    '/register',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ msg: 'User already exists' });
            }

            user = new User({
                name,
                email,
                password
            });

            // Generate API key
            user.generateApiKey();

            await user.save();

            // Create token
            const token = user.getSignedJwtToken();

            res.status(201).json({
                success: true,
                token,
                apiKey: user.apiKey
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

// @route    POST api/auth/login
// @desc     Login user
// @access   Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            let user = await User.findOne({ email }).select('+password');

            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            const isMatch = await user.matchPassword(password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Create token
            const token = user.getSignedJwtToken();

            res.json({
                success: true,
                token,
                apiKey: user.apiKey
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
