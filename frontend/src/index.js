import React from 'react';
import ReactDOM from 'react-dom/client'; // Using React 18's new root API
import './index.css'; // Optional, if you have global CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

// Create the root of your application and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
