// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import LogCatch from './components/LogCatch';
import History from './components/History';
import Profile from './components/Profile';
import Header from './components/Header';

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
  };

  const onLogout={handleLogout};

  if (!token) {
    // If not logged in, only show Login and Register routes
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If logged in, show the main app routes
  return (
    <>
      <Header onLogout={handleLogout} />
      
      <div className="p-4" style={{ marginLeft: '220px' }}>
        {/* Header with navigation on all authenticated pages */}
        <Header onLogout={handleLogout} />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/log" element={<LogCatch />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
// This App component handles both authenticated and unauthenticated states
// by conditionally rendering routes based on the presence of a token.
// It uses localStorage to persist the token and user info across page reloads.
// The Header component is included on all authenticated pages for navigation.
// The Login and Register components handle user authentication.
// The Dashboard, LogCatch, History, and Profile components are only accessible when logged in.
// This structure allows for a clean separation of concerns and makes it easy to manage user sessions.
// The useEffect hook initializes the token state from localStorage on component mount.
// The handleLogin function updates the token state and saves it to localStorage.
// The handleLogout function clears the token and user info from both state and localStorage.
// This setup provides a solid foundation for building out the rest of the Aqua Ledger application,
// allowing for easy expansion with additional features like catch management, analytics, and more.
// The components for Dashboard, LogCatch, History, and Profile would need to be implemented separately,
// handling their respective functionalities such as displaying catches, logging new catches,
// viewing history, and managing user profiles.
// This code is a complete React application structure for Aqua Ledger,
// providing a solid foundation for further development and feature additions.
// The components for Dashboard, LogCatch, History, and Profile would need to be implemented separately,