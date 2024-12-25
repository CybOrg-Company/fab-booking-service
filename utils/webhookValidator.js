import crypto from 'crypto';

/**
 * Verify the Acuity webhook signature.
 * @param {Buffer|string} messageBody - The raw request body as a Buffer or string.
 * @param {string} acuitySignature - The signature from the `x-acuity-signature` header.
 * @param {string} sharedSecret - The shared secret to hash the message.
 * @throws {Error} If the signature does not match.
 */
export const verifyAcuityWebhook = (messageBody, acuitySignature, sharedSecret) => {
  // Create the HMAC hash using the shared secret
  const hasher = crypto.createHmac('sha256', sharedSecret);
  hasher.update(messageBody);
  const calculatedHash = hasher.digest('base64');

  // Compare the calculated hash with the Acuity signature
  if (calculatedHash !== acuitySignature) {
    throw new Error('This message was forged or the signature is invalid!');
  }
};
