import amqp from 'amqplib';
import logger from '../utils/logger.js'; // Adjust the path as needed

let rabbitChannel;

export const connectToRabbitMQ = async (rabbitMQURI, exchangeName, queueName) => {
  try {
    const connection = await amqp.connect(rabbitMQURI);
    rabbitChannel = await connection.createChannel();
    await rabbitChannel.assertQueue(queueName, { durable: true });
    await rabbitChannel.bindQueue(queueName, exchangeName, '');

    logger.info(`Connected to RabbitMQ and bound queue "${queueName}" to exchange "${exchangeName}"`);
    return rabbitChannel;
  } catch (error) {
    logger.error('Error connecting to RabbitMQ', { error: error.message });
    throw error;
  }
};

export const publishToQueue = async (queueName, message) => {
  if (!rabbitChannel) {
    throw new Error('RabbitMQ channel is not initialized');
  }
  rabbitChannel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
  logger.info(`Message published to queue "${queueName}": ${JSON.stringify(message)}`);
};
