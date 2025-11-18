import { Route, Routes } from 'react-router-dom';
import Home from './screens/homepage/index.jsx';

function App() {
  return (
    <>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      
    </>
  );
}

export default App;