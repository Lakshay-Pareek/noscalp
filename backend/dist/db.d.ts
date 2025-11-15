import sqlite3 from 'sqlite3';
export interface Ticket {
    id: string;
    ticketId: string;
    tokenName: string;
    policyId: string;
    commitmentHash: string;
    ownerCommitment: string;
    buyerPubKey: string;
    status: 'active' | 'canceled' | 'transferred';
    metadata: Record<string, any>;
    txHash: string;
    burnTxHash?: string;
    createdAt: string;
    updatedAt: string;
}
export interface AuditLog {
    id: string;
    operation: string;
    ticketId: string;
    requestorId: string;
    details: Record<string, any>;
    timestamp: string;
}
export interface TransferApproval {
    id: string;
    ticketId: string;
    transferCommitment: string;
    newOwnerCommitment: string;
    status: 'pending' | 'approved' | 'completed';
    createdAt: string;
    expiresAt: string;
}
export declare function initializeDatabase(): Promise<void>;
export declare function getDatabase(): sqlite3.Database;
export declare function createTicket(ticketId: string, tokenName: string, policyId: string, commitmentHash: string, ownerCommitment: string, buyerPubKey: string, metadata: Record<string, any>, txHash: string): Promise<Ticket>;
export declare function getTicket(ticketId: string): Promise<Ticket | null>;
export declare function updateTicketStatus(ticketId: string, status: 'active' | 'canceled' | 'transferred', burnTxHash?: string): Promise<void>;
export declare function createAuditLog(operation: string, ticketId: string, requestorId: string, details: Record<string, any>): Promise<AuditLog>;
export declare function createTransferApproval(ticketId: string, transferCommitment: string, newOwnerCommitment: string): Promise<TransferApproval>;
export declare function getTransferApproval(ticketId: string): Promise<TransferApproval | null>;
export declare function updateTransferApprovalStatus(ticketId: string, status: 'pending' | 'approved' | 'completed'): Promise<void>;
export declare function closeDatabase(): Promise<void>;
//# sourceMappingURL=db.d.ts.map