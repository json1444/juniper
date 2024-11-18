const mysql = require('mysql2');
const cors = require('cors');
const express = require('express');

// Inicializando o app do Express
const app = express();

// Configurando o CORS para permitir todas as origens
app.use(cors());

// Definindo o corpo da requisição para ser JSON
app.use(express.json());

// Criação do pool de conexões para o banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Usando promises para o pool de conexões
const promisePool = pool.promise();

// Rota para lidar com requisições
app.all('/api/reviews', async (req, res) => {
  try {
    if (req.method === 'GET') {
      // Consulta para pegar todas as avaliações
      const [rows] = await promisePool.query('SELECT * FROM reviews ORDER BY created_at DESC');
      res.status(200).json(rows);
    } else if (req.method === 'POST') {
      // Inserir uma nova avaliação no banco de dados
      const { name, text, rating } = req.body;
      const query = 'INSERT INTO reviews (name, text, rating) VALUES (?, ?, ?)';
      await promisePool.query(query, [name, text, rating]);
      res.status(201).json({ message: 'Avaliação adicionada com sucesso!' });
    } else {
      res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (err) {
    console.error('Erro no backend:', err);
    res.status(500).json({ error: 'Erro ao processar a requisição' });
  }
});

// Inicia o servidor na porta 3000 (ou qualquer outra porta que você configurar)
app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});