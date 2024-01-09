import { Route, Routes } from 'react-router-dom';
import LoginSignUp from './pages/LoginSignUpPage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" Component={LoginSignUp} />
        <Route path='/game' Component={GamePage} />
      </Routes>
    </div>
  );
}

export default App;
