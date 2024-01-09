import { Route, Routes } from 'react-router-dom';
import LoginSignUp from './pages/LoginSignUpPage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" Component={LoginSignUp} />

      </Routes>
    </div>
  );
}

export default App;
