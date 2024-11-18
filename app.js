require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware para receber dados JSON
app.use(express.json()); // Para poder lidar com JSON no corpo das requisições

// Configuração da conexão com o MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Conectar ao MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

// Rota principal para carregar as avaliações
app.get('/avaliacoes', (req, res) => {
  connection.query('SELECT * FROM avaliacoes ORDER BY data_avaliacao DESC', (err, results) => {
    if (err) {
      console.error('Erro ao buscar avaliações:', err);
      return res.status(500).send('Erro ao buscar avaliações');
    }
    res.json(results); // Retorna as avaliações em formato JSON
  });
});

// Rota para enviar uma avaliação
app.post('/avaliacoes', (req, res) => { // Alterei a rota para /avaliacoes
  const { nome_usuario, comentario, avaliacao } = req.body;

  if (!nome_usuario || !avaliacao) {
    return res.status(400).send('Nome e avaliação são obrigatórios!');
  }

  connection.query(
    'INSERT INTO avaliacoes (nome_usuario, comentario, avaliacao) VALUES (?, ?, ?)',
    [nome_usuario, comentario, avaliacao],
    (err) => {
      if (err) {
        console.error('Erro ao inserir avaliação:', err);
        return res.status(500).send('Erro ao inserir avaliação');
      }
      res.status(201).send('Avaliação enviada com sucesso!'); // Confirma a criação da avaliação
    }
  );
});

// Servidor ouvindo
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});