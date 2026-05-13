const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_db';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Terhubung ke MongoDB'))
  .catch(err => console.error('Gagal terhubung ke MongoDB:', err));

// --- SCHEMAS ---

// Profile Schema
const profileSchema = new mongoose.Schema({
  name: String,
  subtitle: String,
  description: String,
  quote: String,
  profileImg: String
});

// Education Schema
const educationSchema = new mongoose.Schema({
  institution: String,
  level: String,
  logo: String,
  order: Number
});

// Project Schema
const projectSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  media: String,
  mediaType: { type: String, enum: ['image', 'video'] },
  link: String,
  order: Number
});

// Achievement Schema
const achievementSchema = new mongoose.Schema({
  date: String,
  title: String,
  description: String,
  order: Number
});

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: String,
  icon: String,
  order: Number
});

// Documentation Schema
const documentationSchema = new mongoose.Schema({
  title: String,
  date: String,
  media: String,
  link: String,
  order: Number
});

// Comment Schema (Existing)
const commentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// --- MODELS ---
const Profile = mongoose.model('Profile', profileSchema);
const Education = mongoose.model('Education', educationSchema);
const Project = mongoose.model('Project', projectSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Documentation = mongoose.model('Documentation', documentationSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Admin = mongoose.model('Admin', adminSchema);

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Akses ditolak. Silakan login.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};

// --- ROUTES ---

// Root Route for Verification
app.get('/', (req, res) => {
  res.send('Backend Portofolio Rafan sedang berjalan... Silakan akses /api untuk data.');
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ message: 'Username atau password salah.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Username atau password salah.' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register first admin (temporary, remove after use or protect)
app.post('/api/auth/register-initial', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(400).json({ message: 'Admin sudah terdaftar.' });

    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    res.status(201).json({ message: 'Admin pertama berhasil didaftarkan.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper for CRUD
const createCrudRoutes = (model, path) => {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const data = await model.find().sort({ order: 1, createdAt: -1 });
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post(`/api/${path}`, auth, async (req, res) => {
    try {
      const newItem = new model(req.body);
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put(`/api/${path}/:id`, auth, async (req, res) => {
    try {
      const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete(`/api/${path}/:id`, auth, async (req, res) => {
    try {
      await model.findByIdAndDelete(req.params.id);
      res.json({ message: 'Item deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
};

// Register routes
createCrudRoutes(Education, 'education');
createCrudRoutes(Project, 'projects');
createCrudRoutes(Achievement, 'achievements');
createCrudRoutes(Skill, 'skills');
createCrudRoutes(Documentation, 'documentation');

// Profile specific (usually only one)
app.get('/api/profile', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/profile', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (profile) {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true });
    } else {
      profile = new Profile(req.body);
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Comments (Existing)
app.get('/api/comments', async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  const comment = new Comment(req.body);
  try {
    const newComment = await comment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
