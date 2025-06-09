// src/components/AuthLayout.js
import React from 'react';
import logoDark from '../assets/logo.jpg';
export default function AuthLayout({ children }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative bg-light">
      {/* top-left logo */}
      <a href="/" className="position-absolute top-0 start-0 p-3">
        <img src={logoDark} alt="Aqua Ledger" style={{height:40}} />
      </a>
      {/* card content */}
      {children}
    </div>
  );
}
