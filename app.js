require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para receber dados JSON
app.use(express.json());

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

// Servidor ouvindo
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


// Rota para adicionar uma nova avaliação
app.post('/avaliacoes', (req, res) => {
    const { nome_usuario, comentario, avaliacao } = req.body;
    
    const query = 'INSERT INTO avaliacoes (nome_usuario, comentario, avaliacao) VALUES (?, ?, ?)';
    connection.query(query, [nome_usuario, comentario, avaliacao], (err, result) => {
      if (err) {
        console.error('Erro ao inserir avaliação:', err);
        return res.status(500).send('Erro no servidor');
      }
      res.status(201).send('Avaliação adicionada com sucesso!');
    });
  });
  
  // Rota para listar todas as avaliações
  app.get('/avaliacoes', (req, res) => {
    const query = 'SELECT * FROM avaliacoes';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Erro ao buscar avaliações:', err);
        return res.status(500).send('Erro no servidor');
      }
      res.json(results);
    });
  });