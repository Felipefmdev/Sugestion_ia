// src/ForgotPassword.tsx

import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage('Verifique seu email para redefinir a senha.');
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

  return (
    <div className="login-form">
      <h2>Redefinir Senha</h2>
      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </div>
        {message && <p className="message">{message}</p>}
      </form>
      <button onClick={onBackToLogin} className="back-button">Voltar para o Login</button>
    </div>
  );
};

export default ForgotPassword;