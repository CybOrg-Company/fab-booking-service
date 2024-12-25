import express from 'express';
import bodyParser from 'body-parser';
import { Booking } from './services/mongoService.js';
import { fetchAcuityAppointment } from './services/acuityService.js';
import logger from './utils/logger.js';

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log every incoming request
app.use((req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`);
  next();
});

// Health Check Route
app.get('/', (req, res) => {
  logger.info('Health check endpoint called');
  return res.status(200).send('healthy');
});

// Webhook Endpoint
app.post('/webhook', async (req, res) => {
  const { action, id } = req.body;

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
        return 'created';
      } else {
        // Document already existed; it was updated
        logger.info(`Booking ${id} was updated.`);
        return 'updated';
      }
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
