/* eslint-disable */
'use client';

import { useState } from 'react';

export default function RegisterTestPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Loading...');

    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Success: ${JSON.stringify(data)}`);
      } else {
        setMessage(`Error: ${res.status} ${res.statusText} - ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      setMessage(`Failed to fetch: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Register Test</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ border: '1px solid black', margin: '0.5rem' }}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: '1px solid black', margin: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ border: '1px solid black', padding: '0.5rem' }}>
          Register
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
