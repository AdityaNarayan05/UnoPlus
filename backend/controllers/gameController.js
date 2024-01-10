const Game = require('../models/gameSessionModel.js');

const createGame = async (req, res) => {
    const game = await Game.create({
        creator: req.user._id,
        players: [{
            user: req.user._id,
            remainingCards: [],
        }],
        activePlayerIndex: 1,
    });

    const fullGame = await Game.findOne({ _id: game._id })
        .populate("creator", "-password")
        .populate('players.user', "-password");

    if (fullGame) {
        res.status(201).json(fullGame);
    } else {
        res.status(400);
        throw new Error("Failed to create the New Game");
    }
}

const joinGame = async (req, res) => {
    const gameId = req.body.gameId;
    if (!gameId) {
        res.status(400);
        throw new Error("GameId is not Provided");
    }

    const isExist = await Game.findOne({ _id: gameId });
    if (!isExist) {
        res.status(400);
        throw new Error("Please Enter a valid Game Id");
    }

    const isPlayerAlreadyJoined = isExist.players.some(player => player.user.equals(req.user._id));
    if (isPlayerAlreadyJoined) {
        return res.status(400).json({ message: 'Player is already part of the game session' });
    }

    if (isExist.players.length >= 4) {
        res.status(400);
        throw new Error("Already 4 User is present in the Game");
    } else {
        isExist.players.push({
            user: req.user._id,
            remainingCards: []
        });

        await isExist.save();
        const updatedGame = await Game.findOne({ _id: gameId }).populate('players.user', '-password');
        res.json(updatedGame);
    }
}

const startGame = async (req, res) => {
    const gameId = req.body.gameId;
    const userId = req.user._id;

    if (!gameId) {
        res.status(400);
        throw new Error("GameId is not Provided");
    }

    const isExist = await Game.findOne({ _id: gameId });
    if (!isExist) {
        res.status(400);
        throw new Error("Please Enter a valid Game Id");
    }

    if (isExist.status != 'waiting') {
        let status = isExist.status;
        if (status == 'ongoing') {
            res.json("Game is Running");
            return;
        }
        if (status == 'completed') {
            res.json("Game is Completed");
            return;
        }
        if (status == 'cancelled') {
            res.json("Game is Cancelled");
            return;
        }
    }

    if (isExist.players.length < 4) {
        res.status(400);
        throw new Error("All 4 Users are Not Joined");
    }


    // -------------------------------- Building & Shuffling Deck Started ------------------------------------------
    let deck = [];
    let colors = ["red", "green", "yellow", "blue"];
    let values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "drawtwo", "skip", "reverse"];
    let wilds = ['wild_change', 'wild_drawfour'];

    for (const color of colors) {
        for (const value of values) {
            const cardValue = `${color}_${value}`;
            deck.push(cardValue);
            if (value !== 0) deck.push(cardValue);
        }
    }

    for (let i = 0; i < 4; i++) {
        deck.push(wilds[0]);
    }
    for (let i = 0; i < 4; i++) {
        deck.push(wilds[1]);
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    // ---------------------------------------------- Building & Shuffling Deck is Completed ----------------------------


    // ---------------------------------------------- Initializing the Card Value to Discard Pile ------------------------------------------------
    let discardPile = deck.shift();
    while (discardPile.startsWith('wild') || discardPile.endsWith('drawtwo') || discardPile.endsWith('skip') || discardPile.endsWith('reverse')) {
        deck.push(discardPile);
        discardPile = deck.shift();
    }
    // -----------------------------------------------Discard Pile Initialization Completed ----------------------------------------------------


    // -------------------------------------------------- Assigning the 7 Cards to each Player -------------------------------------------------
    isExist.players.forEach(player => {
        player.remainingCards = deck.splice(0, 7);
    });
    // -------------------------------------------------- Assigning the 7 Cards to each Player : Completed ------------------------------------


    // -------------------------------------------------- Assigning the Deck, DiscardPile and Changing the Status ----------------------------
    isExist.discardPile = discardPile;
    isExist.deck = deck;
    isExist.status = "ongoing";
    isExist.color = discardPile.split('_')[0];
    // -----------------------------------------------------------------Completed ------------------------------------------------------------


    // -----------------------------------------------------------------Saving the Updates in the Database -----------------------------------
    try {
        await isExist.save();
        const updatedGame = await Game.findOne({ _id: gameId }).populate('players.user', '-password');
        updatedGame.players.map(player => {
            let user = player.user;
            let loggedUser = userId.toString();
            if (user != loggedUser) {
                for (let i = 0; i < player.remainingCards.length; i++) {
                    player.remainingCards[i] = "back";
                }
            }
        })
        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(400);
        throw new Error("Failed To Start the Game, Please Try Again");
    }
    // ----------------------------------------------------------------Updating Completed ----------------------------------------------------
}

