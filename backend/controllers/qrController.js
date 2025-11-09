const QRCode = require('../models/qrModel');
const User = require('../models/User');
const Counter = require('../models/counter');

exports.createQR = async (req, res) => {
    try {
        console.log("🟢 Received data in createQR:", req.body);

        const { Name, ManufactureDate, Uses, Composition, PrescriptionRequired, Originality, Ownership, ExpiryDate } = req.body.data;

        if (!Name || !ManufactureDate || !Uses || !Composition || !PrescriptionRequired || !Originality || !Ownership || !ExpiryDate) {
            console.warn("⚠️ Missing required fields for QR generation.");
            return res.status(400).json({ message: 'All QR data fields are required' });
        }

        const createdBy = req.user.id;
        if (!createdBy) {
            return res.status(401).json({ message: 'User not authenticated or user ID missing.' });
        }

        const counter = await Counter.findOneAndUpdate(
            { _id: 'qrserial' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        const newSerial = counter.seq;
        console.log(`Generated new serial: ${newSerial}`);

        const newQR = new QRCode({
            serial: newSerial,
            data: {
                Name,
                ManufactureDate,
                Uses,
                Composition,
                PrescriptionRequired,
                Originality,
                Ownership,
                ExpiryDate,
            },
            encoded: JSON.stringify(req.body.data),
            createdBy: createdBy
        });

        await newQR.save();

        console.log("✅ QR saved successfully:", newQR);

        res.status(201).json({
            serial: newQR.serial,
            encoded: newQR.encoded,
            _id: newQR._id,
            createdAt: newQR.createdAt
        });

    } catch (err) {
        console.error('❌ QR Generation Error:', err);
        if (err.name === 'ValidationError') {
            const validationErrors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: 'QR Code validation failed: ' + validationErrors.join(', ') });
        }
        res.status(500).json({ message: 'Server error generating QR' });
    }
};

exports.getQRHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        console.log(`Fetching QR history for user ID: ${userId}`);

        const qrCodes = await QRCode.find({ createdBy: userId }).sort({ createdAt: -1 });

        console.log(`✅ Found ${qrCodes.length} QR codes for user ${userId}`);
        res.status(200).json(qrCodes);

    } catch (err) {
        console.error('❌ Error fetching QR history:', err);
        res.status(500).json({ message: 'Server error fetching QR history' });
    }
};

//Function to get recently generated QR codes for a specific user
exports.getRecentQRCodes = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        console.log(`Fetching recent QR codes for user ID: ${userId}`);

        // Fetch the last 4 QR codes for the user, sorted by creation date descending
        const recentQRCodes = await QRCode.find({ createdBy: userId })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .limit(4); // Limit to 4 items

        console.log(`✅ Found ${recentQRCodes.length} recent QR codes for user ${userId}`);
        res.status(200).json(recentQRCodes);

    } catch (err) {
        console.error('❌ Error fetching recent QR codes:', err);
        res.status(500).json({ message: 'Server error fetching recent QR codes' });
    }
};

exports.getQRById = async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL parameter
        const userId = req.user.id; // Get authenticated user ID

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        const qrCode = await QRCode.findOne({ _id: id, createdBy: userId }); // Find by ID AND creator

        if (!qrCode) {
            console.log(`❌ QR Code with ID ${id} not found or not owned by user ${userId}`);
            return res.status(404).json({ message: 'QR Code not found or you do not have permission to access it.' });
        }

        console.log(`✅ Found QR Code: ${id} for user: ${userId}`);
        res.status(200).json(qrCode);

    } catch (err) {
        console.error('❌ Error fetching QR by ID:', err);
        // CastError for invalid MongoDB ID format
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid QR Code ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching QR Code.' });
    }
};

// Update a single QR code by its ID
exports.updateQR = async (req, res) => {
    try {
        const { id } = req.params; // QR Code ID from URL
        const userId = req.user.id; // Authenticated user ID
        const updateData = req.body.data; // Data to update from frontend form

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided.' });
        }

        // Find and update by ID AND ensure it belongs to the authenticated user
        const updatedQR = await QRCode.findOneAndUpdate(
            { _id: id, createdBy: userId },
            { $set: { data: updateData, encoded: JSON.stringify(updateData) } }, // Update data object and re-encode
            { new: true, runValidators: true } // Return the updated document and run schema validators
        );

        if (!updatedQR) {
            console.log(`❌ QR Code with ID ${id} not found or not owned by user ${userId} for update.`);
            return res.status(404).json({ message: 'QR Code not found or you do not have permission to update it.' });
        }

        console.log(`✅ QR Code ${id} updated successfully by user ${userId}`);
        res.status(200).json({ message: 'QR Code updated successfully', qrCode: updatedQR });

    } catch (err) {
        console.error('❌ Error updating QR:', err);
        if (err.name === 'ValidationError') {
            const validationErrors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: 'QR Code validation failed: ' + validationErrors.join(', ') });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid QR Code ID format.' });
        }
        res.status(500).json({ message: 'Server error updating QR Code.' });
    }
};

exports.deleteQR = async (req, res) => {
    try {
        const { id } = req.params; // QR Code ID from URL
        const userId = req.user.id; // Authenticated user ID

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        // Find and delete by ID AND ensure it belongs to the authenticated user
        const deletedQR = await QRCode.findOneAndDelete({ _id: id, createdBy: userId });

        if (!deletedQR) {
            console.log(`❌ QR Code with ID ${id} not found or not owned by user ${userId} for deletion.`);
            return res.status(404).json({ message: 'QR Code not found or you do not have permission to delete it.' });
        }

        console.log(`✅ QR Code ${id} deleted successfully by user ${userId}`);
        res.status(200).json({ message: 'QR Code deleted successfully', deletedId: id });

    } catch (err) {
        console.error('❌ Error deleting QR:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid QR Code ID format.' });
        }
        res.status(500).json({ message: 'Server error deleting QR Code.' });
    }
};
exports.getQRByEncodedData = async (req, res) => {
    try {
        const { encodedData } = req.query; // Data sent as a query parameter

        if (!encodedData) {
            return res.status(400).json({ message: 'Encoded QR data is required for scanning.' });
        }

        // Find the QR code by its exact encoded string
        const qrCode = await QRCode.findOne({ encoded: encodedData });

        if (!qrCode) {
            console.log(`❌ QR Code not found for encoded data: ${encodedData}`);
            return res.status(404).json({ message: 'Medicine details not found for this QR code. It might be invalid or not registered.' });
        }

        console.log(`✅ Found medicine details for QR serial: ${qrCode.serial}`);
        // Return only the 'data' field and potentially serial/timestamps
        res.status(200).json({
            serial: qrCode.serial,
            data: qrCode.data,
            createdAt: qrCode.createdAt,
            updatedAt: qrCode.updatedAt
        });

    } catch (err) {
        console.error('❌ Error fetching QR by encoded data:', err);
        res.status(500).json({ message: 'Server error while fetching medicine details.' });
    }
};