// src/components/Login.js
import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('');
        const token = data.token;
        // Save token in localStorage so it persists
        localStorage.setItem('token', token);
        // Also store user info if needed
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        // Notify parent (App) that login was successful
        if (onLogin) onLogin(token);
      } else {
        setMessage("❌ " + (data.msg || "Login failed"));
      }
    } catch (err) {
      console.error("Network error:", err);
      setMessage("❌ Network error, please try again");
    }
  };

  return (
    <AuthLayout>
      <div className="card shadow p-4 w-100 fade-in" style={{maxWidth:400}}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email:</label><br/>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-control form-control-lg" />
          </div>
          <div className="mb-4">
            <label className="form-label">Password:</label><br/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-control form-control-lg"/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-100">Log In</button>
          <div className="mb-4">
            <p className="text-center small mt-3 text-muted">Don't have an account? <a href="/register">Sign Up</a></p>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
    </AuthLayout>
  );
}

export default Login;
