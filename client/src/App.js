import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Import Sidebar

function App() {
  return (
    <Router>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
          
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
