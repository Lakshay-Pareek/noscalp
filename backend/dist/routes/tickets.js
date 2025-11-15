"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const midnight_client_1 = require("../midnight-client");
const cardano_tx_1 = require("../cardano-tx");
const db = __importStar(require("../db"));
const crypto_1 = require("../utils/crypto");
const router = (0, express_1.Router)();
/**
 * POST /api/tickets/mint
 *
 * Mint a new ticket (organizer only)
 *
 * Flow:
 * 1. Create ownerCommitment = sha256(buyerPubKey || randomSalt)
 * 2. Call Midnight.mintTicket() to record in private contract
 * 3. Build Cardano mint transaction with commitment metadata
 * 4. Sign and submit transaction
 * 5. Persist mapping in DB
 */
router.post('/mint', auth_1.requireAuth, auth_1.requireOrganizerRole, async (req, res) => {
    try {
        const { ticketId, buyerPubKey, metadata } = req.body;
        // Validate input
        if (!ticketId || !buyerPubKey || !metadata) {
            res.status(400).json({ error: 'Missing required fields: ticketId, buyerPubKey, metadata' });
            return;
        }
        if (!metadata.title) {
            res.status(400).json({ error: 'Metadata must include title' });
            return;
        }
        // Check if ticket already exists
        const existing = await db.getTicket(ticketId);
        if (existing) {
            res.status(409).json({ error: 'Ticket already exists' });
            return;
        }
        // Step 1: Create commitments
        const salt = (0, crypto_1.generateSalt)();
        const ownerCommitment = (0, crypto_1.createOwnerCommitment)(buyerPubKey, salt);
        const metadataHash = (0, crypto_1.createMetadataHash)(metadata);
        const commitmentHash = (0, crypto_1.createCommitmentHash)(ticketId, ownerCommitment, salt);
        // Step 2: Call Midnight to mint ticket
        const midnight = new midnight_client_1.MidnightClient();
        const midnightResponse = await midnight.mintTicket({
            ticketId,
            ownerCommitment,
            metadataHash,
            organizerSig: 'mock-organizer-sig', // In production, sign with organizer key
        });
        // Step 3 & 4: Build and submit Cardano transaction
        const cardanoConfig = {
            network: (process.env.CARDANO_NETWORK || 'testnet'),
            blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID || '',
            organizerPubKeyHash: process.env.ORGANIZER_PUBKEY_HASH || '',
        };
        const cardano = new cardano_tx_1.CardanoTransactionBuilder(cardanoConfig);
        const txResponse = await cardano.buildAndSubmitMintTx({
            ticketId,
            commitmentHash: midnightResponse.commitmentHash,
            metadata,
        });
        // Step 5: Persist to DB
        const policyId = cardano_tx_1.CardanoTransactionBuilder.getPolicyId();
        const tokenName = `TICKET#${ticketId}`;
        const ticket = await db.createTicket(ticketId, tokenName, policyId, midnightResponse.commitmentHash, ownerCommitment, buyerPubKey, metadata, txResponse.txHash);
        // Log operation
        await db.createAuditLog('MINT', ticketId, req.user.id, {
            buyerPubKey,
            txHash: txResponse.txHash,
            commitmentHash: midnightResponse.commitmentHash,
        });
        res.status(201).json({
            success: true,
            txHash: txResponse.txHash,
            policyId,
            tokenName,
            commitmentHash: midnightResponse.commitmentHash,
            ticket,
        });
    }
    catch (error) {
        console.error('Mint ticket error:', error);
        res.status(500).json({
            error: 'Failed to mint ticket',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * POST /api/tickets/cancel
 *
 * Cancel a ticket (organizer only)
 *
 * Flow:
 * 1. Call Midnight.cancelTicket() to remove from private contract
 * 2. Build Cardano burn transaction
 * 3. Sign and submit
 * 4. Update DB status
 */
router.post('/cancel', auth_1.requireAuth, auth_1.requireOrganizerRole, async (req, res) => {
    try {
        const { ticketId } = req.body;
        if (!ticketId) {
            res.status(400).json({ error: 'Missing required field: ticketId' });
            return;
        }
        // Get ticket from DB
        const ticket = await db.getTicket(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        if (ticket.status !== 'active') {
            res.status(400).json({ error: `Cannot cancel ticket with status: ${ticket.status}` });
            return;
        }
        // Step 1: Call Midnight to cancel
        const midnight = new midnight_client_1.MidnightClient();
        const midnightResponse = await midnight.cancelTicket({
            ticketId,
            organizerSig: 'mock-organizer-sig',
        });
        // Step 2 & 3: Build and submit burn transaction
        const cardanoConfig = {
            network: (process.env.CARDANO_NETWORK || 'testnet'),
            blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID || '',
            organizerPubKeyHash: process.env.ORGANIZER_PUBKEY_HASH || '',
        };
        const cardano = new cardano_tx_1.CardanoTransactionBuilder(cardanoConfig);
        const txResponse = await cardano.buildAndSubmitBurnTx({
            ticketId,
            policyId: ticket.policyId,
            tokenName: ticket.tokenName,
            cancelCommitment: midnightResponse.cancelCommitment,
        });
        // Step 4: Update DB
        await db.updateTicketStatus(ticketId, 'canceled', txResponse.txHash);
        // Log operation
        await db.createAuditLog('CANCEL', ticketId, req.user.id, {
            burnTxHash: txResponse.txHash,
            cancelCommitment: midnightResponse.cancelCommitment,
        });
        res.json({
            success: true,
            burnTxHash: txResponse.txHash,
        });
    }
    catch (error) {
        console.error('Cancel ticket error:', error);
        res.status(500).json({
            error: 'Failed to cancel ticket',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * POST /api/tickets/request-resale
 *
 * Request resale approval (buyer only)
 *
 * Flow:
 * 1. Verify buyer owns the ticket (via commitment or signature)
 * 2. Submit buyerProof to Midnight
 * 3. If approved, record transferCommitment in DB
 */
router.post('/request-resale', auth_1.requireAuth, auth_1.requireBuyerOrMarketplaceRole, async (req, res) => {
    try {
        const { ticketId, buyerProof } = req.body;
        if (!ticketId || !buyerProof) {
            res.status(400).json({ error: 'Missing required fields: ticketId, buyerProof' });
            return;
        }
        // Get ticket from DB
        const ticket = await db.getTicket(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        if (ticket.status !== 'active') {
            res.status(400).json({ error: `Cannot request resale for ticket with status: ${ticket.status}` });
            return;
        }
        // TODO: Verify buyer owns ticket
        // In production, verify via:
        // - Commitment reveal (buyer provides salt to prove ownership)
        // - Ephemeral signature (buyer signs with derived key)
        // For now, we trust the JWT role
        // Submit to Midnight
        const midnight = new midnight_client_1.MidnightClient();
        const midnightResponse = await midnight.requestResale({
            ticketId,
            buyerProof,
        });
        if (!midnightResponse.approved) {
            res.status(400).json({ error: 'Midnight did not approve resale' });
            return;
        }
        // Log operation
        await db.createAuditLog('REQUEST_RESALE', ticketId, req.user.id, {
            approved: true,
        });
        res.json({
            success: true,
            approved: true,
        });
    }
    catch (error) {
        console.error('Request resale error:', error);
        res.status(500).json({
            error: 'Failed to request resale',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * POST /api/tickets/transfer
 *
 * Transfer ticket to new owner
 *
 * Flow:
 * 1. Verify Midnight approval exists
 * 2. Call Midnight.transferTicket() with proof
 * 3. Create transfer approval record in DB
 * 4. (Optional) Instruct frontend to perform on-chain UTXO transfer
 */
router.post('/transfer', auth_1.requireAuth, auth_1.requireBuyerOrMarketplaceRole, async (req, res) => {
    try {
        const { ticketId, newBuyerPubKey, transferProof } = req.body;
        if (!ticketId || !newBuyerPubKey || !transferProof) {
            res.status(400).json({ error: 'Missing required fields: ticketId, newBuyerPubKey, transferProof' });
            return;
        }
        // Get ticket from DB
        const ticket = await db.getTicket(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        if (ticket.status !== 'active') {
            res.status(400).json({ error: `Cannot transfer ticket with status: ${ticket.status}` });
            return;
        }
        // Verify Midnight approval
        const midnight = new midnight_client_1.MidnightClient();
        if (!midnight.isApprovedForResale(ticketId)) {
            res.status(400).json({ error: 'Ticket not approved for resale in Midnight' });
            return;
        }
        // Verify proof
        const proofValid = await midnight.verifyZKProof(transferProof);
        if (!proofValid) {
            res.status(400).json({ error: 'Invalid transfer proof' });
            return;
        }
        // Create new owner commitment
        const salt = (0, crypto_1.generateSalt)();
        const newOwnerCommitment = (0, crypto_1.createOwnerCommitment)(newBuyerPubKey, salt);
        // Call Midnight to transfer
        const midnightResponse = await midnight.transferTicket({
            ticketId,
            newOwnerCommitment,
            transferProof,
        });
        // Create transfer approval record
        const approval = await db.createTransferApproval(ticketId, midnightResponse.transferCommitment, newOwnerCommitment);
        // Update ticket (in production, only after on-chain confirmation)
        // For now, mark as transferred
        await db.updateTicketStatus(ticketId, 'transferred');
        // Log operation
        await db.createAuditLog('TRANSFER', ticketId, req.user.id, {
            newBuyerPubKey,
            transferCommitment: midnightResponse.transferCommitment,
        });
        res.json({
            success: true,
            transferCommitment: midnightResponse.transferCommitment,
            approval,
        });
    }
    catch (error) {
        console.error('Transfer ticket error:', error);
        res.status(500).json({
            error: 'Failed to transfer ticket',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
/**
 * GET /api/tickets/:ticketId
 *
 * Get ticket details
 */
router.get('/:ticketId', auth_1.requireAuth, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const ticket = await db.getTicket(ticketId);
        if (!ticket) {
            res.status(404).json({ error: 'Ticket not found' });
            return;
        }
        res.json(ticket);
    }
    catch (error) {
        console.error('Get ticket error:', error);
        res.status(500).json({
            error: 'Failed to get ticket',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=tickets.js.map