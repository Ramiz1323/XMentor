import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import communityRoutes from './modules/community/community.routes.js';

const app = express();

app.use(express.json()); 
app.use(helmet()); 
app.use(cors()); 
app.use(compression()); 

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/community', communityRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server running',
  });
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
