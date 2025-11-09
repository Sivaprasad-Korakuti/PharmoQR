const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema({
    serial: {
        type: Number,
        unique: true,
    },
    data: {
        Name: { type: String, required: true },
        ManufactureDate: { type: Date, required: true },
        Uses: { type: String, required: true },
        Composition: { type: String, required: true },
        PrescriptionRequired: { type: String, enum: ['Yes', 'No'], required: true },
        Originality: { type: String, enum: ['Original', 'Fake/Replica'], required: true },
        Ownership: { type: String, enum: ['Self Made', 'Acquired'], required: true },
        ExpiryDate: { type: Date, required: true },
    },
    encoded: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

qrSchema.pre('save', async function (next) {
    if (this.isNew) {
        const latestQR = await this.constructor.findOne().sort('-serial').exec();
        this.serial = latestQR ? latestQR.serial + 1 : 1;
    }
    next();
});

module.exports = mongoose.model('QRCode', qrSchema);