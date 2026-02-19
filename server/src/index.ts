import express from 'express';
import cors from 'cors';
import path from 'path';
import banksRouter from './routes/banks';
import projectsRouter from './routes/projects';
import settingsRouter from './routes/settings';
import countriesRouter from './routes/countries';
import uploadRouter from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/banks', banksRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
