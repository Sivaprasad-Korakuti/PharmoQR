const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        enum: ['producer', 'consumer'],
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    profilePicture: {
        type: String,
        default: 'default1'
    }
});

module.exports = mongoose.model('User', userSchema);
