const Scan = require('../models/Scan');
const QRCode = require('../models/qrModel');


exports.logScan = async (req, res) => {
    try {
        // userId comes from the authentication middleware (should be a consumer)
        const consumerId = req.user.id;
        const { qrCodeId } = req.body; // Expect the _id of the scanned QR code

        if (!consumerId) {
            return res.status(401).json({ message: 'Consumer not authenticated.' });
        }
        if (!qrCodeId) {
            return res.status(400).json({ message: 'QR Code ID is required to log scan.' });
        }


        const existingQrCode = await QRCode.findById(qrCodeId);
        if (!existingQrCode) {
            return res.status(404).json({ message: 'Scanned QR Code not found in database.' });
        }

        const newScan = new Scan({
            consumerId: consumerId,
            qrCodeId: qrCodeId,
            scannedAt: new Date()
        });

        await newScan.save();
        console.log(`✅ Scan logged for consumer ${consumerId}, QR Code ${qrCodeId}`);
        res.status(201).json({ message: 'Scan logged successfully', scan: newScan });

    } catch (err) {
        console.error('❌ Error logging scan:', err);
        if (err.name === 'CastError' && err.path === 'qrCodeId') {
            return res.status(400).json({ message: 'Invalid QR Code ID format.' });
        }
        res.status(500).json({ message: 'Server error logging scan.' });
    }
};

// Get a consumer's scan history
exports.getScanHistory = async (req, res) => {
    try {
        const consumerId = req.user.id; // User ID from authentication middleware

        if (!consumerId) {
            return res.status(401).json({ message: 'Consumer not authenticated.' });
        }

        // Find scans by consumerId and populate qrCodeId with actual QR data
        const scanHistory = await Scan.find({ consumerId: consumerId })
            .populate('qrCodeId') // Populate with actual QR Code document
            .sort({ scannedAt: -1 }); // Sort by most recent scan first

        // Filter out scans where qrCodeId couldn't be populated (e.g., if QR was deleted)
        const validScanHistory = scanHistory.filter(scan => scan.qrCodeId !== null);

        console.log(`✅ Retrieved ${validScanHistory.length} scans for consumer ${consumerId}`);
        res.status(200).json(validScanHistory);

    } catch (err) {
        console.error('❌ Error fetching scan history:', err);
        res.status(500).json({ message: 'Server error fetching scan history.' });
    }
};