const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const User = require('../models/User');
const VoiceProject = require('../models/VoiceProject');

// Initialize Google TTS client
const ttsClient = new TextToSpeechClient();

// @route    POST api/voice/generate
// @desc     Generate voice from text
// @access   Private
router.post(
    '/generate',
    [
        auth,
        [
            check('text', 'Text is required').not().isEmpty(),
            check('voice', 'Voice is required').not().isEmpty(),
            check('language', 'Language is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { text, voice, language, projectId } = req.body;
        const userId = req.user.id;

        try {
            // Check user's character limit
            const user = await User.findById(userId);
            if (user.charactersUsed + text.length > user.charactersLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'Character limit exceeded. Please upgrade your plan.'
                });
            }

            // Construct the request for Google TTS
            const request = {
                input: { text },
                voice: { 
                    languageCode: language,
                    name: voice 
                },
                audioConfig: { audioEncoding: 'MP3' },
            };

            // Perform the text-to-speech request
            const [response] = await ttsClient.synthesizeSpeech(request);
            
            // Update user's character usage
            user.charactersUsed += text.length;
            await user.save();

            // If projectId is provided, save to project
            if (projectId) {
                const project = await VoiceProject.findOne({
                    _id: projectId,
                    user: userId
                });

                if (project) {
                    project.voiceSamples.push({
                        text,
                        audioUrl: 'data:audio/mp3;base64,' + response.audioContent.toString('base64'),
                        voiceSettings: {
                            stability: 0.5,
                            similarityBoost: 0.75
                        }
                    });
                    await project.save();
                }
            }

            res.json({
                success: true,
                audioContent: response.audioContent.toString('base64'),
                charactersUsed: user.charactersUsed,
                charactersRemaining: user.charactersLimit - user.charactersUsed
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

// @route    GET api/voice/projects
// @desc     Get all voice projects for user
// @access   Private
router.get('/projects', auth, async (req, res) => {
    try {
        const projects = await VoiceProject.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route    POST api/voice/projects
// @desc     Create new voice project
// @access   Private
router.post(
    '/projects',
    [
        auth,
        [
            check('name', 'Project name is required').not().isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const project = new VoiceProject({
                user: req.user.id,
                name: req.body.name,
                description: req.body.description
            });

            await project.save();

            res.status(201).json({
                success: true,
                data: project
            });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    }
);

module.exports = router;
