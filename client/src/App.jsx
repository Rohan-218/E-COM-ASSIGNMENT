import { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './screens/login/index.jsx';
// import ResetPassword from './components/Authentication/reset-password.jsx';

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      const tokenExpiration = parseInt(localStorage.getItem('tokenExpiration'), 10);
      const currentTime = Date.now();

      if (token && tokenExpiration && currentTime <= tokenExpiration) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
      }
    };

    checkToken();
    const intervalId = setInterval(checkToken, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}
      {/* Optional fallback route */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default App;