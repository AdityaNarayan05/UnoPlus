import { Avatar, Box, Image, Stack, Text } from '@chakra-ui/react'
import { GameState } from '../Context/GameProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
var socket, selectedChatCompare;

export default function GamePlayPage() {
    const Navigate = useNavigate();
    const toast = useToast();
    const { user, setUser, game, setGame } = GameState();
    const [loading, setLoading] = useState(true);

    const handlePlay = async (index, card) => {
        if (game.players.findIndex(player => player.user._id == user._id) + 1 !== game.activePlayerIndex) {
            console.log("Not Your Turn");
            return;
        }

        const discardPile = game.discardPile.split('_');
        const currentColor = discardPile[0];
        const currentValue = discardPile[1];

        const playedCard = card.split('_');
        const playedColor = playedCard[0];
        const playedValue = playedCard[1];

        if (currentColor !== playedColor && currentValue !== playedValue) {
            toast({
                title: "Can't Play this Card!",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top-right",
            })
            return;
        }

        const game2 = { ...game };
        console.log(game);
        console.log(game2);
        // -------------------------------------------------------------------------------------------------------------------------------
        const cardIndex = index + 1;
        const color = playedColor;
        game2.players[game.activePlayerIndex - 1].remainingCards.splice(cardIndex - 1, 1);
        game2.discardPile = card;
        game2.color = color;
        const splitCard = card.split('_');
        if (splitCard[1] == 'skip') {
            if (game2.clockWiseDirection) {
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
            } else {
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
            }
        }
        else if (splitCard[1] == 'drawtwo') {
            if (game2.clockWiseDirection) {
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
            } else {
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
            }
        }
        else if (splitCard[1] == 'reverse') {
            game2.clockWiseDirection = !game2.clockWiseDirection;
            if (game2.clockWiseDirection) {
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
            } else {
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
            }
        }
        else if (splitCard[1] == 'drawfour') {
            if (game2.clockWiseDirection) {
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
            } else {
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.players[game2.activePlayerIndex - 1].remainingCards.push(game2.deck.shift());
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
            }
        }
        else {
            if (game2.clockWiseDirection) {
                game2.activePlayerIndex = (game2.activePlayerIndex + 1 == 5) ? (1) : (game2.activePlayerIndex + 1);
            } else {
                game2.activePlayerIndex = (game2.activePlayerIndex - 1 == 0) ? (4) : (game2.activePlayerIndex - 1);
            }
        }
        setGame(game2);
        // -------------------------------------------------------------------------------------------------------------------------------

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.post('/api/game/play', {
                cardIndex: index + 1,
                gameId: game._id,
                color: playedColor
            }, config);
            console.log(data);
            setGame(data);
            socket.emit('card played', data);
        } catch (error) {
        }
    }

    const getRunningGame = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) Navigate('/');
        setUser(userInfo);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/game/getRunningGame', config);
            if (typeof (data) !== 'string') {
                setGame(data[0]);
                if (data[0].status === 'waiting') {
                    Navigate('/game');
                    return;
                };
                const firstItem = data[0];
                if (firstItem.players.findIndex(player => player.user._id == userInfo._id) + 1 === firstItem.activePlayerIndex) {
                    firstItem.players[firstItem.players.findIndex(player => player.user._id == userInfo._id)].remainingCards.map((card) => {

                    });
                }
                socket.emit('setup', { userInfo, firstItem });
            } else {
                Navigate('/game');
            }
            setLoading(false);

        } catch (error) {
            console.log(error);
            toast({
                title: "Error Occured!",
                description: "Failed to Access the Game",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        getRunningGame();
    }, []);

    useEffect(() => {
        socket.on('state changed', async () => {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) Navigate('/');
            setUser(userInfo);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.get('/api/game/getRunningGame', config);
                if (typeof (data) !== 'string') {
                    setGame(data[0]);
                    if (data[0].status === 'waiting') Navigate('/game');
                } else {
                    Navigate('/game');
                }
            } catch (error) {
                console.log(error);
                toast({
                    title: "Error Occured!",
                    description: "Failed to Access the Game",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom-left",
                });
            }
        });
    }, [socket])


    return <>
        {(!loading) ? (
            <Box>
                <Box className='section1' width="100%" display="flex" justifyContent="center">
                    <Stack direction="row" justifyContent="center" spacing="0px" display="-webkit-box" width={`${game.players[(game.players.findIndex(player => player.user._id == user._id) + 2) % 4].remainingCards.length * 60 + 30}px`}>
                        {game.players[(game.players.findIndex(player => player.user._id == user._id) + 2) % 4].remainingCards.map((card, index) => (
                            <Image key={index} src={require(`../images/${card}.png`)} height="120px" width="90px" position="relative" left={`-${index * 30}px`}></Image>
                        ))}
                    </Stack>
                </Box>
                <Box className='section2'
                    display="flex"
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="center"
                    height={`${window.innerHeight - 240}px`}
                >
                    <Box className='section21' display="flex" ml="15px">
                        <Stack direction="column" justifyContent="center" spacing="0px" display="block" height={`${game.players[(game.players.findIndex(player => player.user._id == user._id) + 1) % 4].remainingCards.length * 35 + 85}px`}>
                            {game.players[(game.players.findIndex(player => player.user._id == user._id) + 1) % 4].remainingCards.map((card, index) => (
                                <Image key={index} src={require(`../images/${card}.png`)} height="120px" width="90px !important" position="relative" top={`-${index * 85}px`}></Image>
                            ))}
                        </Stack>
                    </Box>
                    <Box className='section22' display="flex" flexDir="column" height="100%" width="calc(100% - 210px)">
                        <Box className='section221' display="flex" justifyContent="center" flexDir="column" alignItems="center">
                            <Avatar size="md" name={game.players[(game.players.findIndex(player => player.user._id == user._id) + 2) % 4].user.name} src={game.players[(game.players.findIndex(player => player.user._id == user._id) + 2) % 4].user.pic} border={(((game.players.findIndex(player => player.user._id == user._id) + 2) % 4) + 1 === game.activePlayerIndex) ? "4px solid green" : "none"} />
                            <Text>{game.players[(game.players.findIndex(player => player.user._id == user._id) + 2) % 4].user.name}</Text>
                        </Box>
                        <Box className='section222' display="flex" height="100%" flexDir="row" justifyContent="space-between" width="100%">
                            <Box className='section2221' display="flex" justifyContent="center" flexDir="column" alignItems="center">
                                <Avatar size="md" name={game.players[(game.players.findIndex(player => player.user._id == user._id) + 1) % 4].user.name} src={game.players[(game.players.findIndex(player => player.user._id == user._id) + 1) % 4].user.pic} border={(((game.players.findIndex(player => player.user._id == user._id) + 1) % 4) + 1 === game.activePlayerIndex) ? "4px solid green" : "none"} />
                                <Text>{game.players[(game.players.findIndex(player => player.user._id == user._id) + 1) % 4].user.name}</Text>
                            </Box>
                            <Box className='section2222' display="flex" alignItems="center">
                                <Image src={(game.discardPile) ? require(`../images/${game.discardPile}.png`) : require("../images/back.png")} width="200px" height="280px"></Image>
                            </Box>
                            <Box className='section2223' display="flex" alignItems="center">
                                <Image src={require(`../images/back.png`)} width="150px" height="210px"></Image>
                            </Box>
                            <Box className='section2224' display="flex" justifyContent="center" flexDir="column" alignItems="center">
                                <Avatar size="md" name={game.players[(game.players.findIndex(player => player.user._id == user._id) + 3) % 4].user.name} src={game.players[(game.players.findIndex(player => player.user._id == user._id) + 3) % 4].user.pic} border={(((game.players.findIndex(player => player.user._id == user._id) + 3) % 4) + 1 === game.activePlayerIndex) ? "4px solid green" : "none"} />
                                <Text>{game.players[(game.players.findIndex(player => player.user._id == user._id) + 3) % 4].user.name}</Text>
                            </Box>
                        </Box>
                        <Box className='section223' display="flex" justifyContent="center" flexDir="column" alignItems="center">
                            <Avatar size="md" name={game.players[(game.players.findIndex(player => player.user._id == user._id)) % 4].user.name} src={game.players[(game.players.findIndex(player => player.user._id == user._id)) % 4].user.pic} border={(((game.players.findIndex(player => player.user._id == user._id)) % 4) + 1 === game.activePlayerIndex) ? "4px solid green" : "none"} />
                            <Text>{game.players[(game.players.findIndex(player => player.user._id == user._id)) % 4].user.name}</Text>
                        </Box>
                    </Box>
                    <Box className='section23' display="flex" mr="15px">
                        <Stack direction="column" justifyContent="center" spacing="0px" display="block" height={`${game.players[(game.players.findIndex(player => player.user._id == user._id) + 3) % 4].remainingCards.length * 35 + 85}px`}>
                            {game.players[(game.players.findIndex(player => player.user._id == user._id) + 3) % 4].remainingCards.map((card, index) => (
                                <Image key={index} src={require(`../images/${card}.png`)} height="120px" width="90px" position="relative" top={`-${index * 85}px`}></Image>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                <Box className='section3' width="100%" display="flex" justifyContent="center">
                    <Stack direction="row" justifyContent="center" spacing="0px" display="-webkit-box" width={`${game.players[(game.players.findIndex(player => player.user._id == user._id))].remainingCards.length * 60 + 30}px`}>
                        {game.players[(game.players.findIndex(player => player.user._id == user._id))].remainingCards.map((card, index) => (
                            <Image key={index} src={require(`../images/${card}.png`)} height="120px" width="90px" position="relative" left={`-${index * 30}px`} cursor={game.players.findIndex(player => player.user._id == user._id) + 1 === game.activePlayerIndex ? "pointer" : "default"} onClick={(e) => handlePlay(index, card)}></Image>
                        ))}
                    </Stack>
                </Box>
            </Box>
        ) : (<Box>Loading...</Box>)}
    </>

}