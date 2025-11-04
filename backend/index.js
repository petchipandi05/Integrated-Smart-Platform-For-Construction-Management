const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv=require('dotenv')
const authRoutes = require('./routes/auth');
const clientRequestRoutes = require('./routes/clientRequests');
const projectRoutes = require('./routes/projects');
const progressRoutes = require('./routes/progress');
const materialRoutes = require('./routes/materials');
const laborRoutes = require('./routes/labor');

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
dotenv.config();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/requestform', clientRequestRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/progress', progressRoutes); // Changed from /api/projects to /api/progress
app.use('/api/projectsmaterial', materialRoutes);
app.use('/api/projectslabor', laborRoutes);
app.get('/',(req,res)=>res.send("api"));
// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// MongoDB Connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('Database connection error:', err));

// Start Server
 app.listen(process.env.PORT, () => console.log('Server is running on port 3001'));
