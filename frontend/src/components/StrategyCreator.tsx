// src/components/StrategyCreator.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { supabase } from '../config/supabaseClient';

const colors = [
    { name: 'Azul', value: 'PlayerWon', color: '#007bff' },
    { name: 'Vermelho', value: 'BankerWon', color: '#dc3545' },
    { name: 'Empate', value: 'Tie', color: '#ff8c00' }
];

interface StrategyCreatorProps {
  onStrategySaved: () => void;
  session: any;
}

const StrategyCreator: React.FC<StrategyCreatorProps> = ({ onStrategySaved, session }) => {
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  const handleAddColor = (color: string) => {
    if (pattern.length < 8) {
      setPattern(prev => [...prev, color]);
    }
  };

  const handleClearPattern = () => {
    setPattern([]);
  };

  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = session.access_token;
      if (!token) throw new Error('Usuário não autenticado.');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = { name, pattern };
      await axios.post('http://localhost:3000/api/user-strategies', payload, { headers });
      setMessage('Estratégia salva com sucesso!');
      setName('');
      setPattern([]);
      onStrategySaved();
    } catch (err: any) {
      setMessage(`Erro ao salvar: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="strategy-creator-container">
      <h2>Criar Nova Estratégia</h2>
      <form onSubmit={handleSaveStrategy}>
        <input
          type="text"
          placeholder="Nome da Estratégia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="color-buttons">
          {colors.map(color => (
            <button
              key={color.value}
              type="button"
              className="color-button"
              onClick={() => handleAddColor(color.value)}
              style={{ backgroundColor: color.color }}
            >
              {color.name}
            </button>
          ))}
          <button type="button" onClick={handleClearPattern}>Limpar</button>
        </div>
        <div className="current-pattern-display">
          {pattern.map((color, index) => (
            <div key={index} className="game-bubble-small" style={{ backgroundColor: colors.find(c => c.value === color)?.color || 'gray' }}></div>
          ))}
        </div>
        <button type="submit">Salvar Estratégia</button>
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
};

export default StrategyCreator;