import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GameContext = createContext();

const GameProvider = ({ children }) => {
  // this variable is used to store the logged in user
  const [user, setUser] = useState();

  // This variable is used to store the information about selectedChat
  const [game, setGame] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
  }, [navigate]);

  return <GameContext.Provider value={{ user, setUser, game, setGame }}>
    {children}
  </GameContext.Provider>;
};

export const GameState = () => {
  return useContext(GameContext);
};

export default GameProvider;
