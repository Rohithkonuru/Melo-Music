import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';

const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors({ origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

import path from 'path';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorMiddleware';

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health check endpoint required by Phase 1
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: 'melomix-backend',
    status: 'healthy',
  });
});

// Main API routes
app.use('/api', apiRoutes);

// Centralized error handler
app.use(errorHandler);

export const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const { Song } = await import('./models');
    const songCount = await Song.countDocuments();
    if (songCount === 0) {
      const { seedDatabase } = await import('./services/seeder');
      await seedDatabase();
    }

    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Melomix backend running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
    return server;
  } catch (err: any) {
    console.error(`[Server Error] Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
