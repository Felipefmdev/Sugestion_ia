// src/index.ts

import express from 'express';
import cors from 'cors';
import { startDataCollection, getGameHistory, analyzeAndSaveSuggestion } from './services/aiService.js';
import supabase from './config/supabase.js';

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
        return res.status(401).json({ error: 'Token de autenticação inválido.' });
    }

    // A CORREÇÃO ESTÁ AQUI: Usamos a "assertion" para garantir que user_id existe
    (req as any).user_id = data.user.id;
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

// Endpoint protegido para analisar a IA e buscar métricas do usuário
app.get('/api/user-data', getUserIdFromAuth, async (req, res) => {
    try {
        // A CORREÇÃO ESTÁ AQUI: Usamos a "assertion" para garantir que user_id existe
        const user_id = (req as any).user_id;

        await analyzeAndSaveSuggestion(null, user_id);

        const { data: aiSuggestion } = await supabase.from('ai_suggestions').select('*').single();
        const { data: strategyMetrics } = await supabase.from('strategy_metrics').select('*').eq('user_id', user_id).order('activation_count', { ascending: false });

        res.status(200).json({
            suggestion: aiSuggestion,
            metrics: strategyMetrics,
        });
    } catch (err) {
        console.error('Erro ao processar dados do usuário:', err);
        res.status(500).json({ error: 'Erro ao processar dados do usuário.' });
    }
});

// Endpoint para criar uma nova estratégia personalizada (protegido)
app.post('/api/user-strategies', getUserIdFromAuth, async (req, res) => {
    try {
        // A CORREÇÃO ESTÁ AQUI: Usamos a "assertion" para garantir que user_id existe
        const user_id = (req as any).user_id;
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