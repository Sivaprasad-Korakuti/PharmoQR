const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
    consumerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    qrCodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true
    },
    scannedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Scan', scanSchema);