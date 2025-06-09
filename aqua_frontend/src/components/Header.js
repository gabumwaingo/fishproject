// src/components/Header.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import logoDark from '../assets/logo.jpg';

/**
 * Maps route paths to an outline + filled Bootstrap-Icon pair
 * (used to swap to the filled version when link is active)
 */
const navItems = [
  { path: '/dashboard', label: 'Dashboard',   icon: ['bi-house',           'bi-house-fill'] },
  { path: '/log',       label: 'Log Catch',   icon: ['bi-plus-square',     'bi-plus-square-fill'] },
  { path: '/history',   label: 'History',     icon: ['bi-journal-text',    'bi-journal-text'] },  // same icon both states
  { path: '/profile',   label: 'Profile',     icon: ['bi-person',          'bi-person-fill'] },
  { path: '/logout',    label: 'Logout',      icon: ['bi-box-arrow-right', 'bi-box-arrow-right'], isLogout: true}
];

export default function Header({ onLogout }) {
  return (
    <>
      {/* fixed sidebar */}
      <aside className="sidebar">
        {/* logo */}
        <a href="/" className="position-absolute top-0 start-0 p-3">
          <img src={logoDark} alt="Aqua Ledger" style={{height:36}} />
        </a>

        {/* nav links */}
        <nav className="nav flex-column">
            {navItems.map(({ path, label, icon, isLogout }) => (
              isLogout ? (
                /* --- Logout row --- */
                <button
                  key="logout"
                  onClick={onLogout}                      // 🡐 call the callback
                  className="nav-link text-start bg-transparent border-0 w-100"
                  style={{ cursor: 'pointer' }}
                >
                  <i className={`bi ${icon[0]}`} />       {/* always outline style */}
                  <span className="ms-2">{label}</span>
                </button>
              ) : (
                /* --- Normal routed link --- */
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <i className={`bi ${isActive ? icon[1] : icon[0]}`} />
                      <span className="ms-2">{label}</span>
                  </>
                )}
              </NavLink>
            )
          ))}
        </nav>
      </aside>

      {/* push page content rightward */}
      <div style={{ marginLeft: '220px' }} />
    </>
  );
}

// This Sidebar component provides a fixed navigation sidebar 