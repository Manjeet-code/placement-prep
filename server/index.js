const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

console.log('Starting server...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'SET ✅' : 'MISSING ❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✅' : 'MISSING ❌');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET ✅' : 'MISSING ❌');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    /\.vercel\.app$/,
    '*'
  ],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Placement Prep API running ✅' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/interview', require('./routes/interview'));
app.use('/api/recruiter', require('./routes/recruiter'));
app.use('/api/admin', require('./routes/admin')); 

// MongoDB connect
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected ✅');
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} ✅`);
  });
});