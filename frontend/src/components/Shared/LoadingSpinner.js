import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle-inner"></div>
        <div className="spinner-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
      <style jsx>{`
        .loading-spinner-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          width: 100%;
        }
        
        .loading-spinner {
          position: relative;
          width: 60px;
          height: 60px;
        }
        
        .spinner-circle {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(74, 86, 226, 0.1);
          border-top: 4px solid #4A56E2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .spinner-circle-inner {
          position: absolute;
          top: 10px;
          left: 10px;
          width: calc(100% - 20px);
          height: calc(100% - 20px);
          border: 4px solid transparent;
          border-right: 4px solid #4A56E2;
          border-radius: 50%;
          animation: spin-reverse 0.8s linear infinite;
        }
        
        .spinner-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #4A56E2;
          animation: pulse 1.5s ease infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;