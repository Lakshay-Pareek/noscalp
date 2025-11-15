# Midnight Private Contract Integration

## Overview

The Midnight contract enforces private ticket ownership and resale policies. This is the authoritative source for ticket state and transfer authorization.

## Contract Functions

### 1. mintTicket

**Purpose**: Record a new ticket in the private contract

**Signature**:
```typescript
mintTicket(
  ticketId: string,
  ownerCommitment: string,
  metadataHash: string,
  organizerSig: string
): { commitmentHash: string }
```

**Parameters**:
- `ticketId`: Unique ticket identifier
- `ownerCommitment`: SHA256(buyerPubKey || salt) - commitment to buyer identity
- `metadataHash`: SHA256(JSON.stringify(metadata)) - commitment to ticket metadata
- `organizerSig`: Organizer's digital signature authorizing mint

**Returns**:
- `commitmentHash`: SHA256(ticketId || ownerCommitment || metadataHash) - for on-chain metadata

**Flow**:
1. Verify organizer signature
2. Check ticket doesn't already exist
3. Create ticket state in private contract
4. Generate and return commitmentHash

**Example**:
```typescript
const response = await midnight.mintTicket({
  ticketId: 'ticket-001',
  ownerCommitment: 'abc123def456...',
  metadataHash: 'xyz789...',
  organizerSig: 'ed25519_signature'
});
// Returns: { commitmentHash: 'commitment_hash_hex' }
```

### 2. requestResale

**Purpose**: Request approval to resale a ticket

**Signature**:
```typescript
requestResale(
  ticketId: string,
  buyerProof: BuyerProof
): { approved: boolean }
```

**Parameters**:
- `ticketId`: Ticket to request resale for
- `buyerProof`: ZK proof of ownership (see Proof Formats below)

**Returns**:
- `approved`: Boolean indicating approval status

**Flow**:
1. Verify ticket exists and is active
2. Verify buyerProof using ZK circuit
3. Create resale approval record (24-hour expiry)
4. Return approval status

**Example**:
```typescript
const proof = {
  type: 'ownership_proof',
  ticketId: 'ticket-001',
  signature: 'ed25519_signature',
  timestamp: Date.now()
};

const response = await midnight.requestResale('ticket-001', proof);
// Returns: { approved: true }
```

### 3. transferTicket

**Purpose**: Transfer ticket to new owner

**Signature**:
```typescript
transferTicket(
  ticketId: string,
  newOwnerCommitment: string,
  transferProof: TransferProof
): { transferCommitment: string }
```

**Parameters**:
- `ticketId`: Ticket to transfer
- `newOwnerCommitment`: SHA256(newBuyerPubKey || newSalt)
- `transferProof`: ZK proof authorizing transfer

**Returns**:
- `transferCommitment`: Commitment hash for on-chain tracking

**Flow**:
1. Verify ticket exists and is active
2. Verify resale approval exists and not expired
3. Verify transferProof using ZK circuit
4. Update ticket ownership to newOwnerCommitment
5. Clear resale approval
6. Generate and return transferCommitment

**Example**:
```typescript
const proof = {
  type: 'transfer_proof',
  ticketId: 'ticket-001',
  newOwnerCommitment: 'new_commitment_hash',
  signature: 'ed25519_signature',
  timestamp: Date.now()
};

const response = await midnight.transferTicket(
  'ticket-001',
  'new_commitment_hash',
  proof
);
// Returns: { transferCommitment: 'transfer_commitment_hex' }
```

### 4. cancelTicket

**Purpose**: Cancel a ticket (remove from circulation)

**Signature**:
```typescript
cancelTicket(
  ticketId: string,
  organizerSig: string
): { cancelCommitment: string }
```

**Parameters**:
- `ticketId`: Ticket to cancel
- `organizerSig`: Organizer's signature authorizing cancellation

**Returns**:
- `cancelCommitment`: Commitment hash for burn metadata

**Flow**:
1. Verify ticket exists and is active
2. Verify organizer signature
3. Mark ticket as canceled
4. Clear any pending resale approvals
5. Generate and return cancelCommitment

