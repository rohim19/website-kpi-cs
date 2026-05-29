import React, { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Akun admin hardcode sementara
    if (username === 'pride' && password === '123qwer') {
      onLoginSuccess();
    } else {
      alert('Username atau Password salah bro!');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚀 Login KPI CS Admin</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={styles.input} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={styles.input} 
            required 
          />
          <button type="submit" style={styles.btn}>Masuk Dashboard</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  card: { padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '320px', textAlign: 'center' },
  title: { margin: '0 0 25px 0', color: '#1e293b', fontSize: '22px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', backgroundColor: '#f8fafc' },
  btn: { padding: '14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }
};

export default Login;