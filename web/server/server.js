import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import coursesRouter from './routes/courses.js';
import filesRouter from './routes/files.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes
app.use('/api/courses', coursesRouter);
app.use('/api/files', filesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Professor Assistant Server is running' });
});

// Serve static files from React build (if exists)
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (path.extname(req.path) === '') {
    res.sendFile(indexPath, { root: '/' });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎓 Professor Assistant Server`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
