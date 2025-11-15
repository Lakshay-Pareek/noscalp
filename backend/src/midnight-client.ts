import axios, { AxiosInstance } from 'axios';
import { sha256 } from './utils/crypto';

/**
 * MOCK: Midnight SDK Client Wrapper
 * 
 * In production, this would use the actual Midnight SDK.
 * For the hackathon demo, we mock the Midnight private contract calls.
 * 
 * Real Midnight SDK integration would:
 * - Use @midnight-ntwrk/midnight-js SDK
 * - Call actual ZK proving circuits
 * - Verify ZK proofs server-side
 * 
 * TODO: Replace mock calls with real Midnight SDK when available
 */

export interface MintTicketRequest {
  ticketId: string;
  ownerCommitment: string;
  metadataHash: string;
  organizerSig: string;
}

export interface MintTicketResponse {
  commitmentHash: string;
  ticketId: string;
  timestamp: string;
}

export interface RequestResaleRequest {
  ticketId: string;
  buyerProof: Record<string, any>;
}

export interface RequestResaleResponse {
  approved: boolean;
  ticketId: string;
  timestamp: string;
}

export interface TransferTicketRequest {
  ticketId: string;
  newOwnerCommitment: string;
  transferProof: Record<string, any>;
}

export interface TransferTicketResponse {
  transferCommitment: string;
  ticketId: string;
  timestamp: string;
}

export interface CancelTicketRequest {
  ticketId: string;
  organizerSig: string;
}

export interface CancelTicketResponse {
  cancelCommitment: string;
  ticketId: string;
  timestamp: string;
}

export class MidnightClient {
  private client: AxiosInstance;
  private apiKey: string;
  private mockMode: boolean = true;

  // Mock storage for private state (in real Midnight, this is in the private contract)
  private mockTickets: Map<string, any> = new Map();
  private mockApprovals: Map<string, boolean> = new Map();

  constructor(apiUrl: string = 'http://localhost:8080', apiKey: string = '') {
    this.apiKey = apiKey || process.env.MIDNIGHT_API_KEY || 'mock-key';
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Determine if we're in mock mode (when Midnight SDK is not available)
    this.mockMode = process.env.MIDNIGHT_MOCK === 'true' || !apiUrl.includes('localhost');
  }

