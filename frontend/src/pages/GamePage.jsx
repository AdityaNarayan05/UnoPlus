import React, { useEffect, useState } from 'react';
import { Box, Button, Input, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GameState } from '../Context/GameProvider';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
var socket;

export default function GamePage() {
    const navigate = useNavigate();
    const toast = useToast();
    const [value, setValue] = useState("");
    const [createGameLoading, setCreateGameLoading] = useState(false);
    const [joinGameLoading, setJoinGameLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user, setUser, game, setGame } = GameState();

    const getRunningGame = async () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) navigate('/');
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
                if (data[0].status !== 'waiting') navigate('/getGame');
            }
            setLoading(false);
        } catch (error) {
            console.log(error);
            toast({
                title: "Error Occurred!",
                description: "Failed to Access the Game",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const createGame = async () => {
        try {
            setCreateGameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/game', config);
            setGame(data);
            setCreateGameLoading(false);
            socket.emit('create game', data);
            toast({
                title: "Game Created Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            })
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Create the Game",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const joinGame = async () => {
        if (!value) {
            toast({
                title: "Warning",
                description: "Game Id is not Present",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
            return;
        }
        try {
            setJoinGameLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post('/api/game/join', { gameId: value }, config);
            setGame(data);
            setJoinGameLoading(false);
            socket.emit('join game', { user, data });
            toast({
                title: "Game Joined Successful",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top-right",
            })
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to Join the Game",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    };

    const startGame = async () => {
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post('/api/game/start', { gameId: game._id }, config);
            navigate('/getGame');
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        getRunningGame();
    }, []);

    useEffect(() => {
        socket.on('state changed', () => {
            getRunningGame();
        });
    }, [socket]);

    return (
        <>
            {(!loading) ? (
                <>
                    <Box
                        display="flex"
                        justifyContent="space-evenly"
                        alignItems="center"
                        flexDir="row"
                        pt="30px"
                    >
                        <Button colorScheme='teal' size='md' onClick={createGame} isLoading={createGameLoading} isDisabled={(game) ? true : false}>Create Game</Button>
                        <Box
                            display="flex"
                            flexDir="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Input placeholder='Enter Game Id' value={value} onChange={(e) => setValue(e.target.value)} mr="10px" />
                            <Button colorScheme='teal' onClick={joinGame} isDisabled={(game) ? true : false} isLoading={joinGameLoading}>&nbsp;&nbsp;Join Game&nbsp;&nbsp;</Button>
                        </Box>
                    </Box>
                    {(game) ? (<Box>
                        <Box>
                            {game.players.map(player => (
                                <Box key={player.user._id}>{player.user.name}</Box>
                            ))}
                            {Array.from({ length: 4 - game.players.length }).map((_, index) => (
                                <Box key={`empty-${index}`}>Not Joined</Box>
                            ))}
                        </Box>
                        <Button size="md" colorScheme='teal' onClick={startGame}>Start Game</Button>
                    </Box>) : (<Box></Box>)}
                </>) : (<Box>Loading...</Box>)}
        </>
    )
}
