import dotenv from 'dotenv';
import logger from './utils/logger.js'; // Import the logger
import { loadSecretsFromAWS, loadSecretsFromEnvFile } from './services/awssmService.js'; // AWS Secrets Manager service
import { connectToMongoDB } from './services/mongoService.js'; // MongoDB service
import { connectToRabbitMQ } from './services/rabbitmqService.js'; // RabbitMQ service
import app from './app.js'; // Express app

dotenv.config(); // Load environment variables from .env

async function initialize() {
  logger.info('Initializing server setup');

  const secretPostfix = '/fab-booking-service/app';
  const env = process.env.NODE_ENV || 'development';
  const secretName = `${env}${secretPostfix}`;

  try {
    // Load secrets from AWS Secrets Manager
    await loadSecretsFromAWS(secretName);
  } catch (error) {
    logger.warn('Falling back to .env file');
    const envFile = env === 'development' ? '.env.development' : '.env.production';
    loadSecretsFromEnvFile(envFile);
  }

  try {
    // Connect to MongoDB
    await connectToMongoDB(process.env.MONGO_URI);

    // Connect to RabbitMQ
    await connectToRabbitMQ(
      process.env.RABBITMQ_URI,
      process.env.RABBITMQ_EXCHANGE,
      process.env.RABBITMQ_QUEUE
    );

    // Start the Express server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Server initialization failed', { error: error.message, stack: error.stack });
    process.exit(1); // Exit the process with an error code
  }
}

initialize();
