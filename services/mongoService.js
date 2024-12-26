import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // Adjust the path as needed

export const connectToMongoDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('Error connecting to MongoDB', { error: error.message });
    throw error;
  }
};

// Define and export models
const bookingSchema = new mongoose.Schema({
  bookingId: String,
  fullData: Object,
  canceled: { type: Boolean, default: false },
});

export const Booking = mongoose.model('Booking', bookingSchema);
