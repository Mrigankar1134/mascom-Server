import React from 'react';

const Preloader = () => {
  const preloaderStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    zIndex: 9999,
  };

  const spinnerStyle = {
    border: '8px solid #f3f3f3',
    borderTop: '8px solid #3498db',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite',
  };

  
  const spinnerAnimation = `@keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }`;

  
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(spinnerAnimation, styleSheet.cssRules.length);

  return (
    <div style={preloaderStyle}>
      <div style={spinnerStyle}></div>
    </div>
  );
};

export default Preloader;