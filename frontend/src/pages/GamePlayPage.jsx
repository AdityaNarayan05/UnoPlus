import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { GameState } from '../Context/GameProvider';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';
var socket;

export default function GamePlayPage() {
    GameState();
    const [loading] = useState(true);

    const getRunningGame = async () => {
        // ... (your existing code for getRunningGame function)
    };

    useEffect(() => {
        socket = io(ENDPOINT);
        getRunningGame();
    }, []);

    useEffect(() => {
        socket.on('state changed', async () => {
            // ... (your existing code for state changed event)
        });
    }, []);

    return (
        <>
            {(!loading) ? (
                <Box>
                    {/* ... (your existing JSX code) */}
                </Box>
            ) : (
                <Box>Loading...</Box>
            )}
        </>
    );
}
