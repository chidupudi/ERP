import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Faculty/Components/Header';
import AdminSidebar from './Admin/components/AdminSidebar';
import Sidebar from './Faculty/Components/Sidebar';
import LoginPage from './authentication/Login';
import ForgotPage from './authentication/Forgot';

function App() {
  return (
    <Router>
<Header/>
      <div style={{ display: 'flex' }}>
        {/* <AdminSidebar/> */}
         <Sidebar/> 
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
          <Route path = "/login" element = {<LoginPage/>}/>
          <Route path = "/forgotpassword" element = {<ForgotPage/>}/>
        
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