  /**
   * Mint a ticket in Midnight private contract
   * 
   * MOCK: Returns a deterministic commitmentHash based on inputs
   * REAL: Would call Midnight.mintTicket via SDK and get ZK proof
   */
  async mintTicket(request: MintTicketRequest): Promise<MintTicketResponse> {
    if (this.mockMode) {
      return this.mockMintTicket(request);
    }

    try {
      const response = await this.client.post<MintTicketResponse>(
        '/midnight/mintTicket',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Midnight mintTicket error:', error);
      throw new Error(`Failed to mint ticket in Midnight: ${error}`);
    }
  }

  /**
   * Request resale approval in Midnight
   * 
   * MOCK: Validates buyerProof structure and approves
   * REAL: Would verify ZK proof of ownership
   */
  async requestResale(request: RequestResaleRequest): Promise<RequestResaleResponse> {
    if (this.mockMode) {
      return this.mockRequestResale(request);
    }

    try {
      const response = await this.client.post<RequestResaleResponse>(
        '/midnight/requestResale',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Midnight requestResale error:', error);
      throw new Error(`Failed to request resale in Midnight: ${error}`);
    }
  }

  /**
   * Transfer ticket in Midnight private contract
   * 
   * MOCK: Validates transferProof and updates ownership
   * REAL: Would verify ZK proof of transfer authorization
   */
  async transferTicket(request: TransferTicketRequest): Promise<TransferTicketResponse> {
    if (this.mockMode) {
      return this.mockTransferTicket(request);
    }

    try {
      const response = await this.client.post<TransferTicketResponse>(
        '/midnight/transferTicket',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Midnight transferTicket error:', error);
      throw new Error(`Failed to transfer ticket in Midnight: ${error}`);
    }
  }

  /**
   * Cancel ticket in Midnight private contract
   * 
   * MOCK: Removes ticket from private state
   * REAL: Would verify organizer signature and emit cancel event
   */
  async cancelTicket(request: CancelTicketRequest): Promise<CancelTicketResponse> {
    if (this.mockMode) {
      return this.mockCancelTicket(request);
    }

    try {
      const response = await this.client.post<CancelTicketResponse>(
        '/midnight/cancelTicket',
        request
      );
      return response.data;
    } catch (error) {
      console.error('Midnight cancelTicket error:', error);
      throw new Error(`Failed to cancel ticket in Midnight: ${error}`);
    }
  }

  /**
   * Verify a ZK proof (mock version)
   * 
   * In production, this would verify the actual ZK proof
   */
  async verifyZKProof(proof: Record<string, any>): Promise<boolean> {
    if (this.mockMode) {
      // Mock: Check if proof has required fields
      return proof && proof.type && proof.signature;
    }

    try {
      const response = await this.client.post<{ valid: boolean }>(
        '/midnight/verifyProof',
        proof
      );
      return response.data.valid;
    } catch (error) {
      console.error('Midnight verifyProof error:', error);
      return false;
    }
  }

  /**
   * Check if a ticket has been approved for resale
   */
  isApprovedForResale(ticketId: string): boolean {
    return this.mockApprovals.get(ticketId) || false;
  }

  // ==================== MOCK IMPLEMENTATIONS ====================

  private mockMintTicket(request: MintTicketRequest): MintTicketResponse {
    const commitmentHash = sha256(
      request.ticketId + request.ownerCommitment + request.metadataHash
    );

    // Store in mock private state
    this.mockTickets.set(request.ticketId, {
      ownerCommitment: request.ownerCommitment,
      metadataHash: request.metadataHash,
      status: 'active',
      createdAt: new Date().toISOString(),
    });

    console.log(`[MOCK] Midnight.mintTicket: ${request.ticketId} -> ${commitmentHash}`);

    return {
      commitmentHash,
      ticketId: request.ticketId,
      timestamp: new Date().toISOString(),
    };
  }

  private mockRequestResale(request: RequestResaleRequest): RequestResaleResponse {
    // Mock: Validate proof structure
    if (!request.buyerProof || !request.buyerProof.type) {
      throw new Error('Invalid buyerProof structure');
    }

    // Mark as approved
    this.mockApprovals.set(request.ticketId, true);

    console.log(`[MOCK] Midnight.requestResale: ${request.ticketId} approved`);

    return {
      approved: true,
      ticketId: request.ticketId,
      timestamp: new Date().toISOString(),
    };
  }

  private mockTransferTicket(request: TransferTicketRequest): TransferTicketResponse {
    // Mock: Validate proof and check approval
    if (!request.transferProof || !request.transferProof.type) {
      throw new Error('Invalid transferProof structure');
    }

    if (!this.mockApprovals.get(request.ticketId)) {
      throw new Error('Ticket not approved for transfer');
    }

    const transferCommitment = sha256(
      request.ticketId + request.newOwnerCommitment + Date.now().toString()
    );

    // Update mock state
    const ticket = this.mockTickets.get(request.ticketId);
    if (ticket) {
      ticket.ownerCommitment = request.newOwnerCommitment;
      ticket.transferredAt = new Date().toISOString();
    }

    // Clear approval
    this.mockApprovals.delete(request.ticketId);

    console.log(`[MOCK] Midnight.transferTicket: ${request.ticketId} -> ${transferCommitment}`);

    return {
      transferCommitment,
      ticketId: request.ticketId,
      timestamp: new Date().toISOString(),
    };
  }

  private mockCancelTicket(request: CancelTicketRequest): CancelTicketResponse {
    const cancelCommitment = sha256(request.ticketId + 'canceled' + Date.now().toString());

    // Remove from mock state
    this.mockTickets.delete(request.ticketId);
    this.mockApprovals.delete(request.ticketId);

    console.log(`[MOCK] Midnight.cancelTicket: ${request.ticketId} -> ${cancelCommitment}`);

    return {
      cancelCommitment,
      ticketId: request.ticketId,
      timestamp: new Date().toISOString(),
    };
  }
}

export function createMidnightClient(): MidnightClient {
  const apiUrl = process.env.MIDNIGHT_API_URL || 'http://localhost:8080';
  const apiKey = process.env.MIDNIGHT_API_KEY || '';
  return new MidnightClient(apiUrl, apiKey);
}
