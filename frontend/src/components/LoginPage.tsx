// src/LoginPage.tsx

import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import ForgotPassword from './ForgotPassword'; // Importe o novo componente

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage('Logado com sucesso!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setMessage(`Erro: ${error.message}`);
      } else {
        setMessage('Ocorreu um erro desconhecido.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isResettingPassword) {
    return <div className="login-container"><ForgotPassword onBackToLogin={() => setIsResettingPassword(false)} /></div>;
  }

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2>Entrar</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : 'Entrar'}
          </button>
        </div>
        <p className="forgot-password-link" onClick={() => setIsResettingPassword(true)}>Esqueceu a senha?</p>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default LoginPage;