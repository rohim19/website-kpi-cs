import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Sesuaikan dengan nama komponen utama kamu ya, entah InputKpi atau Dashboard

function App() {
  // 1. Saat web dibuka, cek dulu apakah sebelumnya sudah login di Local Storage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('statusLogin') === 'true';
  });

  // 2. Fungsi saat berhasil login
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('statusLogin', 'true'); // Kunci pintunya biar ga ke-logout pas refresh!
  };

  // 3. Fungsi saat klik tombol logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('statusLogin'); // Hapus kuncinya
  };

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard onLogout={handleLogout} /> 
      ) : (
        <Login onLoginSuccess={handleLogin} />
      )}
    </div>
  );
}

export default App;