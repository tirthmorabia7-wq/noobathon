const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/los-santos-dashboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('DB Connection Error:', err));

// Models
const User = require('./models/User');
const State = require('./models/State');

// ─── AUTH ROUTES ──────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = new User({ email, password });
        await user.save();

        // Initialize state for new user
        const state = new State({ userId: user._id });
        await state.save();

        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ─── DASHBOARD ROUTES ──────────────────────────────
app.get('/api/state/:userId', async (req, res) => {
    try {
        const state = await State.findOne({ userId: req.params.userId });
        res.json(state);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/state/update', async (req, res) => {
    try {
        const { userId, ...updates } = req.body;
        const state = await State.findOneAndUpdate(
            { userId },
            { ...updates, updatedAt: Date.now() },
            { new: true }
        );
        res.json(state);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ─── MAP ROUTES ───────────────────────────────────
app.get('/api/map/hits', async (req, res) => {
    // Return all recent hits for the map
    const states = await State.find({}, 'recentHits');
    const allHits = states.flatMap(s => s.recentHits);
    res.json(allHits);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
