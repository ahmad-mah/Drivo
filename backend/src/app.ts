import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.js';
import userRouter from './modules/users/user.routes.js';
import webhookRouter from './modules/webhook/webhook.routes.js';
import stripeWebhookRouter from './modules/payments/webhooks/stripe-webhook.routes.js';
import paymentsRouter from './modules/payments/payments.routes.js';
import driverRouter from './modules/drivers/driver.routes.js';
import adminRouter from './modules/admin/admin.routes.js';
import rideRouter from './modules/rides/ride.routes.js';
import placeRouter from './modules/places/place.routes.js';
import directionsRouter from './modules/directions/directions.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/api/webhook', webhookRouter);
app.use('/api/webhook', stripeWebhookRouter);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
  });
});
app.use('/api/users', userRouter);
app.use('/api/drivers', driverRouter);
app.use('/api/admin', adminRouter);
app.use('/api/rides', rideRouter);
app.use('/api/places', placeRouter);
app.use('/api/directions', directionsRouter);
app.use('/api/payments', paymentsRouter);

app.use('*', notFoundHandler);
app.use(errorHandler);

export default app;
