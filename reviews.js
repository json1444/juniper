const mysql = require('mysql2');

// Criação de um pool de conexões para melhor desempenho
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Promessa para garantir o funcionamento assíncrono do pool
const promisePool = pool.promise();

module.exports = async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};