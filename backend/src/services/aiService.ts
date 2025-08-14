// src/services/aiService.ts

import { fetchLatestGame, saveGameToSupabase } from './bacboService.js';
import supabase from '../config/supabase.js';

const defaultStrategies = [
    {
        name: '3 Azul 2 Vermelho - Entra Vermelho',
        pattern: ['PlayerWon', 'PlayerWon', 'PlayerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: 'Escada Azul',
        pattern: ['PlayerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: '2 Azul 2 Vermelho - Entra Azul',
        pattern: ['PlayerWon', 'BankerWon', 'PlayerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'Volta de Predominância Vermelha',
        pattern: ['BankerWon', 'BankerWon', 'BankerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: '3 Azul entra red',
        pattern: ['PlayerWon', 'PlayerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: 'T = T',
        pattern: ['Tie'],
        suggestion: 'Tie'
    },
    {
        name: 'B - P - P - P - P',
        pattern: ['BankerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: 'B - P - P - B - B - B',
        pattern: ['BankerWon', 'PlayerWon', 'PlayerWon', 'BankerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'B - B - B - P - P - P',
        pattern: ['BankerWon', 'BankerWon', 'BankerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: 'P - P - B - B - B - P',
        pattern: ['PlayerWon', 'PlayerWon', 'BankerWon', 'BankerWon', 'BankerWon', 'PlayerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'B - P - B - B - B',
        pattern: ['BankerWon', 'PlayerWon', 'BankerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'B - B - P - B - B',
        pattern: ['BankerWon', 'BankerWon', 'PlayerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'P - B - B - P',
        pattern: ['PlayerWon', 'BankerWon', 'BankerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    },
    {
        name: 'B - P - P - B',
        pattern: ['BankerWon', 'PlayerWon', 'PlayerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'P - B - B - B',
        pattern: ['PlayerWon', 'BankerWon', 'BankerWon', 'BankerWon'],
        suggestion: 'PlayerWon/Tie'
    },
    {
        name: 'B - P - P - P',
        pattern: ['BankerWon', 'PlayerWon', 'PlayerWon', 'PlayerWon'],
        suggestion: 'BankerWon/Tie'
    }
];

export const updateStrategyMetrics = async (strategyName: string, isSuccess: boolean) => {
    try {
        const { error } = await supabase.rpc('update_strategy_metrics', {
            _strategy_name: strategyName,
            _is_success: isSuccess
        });
        if (error) {
            console.error('Erro ao atualizar métrica da estratégia:', error);
        } else {
            console.log(`Métrica da estratégia "${strategyName}" atualizada!`);
        }
    } catch (err) {
        console.error('Erro inesperado na atualização da métrica:', err);
    }
};

export const saveSuggestionToSupabase = async (suggestion: string, analysis: string, strategyName: string | null, lastGames: { outcome: string }[]) => {
    const { error } = await supabase
        .from('ai_suggestions')
        .upsert({ id: 'unica-sugestao', suggestion, analysis, strategy_name: strategyName, last_games: lastGames }, { onConflict: 'id' });

    if (error) {
        console.error('Erro ao salvar a sugestão da IA:', error);
    }
};

// Esta função agora aceita o user_id para buscar as estratégias
export const analyzeAndSaveSuggestion = async (latestGameData: any, user_id: string) => {
    console.log('Gerando nova sugestão de IA...');

    if (latestGameData && latestGameData.outcome) {
        const { data: previousSuggestion } = await supabase
            .from('ai_suggestions')
            .select('suggestion, strategy_name')
            .single();

        if (previousSuggestion && previousSuggestion.strategy_name) {
            const isSuccess = previousSuggestion.suggestion?.includes(latestGameData.outcome) || false;
            await updateStrategyMetrics(previousSuggestion.strategy_name, isSuccess);
        }
    }

    const { data: userStrategies, error: userStrategiesError } = await supabase
        .from('user_strategies')
        .select('*')
        .eq('user_id', user_id);

    const allStrategies = [...defaultStrategies, ...(userStrategies || [])];
    const patternMaxLen = Math.max(...allStrategies.map(s => s.pattern.length));
    const { data: games, error } = await supabase
        .from('game_history')
        .select('outcome')
        .order('settledAt', { ascending: false })
        .limit(patternMaxLen);

    if (error || !games || games.length < patternMaxLen) {
        const defaultAnalysis = 'Ainda não há dados suficientes para analisar os padrões.';
        await saveSuggestionToSupabase('Aguarde', defaultAnalysis, null, []);
        return;
    }

    const lastGameOutcomes = games.map(game => game.outcome);
    const lastGameObjects = games;

    for (const strategy of allStrategies) {
        let match = true;
        if (lastGameOutcomes.length >= strategy.pattern.length) {
            for (let i = 0; i < strategy.pattern.length; i++) {
                if (lastGameOutcomes[i] !== strategy.pattern[i]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                const analysis = `Estratégia "${strategy.name}" ativada!`;
                const suggestion = strategy.suggestion;
                await saveSuggestionToSupabase(suggestion, analysis, strategy.name, lastGameObjects);
                return;
            }
        }
    }

    const defaultAnalysis = 'Nenhum padrão de estratégia foi ativado.';
    await saveSuggestionToSupabase('Aguarde', defaultAnalysis, null, lastGameObjects);
};

const fetchAndSaveGame = async () => {
    try {
        console.log('Buscando por novos jogos...');
        const latestGameData = await fetchLatestGame();
        if (latestGameData) {
            const { data: previousGame, error: fetchError } = await supabase
                .from('game_history')
                .select('id')
                .eq('id', latestGameData.id)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                const { error: saveError } = await saveGameToSupabase(latestGameData);
                if (!saveError) {
                    await analyzeAndSaveSuggestion(latestGameData);
                }
            }
        } else {
            await analyzeAndSaveSuggestion(null);
        }
    } catch (err) {
        console.error('Erro crítico no loop de coleta de dados:', err);
    }
    
    // A próxima execução é agendada para continuar o loop
    setTimeout(fetchAndSaveGame, 5000);
};

export const startDataCollection = () => {
    console.log('Iniciando coleta de dados e salvamento...');
    fetchAndSaveGame();
};

export const getGameHistory = async (limit: number = 20) => {
    const { data: games, error } = await supabase
        .from('game_history')
        .select('id, outcome, settledAt')
        .order('settledAt', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Erro ao buscar o histórico de jogos:', error);
        return [];
    }
    return games;
};