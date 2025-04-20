import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './utils/error-handler.js';

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.static('public'));

// router imports
import healthCheckRouter from './routes/healthcheck.route.js';
import authRouter from './routes/auth.route.js';

app.use('/api/v1/healthcheck', healthCheckRouter);
app.use('/api/v1/users', authRouter);


// Global Error Handler
app.use(errorHandler);

export default app;
