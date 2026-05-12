const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ["https://madebyrafan.vercel.app", "http://localhost:5000", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true
}));
app.use(express.json());
app.use(express.static('./')); // Serve static files from current directory

// MongoDB Connection
// Gantilah URL di bawah ini dengan URL MongoDB Atlas Anda jika diperlukan
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// Comment Schema
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// Simple Admin Auth Middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const authMiddleware = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Invalid admin password' });
  }
};

// Routes
// Admin Login (Simple check)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// GET all comments
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new comment
app.post('/api/comments', async (req, res) => {
  const comment = new Comment({
    name: req.body.name,
    message: req.body.message
  });

  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a comment (Protected)
app.delete('/api/comments/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
