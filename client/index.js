import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/useAuthContext';
import App from './App';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';

const container = document.getElementById('app');

const root = ReactDOM.createRoot(container);

root.render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route index element={<App/>}/>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
