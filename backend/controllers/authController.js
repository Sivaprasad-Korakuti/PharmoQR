const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.signup = async (req, res) => {
    const { email, password, userType } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, userType });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('❌ Signup error:', err);
        res.status(500).json({ message: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        res.status(200).json({
            message: 'Login successful',
            userType: user.userType,
            userId: user._id
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = Date.now() + 3600000;
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request for PharmoQR',
            html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p>Thank you,</p>
                <p>The PharmoQR Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to: ${user.email}`);
        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (err) {
        console.error('❌ Forgot password error:', err);
        res.status(500).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
};
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestedId = req.params.id;


        if (userId !== requestedId) {
            return res.status(403).json({ message: 'Access denied: You can only view your own profile.' });
        }

        const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error('❌ Error fetching user profile:', err);
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error fetching user profile.' });
    }
};


exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const requestedId = req.params.id;
        const { email, currentPassword, newPassword, profilePicture } = req.body;


        if (userId !== requestedId) {
            return res.status(403).json({ message: 'Access denied: You can only update your own profile.' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }


        if (email && email !== user.email) {
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && String(existingUserWithEmail._id) !== userId) {
                return res.status(400).json({ message: 'Email already in use by another account.' });
            }
            user.email = email;
        }


        if (profilePicture) {
            user.profilePicture = profilePicture;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password.' });
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect current password.' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user: { id: user._id, email: user.email, userType: user.userType, profilePicture: user.profilePicture } });

    } catch (err) {
        console.error('❌ Error updating user profile:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid User ID format.' });
        }
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};





//////////////////////////////////////////////
// Add this new function to the end of the file
exports.completeRegistration = async (req, res) => {
    const { userId, userType } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user || user.userType !== 'unassigned') {
            return res.status(400).json({ message: 'User not found or registration already completed.' });
        }
        user.userType = userType;
        await user.save();
        res.status(200).json({ message: 'Registration complete.', userType: user.userType });
    } catch (err) {
        console.error('❌ Error completing registration:', err);
        res.status(500).json({ message: 'Server error completing registration.' });
    }
};

