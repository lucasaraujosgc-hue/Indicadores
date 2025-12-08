
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Banco de Dados SQLite
const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
    initDb();
  }
});

// Inicializa a tabela se não existir
function initDb() {
  const sql = `
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      topicId TEXT NOT NULL,
      description TEXT NOT NULL,
      chartConfig TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )
  `;
  db.run(sql, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err.message);
    } else {
      console.log('Tabela "posts" pronta.');
    }
  });
}

// --- API ROUTES ---

// Listar todos os posts
app.get('/api/posts', (req, res) => {
  const sql = 'SELECT * FROM posts ORDER BY createdAt DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    // Parse chartConfig JSON string back to object
    const posts = rows.map(row => ({
      ...row,
      chartConfig: JSON.parse(row.chartConfig)
    }));
    res.json({ data: posts });
  });
});

// Criar novo post
app.post('/api/posts', (req, res) => {
  const { id, topicId, description, chartConfig, createdAt } = req.body;
  
  const sql = `INSERT INTO posts (id, topicId, description, chartConfig, createdAt) VALUES (?, ?, ?, ?, ?)`;
  const params = [id, topicId, description, JSON.stringify(chartConfig), createdAt];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Post criado com sucesso', id: id });
  });
});

// Deletar post
app.delete('/api/posts/:id', (req, res) => {
  const sql = 'DELETE FROM posts WHERE id = ?';
  db.run(sql, req.params.id, function(err) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ message: 'Post deletado', changes: this.changes });
  });
});

// --- SERVING FRONTEND ---
// Serve os arquivos estáticos da build do Vite (pasta dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Qualquer rota que não seja API retorna o index.html (para o React Router funcionar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
