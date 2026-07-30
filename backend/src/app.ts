import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';
import { notFoundHandler } from './middleware/notFound';
import userRouter from './modules/users/user.routes';
import webhookRouter from './modules/webhook/webhook.routes';
import driverRouter from './modules/drivers/driver.routes';
import adminRouter from './modules/admin/admin.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/api/webhook', webhookRouter);
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/users', userRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/admin', adminRouter);

app.use('*', notFoundHandler);
app.use(errorHandler);

export default app;
