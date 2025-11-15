/**
 * Generate a SHA256 hash of the input
 */
export declare function sha256(input: string): string;
/**
 * Generate a random salt (32 bytes hex)
 */
export declare function generateSalt(): string;
/**
 * Create owner commitment: sha256(buyerPubKey || salt)
 */
export declare function createOwnerCommitment(buyerPubKey: string, salt: string): string;
/**
 * Create commitment hash: sha256(ticketId || ownerCommitment || salt)
 */
export declare function createCommitmentHash(ticketId: string, ownerCommitment: string, salt: string): string;
/**
 * Create metadata hash: sha256(JSON.stringify(metadata))
 */
export declare function createMetadataHash(metadata: Record<string, any>): string;
/**
 * Verify a commitment (for testing/validation)
 */
export declare function verifyCommitment(buyerPubKey: string, salt: string, commitment: string): boolean;
//# sourceMappingURL=crypto.d.ts.map