require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const qrRoutes = require('./routes/qrRoutes');
const authRoutes = require('./routes/auth');
const users = require('./models/User');
const scanRoutes = require('./routes/scanRoutes');


const app = express();

app.use(cors());
app.use(express.json());

//Routes
app.use('/api', qrRoutes);
app.use('/api', authRoutes);
app.use('/api', scanRoutes);


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection failed:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
