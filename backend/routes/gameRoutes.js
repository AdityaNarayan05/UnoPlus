const express = require('express');

const { createGame, joinGame, startGame, playCard, fetchGameState, drawCard , getRunningGame } = require('../controllers/gameController.js');
const { protect } = require('../middlewares/authMiddleware.js');

const router = express.Router();

// API EndPoint to create a new game
router.route("/").get(protect, createGame);
router.route("/join").post(protect, joinGame);
router.route("/start").post(protect, startGame);
router.route("/play").post(protect, playCard);
router.route("/state").post(protect, fetchGameState);
router.route("/draw").post(protect, drawCard);
router.route("/getRunningGame").get(protect, getRunningGame);

module.exports = router;