import express from 'express';
import { webhookRouter } from './modules/webhook/webhook.routes';
import { log } from 'console';

const app = express();

app.use(express.json());

app.use('/api/webhook', webhookRouter);

export default app;
