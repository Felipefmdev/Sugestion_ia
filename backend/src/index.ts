// src/index.ts

import express from 'express';
import cors from 'cors';
import { startDataCollection, getGameHistory, analyzeAndSaveSuggestion } from './services/aiService.js';
import supabase from './config/supabase.js';
import './types/express/index.d.ts'; // Importa a nossa extensão de tipos

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Middleware para obter o ID do usuário da sessão a partir do JWT
const getUserIdFromAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Nenhum token de autenticação válido fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
        console.error('Erro de autenticação:', error.message);
        return res.status(401).json({ error: 'Token de autenticação inválido.' });
    }

    req.user_id = data.user.id;
    next();
};

// Inicia a coleta de dados de jogos em um loop separado
startDataCollection();

// Endpoint público para o histórico de jogos
app.get('/api/game-history', async (req, res) => {
    try {
        const history = await getGameHistory(50);
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno ao buscar o histórico.' });
    }
});

// Endpoint protegido para buscar dados do usuário e disparar a análise da IA
app.get('/api/user-data', getUserIdFromAuth, async (req, res) => {
    try {
        const user_id = req.user_id;

        // Dispara a análise da IA para o usuário logado e salva a sugestão
        await analyzeAndSaveSuggestion(null, user_id!);

        // Busca a sugestão e as métricas específicas do usuário
        const { data: aiSuggestion } = await supabase.from('ai_suggestions').select('*').single();
        const { data: strategyMetrics } = await supabase.from('strategy_metrics').select('*').eq('user_id', user_id).order('activation_count', { ascending: false });

        res.status(200).json({
            suggestion: aiSuggestion,
            metrics: strategyMetrics
        });
    } catch (err) {
        console.error('Erro ao processar dados do usuário:', err);
        res.status(500).json({ error: 'Erro ao processar dados do usuário.' });
    }
});

// Endpoint protegido para criar uma nova estratégia personalizada
app.post('/api/user-strategies', getUserIdFromAuth, async (req, res) => {
    try {
        const user_id = req.user_id;
        const { name, pattern } = req.body;

        const { error } = await supabase
            .from('user_strategies')
            .insert([{ user_id, name, pattern, suggestion: 'TBD' }]);

        if (error) throw error;
        res.status(201).json({ message: 'Estratégia salva com sucesso!' });
    } catch (err) {
        console.error('Erro ao salvar a estratégia:', err);
        res.status(500).json({ error: 'Erro ao salvar a estratégia.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});