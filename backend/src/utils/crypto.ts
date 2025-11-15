import crypto from 'crypto';

/**
 * Generate a SHA256 hash of the input
 */
export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a random salt (32 bytes hex)
 */
export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create owner commitment: sha256(buyerPubKey || salt)
 */
export function createOwnerCommitment(buyerPubKey: string, salt: string): string {
  return sha256(buyerPubKey + salt);
}

/**
 * Create commitment hash: sha256(ticketId || ownerCommitment || salt)
 */
export function createCommitmentHash(
  ticketId: string,
  ownerCommitment: string,
  salt: string
): string {
  return sha256(ticketId + ownerCommitment + salt);
}

/**
 * Create metadata hash: sha256(JSON.stringify(metadata))
 */
export function createMetadataHash(metadata: Record<string, any>): string {
  return sha256(JSON.stringify(metadata));
}

/**
 * Verify a commitment (for testing/validation)
 */
export function verifyCommitment(
  buyerPubKey: string,
  salt: string,
  commitment: string
): boolean {
  return createOwnerCommitment(buyerPubKey, salt) === commitment;
}
