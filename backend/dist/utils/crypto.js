"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.generateSalt = generateSalt;
exports.createOwnerCommitment = createOwnerCommitment;
exports.createCommitmentHash = createCommitmentHash;
exports.createMetadataHash = createMetadataHash;
exports.verifyCommitment = verifyCommitment;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a SHA256 hash of the input
 */
function sha256(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex');
}
/**
 * Generate a random salt (32 bytes hex)
 */
function generateSalt() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
/**
 * Create owner commitment: sha256(buyerPubKey || salt)
 */
function createOwnerCommitment(buyerPubKey, salt) {
    return sha256(buyerPubKey + salt);
}
/**
 * Create commitment hash: sha256(ticketId || ownerCommitment || salt)
 */
function createCommitmentHash(ticketId, ownerCommitment, salt) {
    return sha256(ticketId + ownerCommitment + salt);
}
/**
 * Create metadata hash: sha256(JSON.stringify(metadata))
 */
function createMetadataHash(metadata) {
    return sha256(JSON.stringify(metadata));
}
/**
 * Verify a commitment (for testing/validation)
 */
function verifyCommitment(buyerPubKey, salt, commitment) {
    return createOwnerCommitment(buyerPubKey, salt) === commitment;
}
//# sourceMappingURL=crypto.js.map