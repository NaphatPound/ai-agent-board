import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      gap: '16px',
      color: '#5E6C84',
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#172B4D' }}>404</h1>
      <p>Page not found</p>
      <Link to="/" style={{
        padding: '8px 24px',
        background: '#0079BF',
        color: 'white',
        borderRadius: '8px',
        fontWeight: 500,
        textDecoration: 'none',
      }}>
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
