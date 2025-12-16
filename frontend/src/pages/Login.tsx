import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { LOGIN_MUTATION } from '../graphql/mutations';
import { LoginResult } from '../types';

export function Login() {
  const navigate = useNavigate();
  const [companyKey, setCompanyKey] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [login, { loading }] = useMutation<{ login: LoginResult }>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login.success) {
        navigate('/projects');
      } else {
        setError(data.login.message || 'Login failed');
      }
    },
    onError: (err) => {
      setError(err.message || 'An error occurred during login');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    login({
      variables: {
        companyKey,
        username,
        password,
      },
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>PSA Multi-Tenant System</h1>
        <p className="login-subtitle">Project Management Login</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="companyKey">Company Key</label>
            <input
              id="companyKey"
              type="text"
              value={companyKey}
              onChange={(e) => setCompanyKey(e.target.value)}
              placeholder="e.g., t1, t2"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., pm_t1"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Tenant 1: t1 / pm_t1 / password123</p>
          <p>Tenant 2: t2 / pm_t2 / password123</p>
        </div>
      </div>
    </div>
  );
}
