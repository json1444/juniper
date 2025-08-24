const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Supabase
const supabaseUrl = 'https://drbukxyfvbpcqfzykose.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYnVreHlmdmJwY3Fmenlrb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNjA0MjgsImV4cCI6MjA3MTYzNjQyOH0.HADXFF8pJLkXnwx5Gy-Xz3ccLPHjSFFwmOt6JafZP0I';
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota para obter perfil do usuário
app.get('/api/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
            
        if (error) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para atualizar perfil do usuário
app.put('/api/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, avatar } = req.body;
        
        const { data, error } = await supabase
            .from('profiles')
            .update({ nome, avatar })
            .eq('id', id);
            
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});