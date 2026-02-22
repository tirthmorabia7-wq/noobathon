const mongoose = require('mongoose');
const { Schema } = mongoose;

const stateSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recentHits: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('State', stateSchema);
