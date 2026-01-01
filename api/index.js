// api/index.js - Hospede na Vercel
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco:', err);
  } else {
    console.log('Conectado ao PostgreSQL!');
    release();
  }
});

// Criar tabelas se não existirem
async function createTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        avatar VARCHAR(50) DEFAULT 'cachorro',
        nivel INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        credits INTEGER DEFAULT 50
      );
      
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nome VARCHAR(255),
        avatar VARCHAR(50),
        nivel INTEGER DEFAULT 1,
        data_nascimento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS carrinho (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id VARCHAR(100),
        quantidade INTEGER DEFAULT 1,
        data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS favoritos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id VARCHAR(100),
        data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabelas criadas/verificadas!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
  }
}

createTables();

// Rotas da API

// 1. Cadastro de usuário
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, nome, avatar } = req.body;
    
    const result = await pool.query(
      'INSERT INTO users (email, password, nome, avatar) VALUES ($1, $2, $3, $4) RETURNING id, email, nome, avatar, nivel, credits',
      [email, password, nome, avatar || 'cachorro']
    );
    
    // Criar perfil
    await pool.query(
      'INSERT INTO profiles (user_id, nome, avatar, nivel) VALUES ($1, $2, $3, $4)',
      [result.rows[0].id, nome, avatar || 'cachorro', 1]
    );
    
    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ success: false, error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ success: false, error: 'Erro interno' });
    }
  }
});

// 2. Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query(
      'SELECT id, email, nome, avatar, nivel, credits FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Email ou senha incorretos' });
    }
    
    res.json({ 
      success: true, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 3. Buscar perfil do usuário
app.get('/api/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      `SELECT u.id, u.email, u.nome, u.avatar, u.nivel, u.credits, 
              p.data_nascimento, p.created_at
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
    }
    
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 4. Atualizar créditos
app.put('/api/credits/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { credits } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET credits = $1 WHERE id = $2 RETURNING credits',
      [credits, userId]
    );
    
    res.json({ success: true, credits: result.rows[0].credits });
  } catch (error) {
    console.error('Erro ao atualizar créditos:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 5. Salvar carrinho
app.post('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    // Limpar carrinho atual
    await pool.query('DELETE FROM carrinho WHERE user_id = $1', [userId]);
    
    // Inserir novos itens
    for (const item of items) {
      await pool.query(
        'INSERT INTO carrinho (user_id, product_id, quantidade) VALUES ($1, $2, $3)',
        [userId, item.productId, item.quantidade]
      );
    }
    
    res.json({ success: true, message: 'Carrinho salvo' });
  } catch (error) {
    console.error('Erro ao salvar carrinho:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 6. Buscar carrinho
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT product_id, quantidade FROM carrinho WHERE user_id = $1',
      [userId]
    );
    
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('Erro ao buscar carrinho:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 7. Salvar favoritos
app.post('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { items } = req.body;
    
    // Limpar favoritos atuais
    await pool.query('DELETE FROM favoritos WHERE user_id = $1', [userId]);
    
    // Inserir novos itens
    for (const item of items) {
      await pool.query(
        'INSERT INTO favoritos (user_id, product_id) VALUES ($1, $2)',
        [userId, item]
      );
    }
    
    res.json({ success: true, message: 'Favoritos salvos' });
  } catch (error) {
    console.error('Erro ao salvar favoritos:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// 8. Buscar favoritos
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT product_id FROM favoritos WHERE user_id = $1',
      [userId]
    );
    
    res.json({ success: true, items: result.rows.map(row => row.product_id) });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ success: false, error: 'Erro interno' });
  }
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});

module.exports = app;