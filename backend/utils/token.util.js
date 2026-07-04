import crypto from 'crypto';

/**
 * Generate a secure hex verification token
 * @returns {string} Hex token
 */
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
