import { Route, Routes } from 'react-router-dom';
import LoginSignUp from './pages/LoginSignUpPage';
import GamePage from './pages/GamePage';
import GamePlayPage from './pages/GamePlayPage';
import demo from './pages/demo';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" Component={LoginSignUp} />
        <Route path='/game' Component={GamePage} />
        <Route path="/getGame" Component={GamePlayPage} />
        <Route path="/demo" Component={demo} />
      </Routes>
    </div>
  );
}

export default App;