**Example**:
```typescript
const response = await midnight.cancelTicket(
  'ticket-001',
  'organizer_signature'
);
// Returns: { cancelCommitment: 'cancel_commitment_hex' }
```

## Proof Formats

### BuyerProof (Ownership Proof)

Used in `requestResale()` to prove the caller owns the ticket.

**Structure**:
```typescript
interface BuyerProof {
  type: 'ownership_proof';
  ticketId: string;
  signature: string;      // Ed25519 signature
  timestamp: number;      // Unix timestamp
}
```

**What it proves**:
- Caller knows the salt that produces the ownerCommitment
- Caller is authorized to request resale

**Generation** (mock for hackathon):
```typescript
import { createMockBuyerProof } from './TicketContract';

const proof = createMockBuyerProof('ticket-001');
// Returns:
// {
//   type: 'ownership_proof',
//   ticketId: 'ticket-001',
//   signature: 'mock-ed25519-signature',
//   timestamp: 1699999999
// }
```

**Real implementation** (with Midnight SDK):
```typescript
// In production, use Midnight's ZK circuit
const proof = await midnight.generateOwnershipProof({
  ticketId: 'ticket-001',
  ownerCommitment: 'abc123...',
  salt: 'xyz789...',
  privateKey: buyerPrivateKey
});
```

### TransferProof

Used in `transferTicket()` to prove authorization for transfer.

**Structure**:
```typescript
interface TransferProof {
  type: 'transfer_proof';
  ticketId: string;
  newOwnerCommitment: string;
  signature: string;      // Ed25519 signature
  timestamp: number;      // Unix timestamp
}
```

**What it proves**:
- Caller is the current owner (knows ownerCommitment salt)
- Caller authorizes transfer to newOwnerCommitment
- Transfer is within approval window

**Generation** (mock for hackathon):
```typescript
import { createMockTransferProof } from './TicketContract';

const proof = createMockTransferProof(
  'ticket-001',
  'new_owner_commitment_hash'
);
// Returns:
// {
//   type: 'transfer_proof',
//   ticketId: 'ticket-001',
//   newOwnerCommitment: 'new_owner_commitment_hash',
//   signature: 'mock-ed25519-signature',
//   timestamp: 1699999999
// }
```

**Real implementation** (with Midnight SDK):
```typescript
const proof = await midnight.generateTransferProof({
  ticketId: 'ticket-001',
  currentOwnerCommitment: 'abc123...',
  newOwnerCommitment: 'def456...',
  salt: 'xyz789...',
  privateKey: buyerPrivateKey
});
```

## Private State

The Midnight contract maintains private state that is NOT visible on-chain:

### Tickets Map
```typescript
tickets: Map<string, {
  ticketId: string;
  ownerCommitment: string;
  metadataHash: string;
  status: 'active' | 'canceled' | 'transferred';
  createdAt: string;
  transferredAt?: string;
}>
```

### Approvals Map
```typescript
approvals: Map<string, {
  ticketId: string;
  approvedAt: string;
  expiresAt: string;  // 24 hours from approval
}>
```

### Transfer History
```typescript
transferHistory: Array<{
  ticketId: string;
  from: string;  // Old ownerCommitment
  to: string;    // New ownerCommitment
  timestamp: string;
}>
```

## Integration with Backend

### Mint Flow
```
Backend (organizer) → Midnight.mintTicket()
  ↓
Midnight returns commitmentHash
  ↓
Backend builds Cardano tx with commitmentHash in metadata
  ↓
Backend submits tx to Cardano
  ↓
Backend stores mapping in DB
```

### Transfer Flow
```
Backend (buyer) → Midnight.requestResale(buyerProof)
  ↓
Midnight verifies proof and approves
  ↓
Backend (marketplace) → Midnight.transferTicket(transferProof)
  ↓
Midnight verifies proof and updates ownership
  ↓
Backend returns transferCommitment
  ↓
Backend updates DB
```

## Switching from Mock to Real Midnight

