import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Use named import
import Header from './Faculty/Components/Header';
import AdminSidebar from './Admin/components/AdminSidebar';
import Sidebar from './Faculty/Components/Sidebar';
import StudentSidebar from './Student/Component/StudentSidebar';
import LoginPage from './authentication/Login';
import ForgotPage from './authentication/Forgot';


function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check for token and decode it when component mounts
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const renderSidebar = () => {
    if (!userRole) return null; // No sidebar if not logged in
  
    switch(userRole) {
      case 'admin':
        return <AdminSidebar />;
      case 'faculty':
        return <Sidebar />;
      case 'student':
        return <StudentSidebar />;
      default:
        return null;
    }
  };
  return (
    <Router>
      <Header />
      <div style={{ display: 'flex' }}>
        {renderSidebar()}
        {/* <StudentSidebar/> */}
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/login" element={userRole ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/forgotpassword" element={<ForgotPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;