const playCard = async (req, res) => {
    const { cardIndex, gameId, color } = req.body;
    const game = await Game.findOne({ _id: gameId });
    if (!game) {
        res.status(400);
        throw new Error("Please Enter a valid Game Id");
    }
    const userId = req.user._id;
    let index = -1, count = 1;
    game.players.map(player => {
        let user = player.user;
        let loggedUser = userId.toString();
        if (user == loggedUser) index = count;
        count++;
    })
    if (index != game.activePlayerIndex) {
        res.status(400);
        throw new Error("Not Your Turn");
    }

    // Updating the Game Session Model Fields
    const card = game.players[index - 1].remainingCards[cardIndex - 1];
    game.players[index - 1].remainingCards.splice(cardIndex - 1, 1);
    game.discardPile = card;
    game.color = color;
    const splitCard = card.split('_');
    if (splitCard[1] == 'skip') {
        if (game.clockWiseDirection) {
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
        } else {
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
        }
    }
    else if (splitCard[1] == 'drawtwo') {
        if (game.clockWiseDirection) {
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
        } else {
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
        }
    }
    else if (splitCard[1] == 'reverse') {
        game.clockWiseDirection = !game.clockWiseDirection;
        if (game.clockWiseDirection) {
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
        } else {
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
        }
    }
    else if (splitCard[1] == 'drawfour') {
        if (game.clockWiseDirection) {
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
        } else {
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
        }
    }
    else {
        if (game.clockWiseDirection) {
            game.activePlayerIndex = (game.activePlayerIndex + 1 == 5) ? (1) : (game.activePlayerIndex + 1);
        } else {
            game.activePlayerIndex = (game.activePlayerIndex - 1 == 0) ? (4) : (game.activePlayerIndex - 1);
        }
    }

    // -----------------------------------------------------------------Saving the Updates in the Database -----------------------------------
    try {
        await game.save();
        const updatedGame = await Game.findOne({ _id: gameId }).populate('players.user', '-password');;
        updatedGame.players.map(player => {
            let user = player.user._id;
            let loggedUser = userId.toString();
            if (user != loggedUser) {
                for (let i = 0; i < player.remainingCards.length; i++) {
                    player.remainingCards[i] = "back";
                }
            }
        })
        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(400);
        throw new Error("Failed To Play the Card, Please Try Again");
    }
    // ----------------------------------------------------------------Updating Completed ----------------------------------------------------
}

const fetchGameState = async (req, res) => {
    const { gameId } = req.body;
    const userId = req.user._id;
    const game = await Game.findOne({ _id: gameId }).populate('players.user', '-password');;
    if (!game) {
        res.status(400);
        throw new Error("Please Enter a valid Game Id");
    }
    game.players.map(player => {
        let user = player.user._id;
        let loggedUser = userId.toString();
        if (user != loggedUser) {
            for (let i = 0; i < player.remainingCards.length; i++) {
                player.remainingCards[i] = "back";
            }
        }
    })
    res.status(200).json(game);
}

const drawCard = async (req, res) => {
    const gameId = req.body.gameId;
    const game = await Game.findOne({ _id: gameId });
    if (!game) {
        res.status(400);
        throw new Error("Please Enter a valid Game Id");
    }
    const userId = req.user._id;
    let index = -1, count = 1;
    game.players.map(player => {
        let user = player.user;
        let loggedUser = userId.toString();
        if (user == loggedUser) index = count;
        count++;
    })
    if (index != game.activePlayerIndex) {
        res.status(400);
        throw new Error("Not Your Turn");
    }
    game.players[game.activePlayerIndex - 1].remainingCards.push(game.deck.shift());
    try {
        await game.save();
        const updatedGame = await Game.findOne({ _id: gameId }).populate('players.user', '-password');;
        updatedGame.players.map(player => {
            let user = player.user._id;
            let loggedUser = userId.toString();
            if (user != loggedUser) {
                for (let i = 0; i < player.remainingCards.length; i++) {
                    player.remainingCards[i] = "back";
                }
            }
        })
        res.status(200).json(updatedGame);
    } catch (error) {
        res.status(400);
        throw new Error("Failed To Play the Card, Please Try Again");
    }
}

const getRunningGame = async (req, res) => {
    const userId = req.user._id;
    const games = await Game.find({
        $or: [
            { 'players.user': userId },
            { creator: userId }
        ],
        status: { $in: ['waiting', 'ongoing'] }
    }).populate('players.user', '-password');;

    if (games.length) {
        games[0].players.map(player => {
            let user = player.user._id;
            let loggedUser = userId.toString();
            if (user != loggedUser) {
                for (let i = 0; i < player.remainingCards.length; i++) {
                    player.remainingCards[i] = "back";
                }
            }
        })
        res.status(200).json(games);
    }
    else res.json("No Running Game");
}

module.exports = { createGame, joinGame, startGame, playCard, fetchGameState, drawCard, getRunningGame };