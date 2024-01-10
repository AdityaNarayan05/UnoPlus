const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    players: [{
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remainingCards: [{ type: String }],
    }],
    activePlayerIndex: { type: Number, default: 1 },
    discardPile: { type: String, default: "" },
    color: { type: String, default: "" },
    deck: [{ type: String }],
    status: {
        type: String,
        enum: ['waiting', 'ongoing', 'completed', 'canceled'],
        default: 'waiting',
    },
    clockWiseDirection: { type: Boolean, default: true }
},
    {
        timestamps: true
    });

const Game = mongoose.model('Game', gameSessionSchema);
module.exports = Game;