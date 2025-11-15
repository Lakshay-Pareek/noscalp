/**
 * Demo Script: Event Ticketing dApp Workflow
 * 
 * This script demonstrates the complete flow:
 * 1. Mint a ticket (organizer)
 * 2. Request resale approval (buyer)
 * 3. Transfer ticket (new buyer)
 * 4. Cancel ticket (organizer)
 */

import axios from 'axios';
import { generateToken } from '../src/middleware/auth';
import { createMockBuyerProof, createMockTransferProof } from '../midnight/TicketContract';

const API_URL = 'http://localhost:3001/api';

interface DemoConfig {
  organizerToken: string;
  buyerToken: string;
  marketplaceToken: string;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
  console.log('🎫 Event Ticketing dApp - Demo Script\n');

  // Generate tokens
  const config: DemoConfig = {
    organizerToken: generateToken('organizer-001', 'organizer'),
    buyerToken: generateToken('buyer-001', 'buyer'),
    marketplaceToken: generateToken('marketplace-001', 'marketplace'),
  };

  try {
    // ==================== STEP 1: MINT TICKET ====================
    console.log('📝 Step 1: Minting a ticket (organizer)\n');

    const mintResponse = await axios.post(
      `${API_URL}/tickets/mint`,
      {
        ticketId: 'ticket-demo-001',
        buyerPubKey: 'addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt',
        metadata: {
          title: 'Concert 2024 - VIP Pass',
          seat: 'A1',
          image: 'ipfs://QmVIPTicket',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.organizerToken}`,
        },
      }
    );

    console.log('✅ Ticket minted successfully!');
    console.log(`   TX Hash: ${mintResponse.data.txHash}`);
    console.log(`   Policy ID: ${mintResponse.data.policyId}`);
    console.log(`   Token Name: ${mintResponse.data.tokenName}`);
    console.log(`   Commitment Hash: ${mintResponse.data.commitmentHash}\n`);

    const ticketId = 'ticket-demo-001';

    // ==================== STEP 2: REQUEST RESALE ====================
    console.log('📝 Step 2: Requesting resale approval (buyer)\n');

    const buyerProof = createMockBuyerProof(ticketId);
    const resaleResponse = await axios.post(
      `${API_URL}/tickets/request-resale`,
      {
        ticketId,
        buyerProof,
      },
      {
        headers: {
          Authorization: `Bearer ${config.buyerToken}`,
        },
      }
    );

    console.log('✅ Resale approved!');
    console.log(`   Approved: ${resaleResponse.data.approved}\n`);

    // ==================== STEP 3: TRANSFER TICKET ====================
    console.log('📝 Step 3: Transferring ticket to new owner (marketplace)\n');

    const transferProof = createMockTransferProof(
      ticketId,
      'new-owner-commitment-hash'
    );
    const transferResponse = await axios.post(
      `${API_URL}/tickets/transfer`,
      {
        ticketId,
        newBuyerPubKey: 'addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt',
        transferProof,
      },
      {
        headers: {
          Authorization: `Bearer ${config.marketplaceToken}`,
        },
      }
    );

    console.log('✅ Ticket transferred successfully!');
    console.log(`   Transfer Commitment: ${transferResponse.data.transferCommitment}\n`);

    // ==================== STEP 4: GET TICKET DETAILS ====================
    console.log('📝 Step 4: Getting ticket details\n');

    const getResponse = await axios.get(`${API_URL}/tickets/${ticketId}`, {
      headers: {
        Authorization: `Bearer ${config.buyerToken}`,
      },
    });

    console.log('✅ Ticket details retrieved!');
    console.log(`   Status: ${getResponse.data.status}`);
    console.log(`   Owner Commitment: ${getResponse.data.ownerCommitment}`);
    console.log(`   Metadata: ${JSON.stringify(getResponse.data.metadata, null, 2)}\n`);

    // ==================== STEP 5: CANCEL TICKET ====================
    console.log('📝 Step 5: Canceling a new ticket (organizer)\n');

    // First, mint another ticket to cancel
    const cancelMintResponse = await axios.post(
      `${API_URL}/tickets/mint`,
      {
        ticketId: 'ticket-demo-cancel-001',
        buyerPubKey: 'addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt',
        metadata: {
          title: 'Concert 2024 - Standard Pass',
          seat: 'B5',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.organizerToken}`,
        },
      }
    );

    console.log('✅ Ticket minted for cancellation');
    console.log(`   TX Hash: ${cancelMintResponse.data.txHash}\n`);

    // Now cancel it
    const cancelResponse = await axios.post(
      `${API_URL}/tickets/cancel`,
      {
        ticketId: 'ticket-demo-cancel-001',
      },
      {
        headers: {
          Authorization: `Bearer ${config.organizerToken}`,
        },
      }
    );

    console.log('✅ Ticket canceled successfully!');
    console.log(`   Burn TX Hash: ${cancelResponse.data.burnTxHash}\n`);

    console.log('🎉 Demo completed successfully!\n');
    console.log('Summary:');
    console.log('  ✓ Minted ticket with commitment metadata');
    console.log('  ✓ Requested resale approval');
    console.log('  ✓ Transferred ticket to new owner');
    console.log('  ✓ Retrieved ticket details');
    console.log('  ✓ Canceled ticket with burn transaction\n');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error:', error.response?.data || error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

// Run demo
demo();
