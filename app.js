require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 5000;

// Configurar o EJS como motor de visualização
app.set('view engine', 'ejs');

// Middleware para receber dados do formulário (POST)
app.use(express.urlencoded({ extended: true }));

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

// Rota principal (Página de avaliações)
app.get('/', (req, res) => {
  // Buscar todas as avaliações
  connection.query('SELECT * FROM avaliacoes ORDER BY data_avaliacao DESC', (err, results) => {
    if (err) {
      console.error('Erro ao buscar avaliações:', err);
      return res.status(500).send('Erro ao buscar avaliações');
    }
    res.render('index', { avaliacoes: results });
  });
});

// Rota para enviar uma avaliação
app.post('/avaliar', (req, res) => {
  const { nome_usuario, comentario, nota } = req.body;

  if (!nome_usuario || !nota) {
    return res.status(400).send('Nome e nota são obrigatórios!');
  }

  // Inserir nova avaliação no banco de dados
  connection.query(
    'INSERT INTO avaliacoes (nome_usuario, comentario, nota) VALUES (?, ?, ?)',
    [nome_usuario, comentario, nota],
    (err) => {
      if (err) {
        console.error('Erro ao inserir avaliação:', err);
        return res.status(500).send('Erro ao inserir avaliação');
      }
      res.redirect('/');
    }
  );
});

// Servidor ouvindo
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});