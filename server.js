const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
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

// --- MODELS ---
const Profile = mongoose.model('Profile', profileSchema);
const Education = mongoose.model('Education', educationSchema);
const Project = mongoose.model('Project', projectSchema);
const Achievement = mongoose.model('Achievement', achievementSchema);
const Skill = mongoose.model('Skill', skillSchema);
const Documentation = mongoose.model('Documentation', documentationSchema);
const Comment = mongoose.model('Comment', commentSchema);

// --- ROUTES ---

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

  app.post(`/api/${path}`, async (req, res) => {
    try {
      const newItem = new model(req.body);
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const updatedItem = await model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
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

app.put('/api/profile', async (req, res) => {
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
