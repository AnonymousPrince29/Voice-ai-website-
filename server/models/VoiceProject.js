const mongoose = require('mongoose');

const VoiceProjectSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    name: { 
        type: String, 
        required: [true, 'Please add a project name'] 
    },
    description: { 
        type: String 
    },
    voiceSamples: [{
        text: String,
        audioUrl: String,
        voiceSettings: {
            stability: {
                type: Number,
                min: 0,
                max: 1,
                default: 0.5
            },
            similarityBoost: {
                type: Number,
                min: 0,
                max: 1,
                default: 0.75
            }
        },
        createdAt: { 
            type: Date, 
            default: Date.now 
        }
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt field before saving
VoiceProjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('VoiceProject', VoiceProjectSchema);
