/**
 * Cardano Transaction Builder
 *
 * Handles building, signing, and submitting transactions to Cardano.
 * Uses Blockfrost API for submission and query.
 *
 * For production, integrate with:
 * - cardano-serialization-lib for transaction building
 * - Blockfrost or Ogmios for submission
 * - Organizer signing key for transaction signing
 */
export interface CardanoConfig {
    network: 'testnet' | 'mainnet';
    blockfrostProjectId: string;
    organizerPubKeyHash: string;
    organizerSigningKeyPath?: string;
}
export interface MintTransactionRequest {
    ticketId: string;
    commitmentHash: string;
    metadata: Record<string, any>;
}
export interface BurnTransactionRequest {
    ticketId: string;
    policyId: string;
    tokenName: string;
    cancelCommitment: string;
}
export interface TransactionResponse {
    txHash: string;
    status: 'submitted' | 'confirmed';
    blockHeight?: number;
}
export declare class CardanoTransactionBuilder {
    private blockfrost;
    private config;
    constructor(config: CardanoConfig);
    /**
     * Build and submit a mint transaction
     *
     * MOCK: Returns a simulated transaction hash
     * REAL: Would use cardano-serialization-lib to build transaction,
     *       sign with organizer key, and submit via Blockfrost
     */
    buildAndSubmitMintTx(request: MintTransactionRequest): Promise<TransactionResponse>;
    /**
     * Build and submit a burn transaction
     *
     * MOCK: Returns a simulated transaction hash
     * REAL: Would build burn (-1 mint) transaction with cancel metadata
     */
    buildAndSubmitBurnTx(request: BurnTransactionRequest): Promise<TransactionResponse>;
    /**
     * Get transaction status from Blockfrost
     */
    getTransactionStatus(txHash: string): Promise<TransactionResponse>;
    /**
     * Generate CIP-25 NFT metadata for on-chain commitment
     */
    static generateNFTMetadata(ticketId: string, commitmentHash: string, metadata: Record<string, any>): Record<string, any>;
    /**
     * Generate cancel metadata for burn transaction
     */
    static generateCancelMetadata(cancelCommitment: string): Record<string, any>;
    /**
     * Get the policy ID (in real implementation, derived from Plutus script)
     */
    static getPolicyId(): string;
    /**
     * Verify organizer signature (mock)
     */
    static verifyOrganizerSignature(signature: string, message: string, organizerPubKeyHash: string): boolean;
    private generateMockTxHash;
    private delay;
}
export declare function createCardanoBuilder(config: CardanoConfig): CardanoTransactionBuilder;
//# sourceMappingURL=cardano-tx.d.ts.map