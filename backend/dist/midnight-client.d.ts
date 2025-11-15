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
export declare class MidnightClient {
    private client;
    private apiKey;
    private mockMode;
    private mockTickets;
    private mockApprovals;
    constructor(apiUrl?: string, apiKey?: string);
    /**
     * Mint a ticket in Midnight private contract
     *
     * MOCK: Returns a deterministic commitmentHash based on inputs
     * REAL: Would call Midnight.mintTicket via SDK and get ZK proof
     */
    mintTicket(request: MintTicketRequest): Promise<MintTicketResponse>;
    /**
     * Request resale approval in Midnight
     *
     * MOCK: Validates buyerProof structure and approves
     * REAL: Would verify ZK proof of ownership
     */
    requestResale(request: RequestResaleRequest): Promise<RequestResaleResponse>;
    /**
     * Transfer ticket in Midnight private contract
     *
     * MOCK: Validates transferProof and updates ownership
     * REAL: Would verify ZK proof of transfer authorization
     */
    transferTicket(request: TransferTicketRequest): Promise<TransferTicketResponse>;
    /**
     * Cancel ticket in Midnight private contract
     *
     * MOCK: Removes ticket from private state
     * REAL: Would verify organizer signature and emit cancel event
     */
    cancelTicket(request: CancelTicketRequest): Promise<CancelTicketResponse>;
    /**
     * Verify a ZK proof (mock version)
     *
     * In production, this would verify the actual ZK proof
     */
    verifyZKProof(proof: Record<string, any>): Promise<boolean>;
    /**
     * Check if a ticket has been approved for resale
     */
    isApprovedForResale(ticketId: string): boolean;
    private mockMintTicket;
    private mockRequestResale;
    private mockTransferTicket;
    private mockCancelTicket;
}
export declare function createMidnightClient(): MidnightClient;
//# sourceMappingURL=midnight-client.d.ts.map