### Step 1: Install Midnight SDK

```bash
npm install @midnight-ntwrk/midnight-js
```

### Step 2: Update midnight-client.ts

Replace mock implementations with real SDK calls:

```typescript
import { MidnightSDK } from '@midnight-ntwrk/midnight-js';

export class MidnightClient {
  private sdk: MidnightSDK;
  private mockMode: boolean = false;

  constructor(apiUrl: string, apiKey: string) {
    this.sdk = new MidnightSDK({
      apiUrl,
      apiKey,
    });
  }

  async mintTicket(request: MintTicketRequest): Promise<MintTicketResponse> {
    const result = await this.sdk.contracts.ticket.mintTicket(request);
    return {
      commitmentHash: result.commitmentHash,
      ticketId: request.ticketId,
      timestamp: new Date().toISOString(),
    };
  }

  // ... implement other methods similarly
}
```

### Step 3: Implement Real Proof Generation

Replace mock proof generation with Midnight SDK:

```typescript
// In your buyer/frontend code
const proof = await midnight.generateOwnershipProof({
  ticketId: 'ticket-001',
  ownerCommitment: ticket.ownerCommitment,
  salt: buyerSalt,
  privateKey: buyerPrivateKey,
});

// Send proof to backend
const response = await fetch('/api/tickets/request-resale', {
  method: 'POST',
  body: JSON.stringify({
    ticketId: 'ticket-001',
    buyerProof: proof,
  }),
});
```

### Step 4: Update Environment

```env
MIDNIGHT_MOCK=false
MIDNIGHT_API_URL=https://midnight-api.example.com
MIDNIGHT_API_KEY=your_real_api_key
```

## Testing

### Unit Tests

```typescript
import { MidnightTicketContract } from './TicketContract';

describe('MidnightTicketContract', () => {
  let contract: MidnightTicketContract;

  beforeEach(() => {
    contract = new MidnightTicketContract();
  });

  it('should mint a ticket', () => {
    const result = contract.mintTicket(
      'ticket-001',
      'owner-commitment',
      'metadata-hash',
      'organizer-sig'
    );

    expect(result.commitmentHash).toBeDefined();
    expect(contract.getTicketState('ticket-001')).toBeDefined();
  });

  it('should approve resale', () => {
    contract.mintTicket(
      'ticket-001',
      'owner-commitment',
      'metadata-hash',
      'organizer-sig'
    );

    const proof = {
      type: 'ownership_proof' as const,
      ticketId: 'ticket-001',
      signature: 'sig',
      timestamp: Date.now(),
    };

    const result = contract.requestResale('ticket-001', proof);
    expect(result.approved).toBe(true);
  });
});
```

### Integration Tests

```bash
# Run demo to test full flow
npm run demo
```

## Security Considerations

### Proof Verification

In production, always verify ZK proofs:

```typescript
// ❌ WRONG: Trusting proof without verification
if (proof.signature) {
  // Process transfer
}

// ✅ CORRECT: Verify proof
const isValid = await midnight.verifyZKProof(proof);
if (!isValid) {
  throw new Error('Invalid proof');
}
```

### Approval Expiry

Resale approvals expire after 24 hours:

```typescript
const approval = approvals.get(ticketId);
if (new Date(approval.expiresAt) < new Date()) {
  throw new Error('Approval expired');
}
```

### Signature Verification

Always verify organizer signatures for mint/cancel:

```typescript
// In production, verify Ed25519 signature
const isValid = verifySignature(
  message,
  organizerSig,
  organizerPublicKey
);
```

## Debugging

### Enable Logging

```typescript
const midnight = new MidnightClient();
midnight.enableDebugLogging = true;
```

### Check Private State

```typescript
const ticketState = midnight.getTicketState('ticket-001');
console.log('Ticket state:', ticketState);

const isApproved = midnight.isApprovedForResale('ticket-001');
console.log('Approved for resale:', isApproved);
```

## References

- [Midnight Documentation](https://midnight.network/docs)
- [ZK Proofs Overview](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)
