// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Permite que o Express lide com JSON

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'luckpet_db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Conectado ao banco de dados MySQL');
});

// Rota para salvar uma avaliação
app.post('/avaliacoes', (req, res) => {
    const { nome_cliente, comentario, nota } = req.body;
    const sql = 'INSERT INTO avaliacoes (nome_cliente, comentario, nota) VALUES (?, ?, ?)';
    
    db.query(sql, [nome_cliente, comentario, nota], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao salvar avaliação');
            return;
        }
        res.status(200).send('Avaliação salva com sucesso!');
    });
});

// Rota para listar todas as avaliações
app.get('/avaliacoes', (req, res) => {
    const sql = 'SELECT * FROM avaliacoes ORDER BY data DESC';

    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Erro ao buscar avaliações');
            return;
        }
        res.json(results);
    });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});