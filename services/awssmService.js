import dotenv from 'dotenv';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import logger from '../utils/logger.js'; // Import the logger

dotenv.config(); // Load environment variables from .env

const region = process.env.AWS_REGION || 'ap-southeast-1'; // Set your AWS region
const client = new SecretsManagerClient({ region });

/**
 * Load secrets from AWS Secrets Manager and inject them into process.env
 * @param {string} secretName - Name of the secret to retrieve
 */
export const loadSecretsFromAWS = async (secretName) => {
  try {
    const response = await client.send(
      new GetSecretValueCommand({
        SecretId: secretName,
        VersionStage: 'AWSCURRENT',
      })
    );

    if (response.SecretString) {
      const secrets = JSON.parse(response.SecretString);
      Object.entries(secrets).forEach(([key, value]) => {
        process.env[key] = value; // Inject secrets into process.env
      });
      logger.info(`Successfully loaded secrets from AWS Secrets Manager: ${secretName}`);
    } else {
      logger.warn(`No SecretString found for AWS Secret: ${secretName}`);
    }
  } catch (error) {
    logger.error(`Failed to retrieve secrets from AWS Secrets Manager: ${error.message}`, {
      stack: error.stack,
    });
    throw error; // Re-throw the error to let the caller handle it
  }
};

/**
 * Fallback to load secrets from a .env file
 * @param {string} envFile - Path to the .env file
 */
export const loadSecretsFromEnvFile = (envFile) => {
  dotenv.config({ path: envFile });
  logger.info(`Loaded environment variables from ${envFile}`);
};
