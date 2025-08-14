// src/App.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { supabase } from './config/supabaseClient';
import LoginPage from './components/LoginPage';
import ResultsChart from './components/ResultsChart';
import StrategyMetricsTable from './components/StrategyMetricsTable';
import './App.css';

interface User {
  id: string;
  email?: string;
}

interface Session {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
  user: User | null;
}

interface SuggestionResponse {
  id: string;
  suggestion: string;
  analysis: string;
  updated_at: string;
  last_games: { outcome: string }[];
}

interface GameHistory {
  id: string;
  outcome: string;
  settledAt: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return <LoginPage />;
  }

  return <AppContent session={session} />;
}

const AppContent: React.FC<{ session: Session }> = ({ session }) => {
  const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const playerWins = history.filter(game => game.outcome === 'PlayerWon').length;
  const bankerWins = history.filter(game => game.outcome === 'BankerWon').length;
  const ties = history.filter(game => game.outcome === 'Tie').length;
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suggestionResponse, historyResponse] = await Promise.all([
          axios.get<SuggestionResponse>('http://localhost:3000/api/ai-suggestion'),
          axios.get<GameHistory[]>('http://localhost:3000/api/game-history')
        ]);
        setSuggestion(suggestionResponse.data);
        setHistory(historyResponse.data);
      } catch (err) {
        console.error("Erro ao buscar dados do backend:", err);
        setError("Não foi possível conectar ao backend ou buscar os dados.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'PlayerWon': return '#007bff';
      case 'BankerWon': return '#dc3545';
      case 'Tie': return '#ff8c00';
      default: return '#6c757d';
    }
  };

  const getSuggestionText = (suggestion: string) => {
    if (suggestion === 'PlayerWon/Tie') return 'Aposte no Player (Azul) ou Empate';
    if (suggestion === 'BankerWon/Tie') return 'Aposte no Banker (Vermelho) ou Empate';
    if (suggestion === 'PlayerWon') return 'Aposte no Player (Azul)';
    if (suggestion === 'BankerWon') return 'Aposte no Banker (Vermelho)';
    return suggestion;
  };

  if (loading) {
    return <div className="loading-screen">Carregando dados...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Análise de Jogos Bac Bo</h1>
        <p>Logado como: {session?.user?.email}</p>
        <button onClick={handleLogout} className="logout-button">Sair</button>
      </header>
      <main>
        <section className="suggestion-section card">
          <h2>Sugestão da IA</h2>
          {suggestion && (
            <>
              <p><strong>Sugestão:</strong> <span style={{ color: getOutcomeColor(suggestion.suggestion), fontWeight: 'bold' }}>{getSuggestionText(suggestion.suggestion)}</span></p>
              <p><strong>Estratégia Ativada:</strong> {suggestion.analysis}</p>
              <div className="last-games-ai">
                {suggestion.last_games?.map((game, index) => (
                  <div key={index} className="game-bubble-small" style={{ backgroundColor: getOutcomeColor(game.outcome) }}></div>
                ))}
              </div>
            </>
          )}
        </section>
        
        <section className="metrics-section card">
            <StrategyMetricsTable />
        </section>
        
        <section className="chart-section card">
          <h2>Distribuição dos Resultados</h2>
          <div className="chart-container">
            <ResultsChart playerWins={playerWins} bankerWins={bankerWins} ties={ties} />
          </div>
        </section>

        <section className="history-section card">
          <h2>Últimos Jogos</h2>
          <div className="history-list-compact">
            {history.map(game => (
              <div key={game.id} className="game-bubble-item">
                <div className="game-bubble" style={{ backgroundColor: getOutcomeColor(game.outcome) }}></div>
                <span className="game-bubble-label">
                  {game.outcome.replace('Won', '').replace('Player', 'Azul').replace('Banker', 'Vermelho').replace('Tie', 'Empate')}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;