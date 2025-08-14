import axios from 'axios';
import supabase from '../config/supabase.js';

// URL da API dos jogos Bac Bo
const API_URL = 'https://api.casinoscores.com/svc-evolution-game-events/api/bacbo/latest';

// Função para buscar o último jogo da API
export const fetchLatestGame = async () => {
  try {
    const response = await axios.get(API_URL);
    const gameData = response.data.data;
    
    // Verificando se os dados do jogo existem e se a rodada já foi resolvida
    if (!gameData || gameData.status !== 'Resolved') {
      console.log('Nenhum novo jogo resolvido encontrado.');
      return null;
    }

    const { id, startedAt, settledAt, result } = gameData;
    const { outcome, playerDice, bankerDice } = result;

    // Criando um objeto com os dados que queremos salvar
    const gameToSave = {
      id,
      startedAt,
      settledAt,
      outcome,
      playerScore: playerDice.score,
      bankerScore: bankerDice.score,
      playerDice1: playerDice.first,
      playerDice2: playerDice.second,
      bankerDice1: bankerDice.first,
      bankerDice2: bankerDice.second,
    };

    return gameToSave;
  } catch (error) {
    console.error('Erro ao buscar o jogo da API:', error);
    return null;
  }
};

// Função para salvar o jogo no Supabase
export const saveGameToSupabase = async (gameData: any) => {
  if (!gameData) return { error: { message: 'Nenhum dado para salvar.' } };

  // Tenta inserir o jogo na tabela 'game_history'
  const { data, error } = await supabase
    .from('game_history')
    .insert([gameData])
    .select();

  if (error) {
    if (error.code === '23505') {
      console.log(`Jogo com ID ${gameData.id} já existe. Ignorando.`);
      return { error: null }; // Retorna sem erro para duplicidade
    } else {
      console.error('Erro ao salvar o jogo no Supabase:', error);
      return { error };
    }
  } else {
    console.log(`Novo jogo salvo com sucesso! ID: ${gameData.id}`);
    return { error: null };
  }
};