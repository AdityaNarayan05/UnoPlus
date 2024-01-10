import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import GameProvider from './Context/GameProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <GameProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </GameProvider>
  </BrowserRouter>
);
