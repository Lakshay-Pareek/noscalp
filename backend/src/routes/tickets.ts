import { Router } from 'express';
import { AuthenticatedRequest, requireAuth, requireOrganizerRole, requireBuyerOrMarketplaceRole } from '../middleware/auth';
import { MidnightClient } from '../midnight-client';
import { CardanoTransactionBuilder } from '../cardano-tx';
import * as db from '../db';
import { generateSalt, createOwnerCommitment, createCommitmentHash, createMetadataHash } from '../utils/crypto';

const router = Router();

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
router.post(
  '/mint',
  requireAuth,
  requireOrganizerRole,
  async (req: AuthenticatedRequest, res) => {
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
      const salt = generateSalt();
      const ownerCommitment = createOwnerCommitment(buyerPubKey, salt);
      const metadataHash = createMetadataHash(metadata);
      const commitmentHash = createCommitmentHash(ticketId, ownerCommitment, salt);

      // Step 2: Call Midnight to mint ticket
      const midnight = new MidnightClient();
      const midnightResponse = await midnight.mintTicket({
        ticketId,
        ownerCommitment,
        metadataHash,
        organizerSig: 'mock-organizer-sig', // In production, sign with organizer key
      });

      // Step 3 & 4: Build and submit Cardano transaction
      const cardanoConfig = {
        network: (process.env.CARDANO_NETWORK || 'testnet') as 'testnet' | 'mainnet',
        blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID || '',
        organizerPubKeyHash: process.env.ORGANIZER_PUBKEY_HASH || '',
      };

      const cardano = new CardanoTransactionBuilder(cardanoConfig);
      const txResponse = await cardano.buildAndSubmitMintTx({
        ticketId,
        commitmentHash: midnightResponse.commitmentHash,
        metadata,
      });

      // Step 5: Persist to DB
      const policyId = CardanoTransactionBuilder.getPolicyId();
      const tokenName = `TICKET#${ticketId}`;

      const ticket = await db.createTicket(
        ticketId,
        tokenName,
        policyId,
        midnightResponse.commitmentHash,
        ownerCommitment,
        buyerPubKey,
        metadata,
        txResponse.txHash
      );

      // Log operation
      await db.createAuditLog('MINT', ticketId, req.user!.id, {
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
    } catch (error) {
      console.error('Mint ticket error:', error);
      res.status(500).json({
        error: 'Failed to mint ticket',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

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
router.post(
  '/cancel',
  requireAuth,
  requireOrganizerRole,
  async (req: AuthenticatedRequest, res) => {
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
      const midnight = new MidnightClient();
      const midnightResponse = await midnight.cancelTicket({
        ticketId,
        organizerSig: 'mock-organizer-sig',
      });

      // Step 2 & 3: Build and submit burn transaction
      const cardanoConfig = {
        network: (process.env.CARDANO_NETWORK || 'testnet') as 'testnet' | 'mainnet',
        blockfrostProjectId: process.env.BLOCKFROST_PROJECT_ID || '',
        organizerPubKeyHash: process.env.ORGANIZER_PUBKEY_HASH || '',
      };

      const cardano = new CardanoTransactionBuilder(cardanoConfig);
      const txResponse = await cardano.buildAndSubmitBurnTx({
        ticketId,
        policyId: ticket.policyId,
        tokenName: ticket.tokenName,
        cancelCommitment: midnightResponse.cancelCommitment,
      });

      // Step 4: Update DB
      await db.updateTicketStatus(ticketId, 'canceled', txResponse.txHash);

      // Log operation
      await db.createAuditLog('CANCEL', ticketId, req.user!.id, {
        burnTxHash: txResponse.txHash,
        cancelCommitment: midnightResponse.cancelCommitment,
      });

      res.json({
        success: true,
        burnTxHash: txResponse.txHash,
      });
    } catch (error) {
      console.error('Cancel ticket error:', error);
      res.status(500).json({
        error: 'Failed to cancel ticket',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

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
router.post(
  '/request-resale',
  requireAuth,
  requireBuyerOrMarketplaceRole,
  async (req: AuthenticatedRequest, res) => {
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
      const midnight = new MidnightClient();
      const midnightResponse = await midnight.requestResale({
        ticketId,
        buyerProof,
      });

      if (!midnightResponse.approved) {
        res.status(400).json({ error: 'Midnight did not approve resale' });
        return;
      }

      // Log operation
      await db.createAuditLog('REQUEST_RESALE', ticketId, req.user!.id, {
        approved: true,
      });

      res.json({
        success: true,
        approved: true,
      });
    } catch (error) {
      console.error('Request resale error:', error);
      res.status(500).json({
        error: 'Failed to request resale',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

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
router.post(
  '/transfer',
  requireAuth,
  requireBuyerOrMarketplaceRole,
  async (req: AuthenticatedRequest, res) => {
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
      const midnight = new MidnightClient();
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
      const salt = generateSalt();
      const newOwnerCommitment = createOwnerCommitment(newBuyerPubKey, salt);

      // Call Midnight to transfer
      const midnightResponse = await midnight.transferTicket({
        ticketId,
        newOwnerCommitment,
        transferProof,
      });

      // Create transfer approval record
      const approval = await db.createTransferApproval(
        ticketId,
        midnightResponse.transferCommitment,
        newOwnerCommitment
      );

      // Update ticket (in production, only after on-chain confirmation)
      // For now, mark as transferred
      await db.updateTicketStatus(ticketId, 'transferred');

      // Log operation
      await db.createAuditLog('TRANSFER', ticketId, req.user!.id, {
        newBuyerPubKey,
        transferCommitment: midnightResponse.transferCommitment,
      });

      res.json({
        success: true,
        transferCommitment: midnightResponse.transferCommitment,
        approval,
      });
    } catch (error) {
      console.error('Transfer ticket error:', error);
      res.status(500).json({
        error: 'Failed to transfer ticket',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

/**
 * GET /api/tickets/:ticketId
 * 
 * Get ticket details
 */
router.get('/:ticketId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await db.getTicket(ticketId);
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' });
      return;
    }

    res.json(ticket);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      error: 'Failed to get ticket',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
