const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Gantilah URL di bawah ini dengan URL MongoDB Atlas Anda jika diperlukan
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_comments';

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

// Biodata Schema
const biodataSchema = new mongoose.Schema({
  name: String,
  subtitle: String,
  description: String,
  quote: String,
  profileImage: String
});
const Biodata = mongoose.model('Biodata', biodataSchema);

// Education Schema
const educationSchema = new mongoose.Schema({
  schoolName: String,
  level: String, // TK, SD, SMP, SMA
  logo: String
});
const Education = mongoose.model('Education', educationSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
  title: String,
  category: String, // desain-grafis, video, fotografi, website
  description: String,
  mediaUrl: String,
  mediaType: String, // image, video
  link: String // optional link for website projects
});
const Project = mongoose.model('Project', projectSchema);

// Achievement (Journey) Schema
const achievementSchema = new mongoose.Schema({
  date: String,
  title: String,
  description: String,
  side: { type: String, enum: ['left', 'right'], default: 'left' }
});
const Achievement = mongoose.model('Achievement', achievementSchema);

// Skill Schema
const skillSchema = new mongoose.Schema({
  name: String,
  logo: String
});
const Skill = mongoose.model('Skill', skillSchema);

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
app.get('/', (req, res) => {
  res.send('Portfolio API is running...');
});

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

// --- BIODATA ROUTES ---
app.get('/api/biodata', async (req, res) => {
  try {
    const biodata = await Biodata.findOne();
    res.json(biodata);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/biodata', authMiddleware, async (req, res) => {
  try {
    let biodata = await Biodata.findOne();
    if (biodata) {
      Object.assign(biodata, req.body);
      await biodata.save();
    } else {
      biodata = new Biodata(req.body);
      await biodata.save();
    }
    res.json(biodata);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- EDUCATION ROUTES ---
app.get('/api/education', async (req, res) => {
  try {
    const education = await Education.find();
    res.json(education);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/education', authMiddleware, async (req, res) => {
  const education = new Education(req.body);
  try {
    const newEducation = await education.save();
    res.status(201).json(newEducation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/education/:id', authMiddleware, async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id);
    res.json({ message: 'Education deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PROJECT ROUTES ---
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  const project = new Project(req.body);
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- ACHIEVEMENT ROUTES ---
app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ date: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/achievements', authMiddleware, async (req, res) => {
  const achievement = new Achievement(req.body);
  try {
    const newAchievement = await achievement.save();
    res.status(201).json(newAchievement);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/achievements/:id', authMiddleware, async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Achievement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- SKILL ROUTES ---
app.get('/api/skills', async (req, res) => {
  try {
    const skills = await Skill.find();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/skills', authMiddleware, async (req, res) => {
  const skill = new Skill(req.body);
  try {
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
