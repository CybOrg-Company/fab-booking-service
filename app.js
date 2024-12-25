import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Booking } from './services/mongoService.js';
import { fetchAcuityAppointment } from './services/acuityService.js';
import logger from './utils/logger.js';
import configureCors from './utils/corsPolicy.js';
import { createRateLimiter, sensitiveRouteLimiter } from './utils/rateLimiter.js';
import { publishToQueue } from './services/rabbitmqService.js';

const app = express();

// Middleware
// Route-specific middleware: Parse raw body for webhook
app.use('/webhook', express.raw({ type: 'application/json' }));

// Global middleware: Parse JSON and URL-encoded bodies for other routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware CORS
const corsOptions = configureCors();
app.use(cors(corsOptions));

// Global rate limiter for all routes
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(globalLimiter);

// Log every incoming request
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url} with body: ${req.body}`);
  next();
});

// Health Check Route
app.get('/', (req, res) => {
  logger.info('Health check endpoint called');
  return res.status(200).send('healthy');
});

// Webhook Endpoint
app.post('/webhook', async (req, res) => {
  const acuitySignature = req.header('x-acuity-signature');

  // Skip verification in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    logger.warn('Skipping webhook signature verification in non-production environment');
  } else {
    try {
      verifyAcuityWebhook(req.body, acuitySignature, process.env.ACUITY_API_KEY);
      logger.info('Webhook verified successfully');
    } catch (error) {
      logger.error(`Webhook verification failed: ${error.message}`);
      return res.status(400).send('Invalid signature or request.');
    }
  }

  // Debug log for raw body
  logger.debug(`Raw body received: ${req.body.toString()}`);
  
  // Parse raw body
  const parsedBody = JSON.parse(req.body.toString());
  const { action, id } = parsedBody;

  logger.info(`Webhook received: action=${action}, id=${id}`);

  if (!id || !action) {
    logger.warn('Webhook missing required fields');
    return res.status(400).send('Missing required fields.');
  }

  try {
    if (action === 'canceled') {
      logger.info(`Processing canceled booking for id=${id}`);
      await Booking.findOneAndUpdate(
        { bookingId: id },
        { canceled: true },
        { upsert: true, new: true }
      );
      logger.info(`Booking ${id} marked as canceled in the database.`);

      // Publish booking data to RabbitMQ
      logger.info(`Publishing Cancellation of ${id} into RabbitMQ Broker Queue: ${process.env.RABBITMQ_QUEUE}.`);
      await publishToQueue(process.env.RABBITMQ_QUEUE, { action, id});
    } else {
      logger.info(`Fetching booking details from Acuity API for id=${id}`);
      const bookingData = await fetchAcuityAppointment(id);
      const result = await Booking.findOneAndUpdate(
        { bookingId: id }, // Query by bookingId
        { $set: { bookingId: id, fullData: bookingData, canceled: false } }, // Data to update
        { upsert: true, new: true, returnOriginal: false } // Options
      );
  
      if (!result.fullData) {
        // Document did not exist before; it was created
        logger.info(`Booking ${id} was created.`);
      } else {
        // Document already existed; it was updated
        logger.info(`Booking ${id} was updated.`);
      }

       // Publish booking data to RabbitMQ
       logger.info(`Publishing Cancellation of ${id} into RabbitMQ Broker Queue: ${process.env.RABBITMQ_QUEUE}.`);
       await publishToQueue(process.env.RABBITMQ_QUEUE, { action, bookingData});
    }

    return res.status(200).send('Webhook handled successfully.');
  } catch (error) {
    logger.error(`Error handling webhook for booking ${id}: ${error.message}`, {
      stack: error.stack,
    });
    return res.status(500).send('Internal server error.');
  }
});

export default app;
