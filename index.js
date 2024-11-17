const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Substitua pela sua senha do MySQL
    database: "petluck", // Certifique-se de criar o banco e a tabela antes
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("Conectado ao banco de dados MySQL!");
    }
});

// Rota para buscar avaliações
app.get("/reviews", (req, res) => {
    const sql = "SELECT * FROM reviews ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

// Rota para enviar uma avaliação
app.post("/reviews", (req, res) => {
    const { name, text, rating } = req.body;
    const sql = "INSERT INTO reviews (name, text, rating, created_at) VALUES (?, ?, ?, NOW())";
    db.query(sql, [name, text, rating], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ message: "Avaliação enviada com sucesso!" });
    });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Servidor rodando na porta ${PORT}`));