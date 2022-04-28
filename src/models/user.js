const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetPasswordLink: {
        type: String,
        default: null
    },
    resetPasswordLinkExpiredDate: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('User', User);