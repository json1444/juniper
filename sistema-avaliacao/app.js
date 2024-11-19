const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 4040;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sistema_avaliacao'
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL!');
});

// Rota para adicionar uma nova avaliação
app.post('/avaliacoes', (req, res) => {
    const { nome_usuario, comentario, avaliacao } = req.body;

    if (!nome_usuario || !avaliacao) {
        return res.status(400).send('Nome e avaliação são obrigatórios.');
    }

    const query = 'INSERT INTO avaliacoes (nome_usuario, comentario, avaliacao) VALUES (?, ?, ?)';
    db.query(query, [nome_usuario, comentario, avaliacao], (err, result) => {
        if (err) {
            console.error('Erro ao adicionar avaliação:', err);
            return res.status(500).send('Erro interno ao adicionar avaliação.');
        }
        res.status(201).send('Avaliação adicionada com sucesso!');
    });
});

// Rota para listar todas as avaliações
app.get('/avaliacoes', (req, res) => {
    const query = 'SELECT * FROM avaliacoes ORDER BY data_avaliacao DESC';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar avaliações:', err);
            return res.status(500).send('Erro ao buscar avaliações.');
        }

        res.json(results);
    });
});

// Inicialização do servidor
app.listen(5000, '0.0.0.0');
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});