# Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                           │
│              Event Ticketing UI & Wallet Integration             │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Express Backend                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Routes & Controllers                                     │   │
│  │ - POST /api/tickets/mint                                 │   │
│  │ - POST /api/tickets/cancel                               │   │
│  │ - POST /api/tickets/request-resale                       │   │
│  │ - POST /api/tickets/transfer                             │   │
│  │ - GET /api/tickets/:ticketId                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Middleware                                               │   │
│  │ - JWT Authentication                                     │   │
│  │ - Role-based Authorization                               │   │
│  │ - Rate Limiting                                          │   │
│  │ - Request Logging                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Business Logic                                           │   │
│  │ - Commitment Generation                                  │   │
│  │ - Midnight Integration                                   │   │
│  │ - Cardano Transaction Building                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬──────────────────────┬──────────────────────┬───────┘
             │                      │                      │
             ▼                      ▼                      ▼
    ┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
    │  SQLite/Postgres │  │  Midnight SDK    │  │  Blockfrost API │
    │  (Local DB)      │  │  (Private State) │  │  (Cardano)      │
    └─────────────────┘  └──────────────────┘  └─────────────────┘
```

## Component Architecture

### 1. Express Server (`src/index.ts`)

**Responsibilities**:
- Initialize Express application
- Setup middleware (CORS, JSON parsing, logging, rate limiting)
- Register route handlers
- Handle graceful shutdown

**Key Features**:
- Health check endpoint
- Error handling middleware
- Request logging
- Rate limiting (100 req/min per IP)

### 2. Database Layer (`src/db.ts`)

**Responsibilities**:
- SQLite database initialization
- Ticket CRUD operations
- Audit logging
- Transfer approval management

**Tables**:
- `tickets`: Core ticket data with commitments
- `audit_logs`: Immutable operation history
- `transfer_approvals`: Resale approval tracking

**Key Functions**:
- `createTicket()`: Insert new ticket
- `getTicket()`: Retrieve ticket by ID
- `updateTicketStatus()`: Update ticket state
- `createAuditLog()`: Log operations
- `createTransferApproval()`: Record transfer approval

### 3. Midnight Client (`src/midnight-client.ts`)

**Responsibilities**:
- Wrap Midnight SDK calls
- Enforce private contract rules
- Generate commitments

**Mock Implementation** (for hackathon):
- `mintTicket()`: Record ticket in private state
- `requestResale()`: Approve resale
- `transferTicket()`: Update ownership
- `cancelTicket()`: Remove from circulation

**Production Integration**:
- Replace mock with real Midnight SDK
- Implement ZK proof verification
- Connect to Midnight private contract

### 4. Cardano Transaction Builder (`src/cardano-tx.ts`)

**Responsibilities**:
- Build mint/burn transactions
- Attach CIP-25 metadata
- Submit via Blockfrost
- Query transaction status

**Key Functions**:
- `buildAndSubmitMintTx()`: Create mint transaction
- `buildAndSubmitBurnTx()`: Create burn transaction
- `getTransactionStatus()`: Query Blockfrost
- `generateNFTMetadata()`: Create CIP-25 metadata

### 5. Authentication Middleware (`src/middleware/auth.ts`)

**Responsibilities**:
- JWT token generation and verification
- Role-based access control
- Rate limiting
- Request logging

**Roles**:
- `organizer`: Can mint/burn tickets
- `buyer`: Can request resale, transfer
- `marketplace`: Can facilitate transfers

**Key Functions**:
- `generateToken()`: Create JWT
- `verifyToken()`: Validate JWT
- `requireAuth`: Middleware for auth check
- `requireOrganizerRole`: Middleware for organizer check
- `rateLimit()`: Rate limiting middleware

### 6. Routes (`src/routes/tickets.ts`)

**Endpoints**:
- `POST /api/tickets/mint`: Mint new ticket
- `POST /api/tickets/cancel`: Cancel ticket
- `POST /api/tickets/request-resale`: Request resale approval
- `POST /api/tickets/transfer`: Transfer to new owner
- `GET /api/tickets/:ticketId`: Get ticket details

**Flow for Each Endpoint**:
1. Authenticate request
2. Validate input
3. Check authorization
4. Call Midnight contract
5. Build Cardano transaction
6. Update database
7. Log operation
8. Return response

### 7. Cryptographic Utilities (`src/utils/crypto.ts`)

**Functions**:
- `sha256()`: Hash function
- `generateSalt()`: Random salt generation
- `createOwnerCommitment()`: Commitment to buyer
- `createCommitmentHash()`: Commitment for on-chain
- `createMetadataHash()`: Metadata commitment
- `verifyCommitment()`: Verify commitment

## Data Flow

### Mint Flow

```
1. POST /api/tickets/mint
   ├─ Validate input (ticketId, buyerPubKey, metadata)
   ├─ Generate salt
   ├─ Create ownerCommitment = sha256(buyerPubKey || salt)
   ├─ Create metadataHash = sha256(metadata)
   │
2. Call Midnight.mintTicket()
   ├─ Verify organizer signature
   ├─ Store ticket in private state
   └─ Return commitmentHash
   │
3. Build Cardano transaction
   ├─ Create mint action (1 token)
   ├─ Attach CIP-25 metadata with commitmentHash
   ├─ Sign with organizer key
   └─ Submit via Blockfrost
   │
4. Persist to database
   ├─ Create ticket record
   ├─ Store mapping (ticketId → commitmentHash)
   └─ Log operation
   │
5. Return response
   └─ txHash, policyId, tokenName, commitmentHash
```

### Transfer Flow

```
1. POST /api/tickets/request-resale
   ├─ Verify ticket exists and is active
   ├─ Validate buyerProof
   │
2. Call Midnight.requestResale()
   ├─ Verify proof of ownership
   ├─ Create approval (24-hour expiry)
   └─ Return approved status
   │
3. POST /api/tickets/transfer
   ├─ Verify ticket approved for resale
   ├─ Validate transferProof
   │
4. Call Midnight.transferTicket()
   ├─ Verify proof
   ├─ Update ownership to newOwnerCommitment
   ├─ Clear approval
   └─ Return transferCommitment
   │
5. Update database
   ├─ Create transfer approval record
   ├─ Update ticket status
   └─ Log operation
   │
6. Return response
   └─ transferCommitment, approval details
```

### Cancel Flow

```
1. POST /api/tickets/cancel
   ├─ Verify ticket exists and is active
   │
2. Call Midnight.cancelTicket()
   ├─ Verify organizer signature
   ├─ Remove from private state
   └─ Return cancelCommitment
   │
3. Build Cardano burn transaction
   ├─ Create burn action (-1 token)
   ├─ Attach cancel metadata
   ├─ Sign with organizer key
   └─ Submit via Blockfrost
   │
4. Update database
   ├─ Mark ticket as canceled
   ├─ Store burn txHash
   └─ Log operation
   │
5. Return response
   └─ burnTxHash
```

## Security Model

### Authentication

- JWT tokens with 24-hour expiry
- Role-based access control
- Organizer operations require organizer role
- Buyer operations require buyer/marketplace role

### Authorization

- Organizer can: mint, burn, view all tickets
- Buyer can: request resale, transfer, view own tickets
- Marketplace can: facilitate transfers, view tickets

### Commitment-Based Privacy

- On-chain: Only commitmentHash visible
- Private: Midnight holds actual ownerCommitment
- Verification: Backend verifies Midnight state before accepting transfers

### Audit Trail

- All operations logged with timestamp, operator, and details
- Immutable append-only log in database
- Enables forensic analysis and dispute resolution

## Deployment Architecture

### Development

```
Local Machine
├─ Backend (npm run dev)
├─ SQLite database
├─ Midnight mock mode
└─ Blockfrost testnet
```

### Production

```
Docker Container
├─ Node.js runtime
├─ Express server
├─ PostgreSQL database
├─ Midnight SDK (real)
└─ Blockfrost mainnet
```

### Environment Configuration

```
Development (.env)
├─ MIDNIGHT_MOCK=true
├─ DB_URL=sqlite:./tickets.db
├─ CARDANO_NETWORK=testnet
└─ JWT_SECRET=dev-secret

Production (.env.production)
├─ MIDNIGHT_MOCK=false
├─ DB_URL=postgresql://...
├─ CARDANO_NETWORK=mainnet
└─ JWT_SECRET=<strong-secret>
```

## Performance Considerations

### Database

- SQLite for development (single-file, no setup)
- PostgreSQL for production (concurrent access, replication)
- Indexes on ticketId, status for fast queries
- Audit log is append-only (no updates)

### Caching

- JWT tokens cached in memory (24-hour expiry)
- Midnight state cached locally during request
- Cardano transaction status cached briefly

### Rate Limiting

- 100 requests per minute per IP
- Prevents abuse and DDoS
- Configurable per environment

### Concurrency

- Express handles multiple concurrent requests
- Database transactions prevent race conditions
- Midnight state is authoritative for conflicts

## Error Handling

### Validation Errors (400)

- Missing required fields
- Invalid input format
- Invalid proof structure

### Authentication Errors (401)

- Missing authorization header
- Invalid or expired token

### Authorization Errors (403)

- Insufficient role/permissions
- Organizer-only operation attempted by buyer

### Not Found Errors (404)

- Ticket not found
- Invalid ticket ID

### Conflict Errors (409)

- Ticket already exists
- Duplicate mint attempt

### Server Errors (500)

- Database errors
- Midnight SDK errors
- Blockfrost API errors

## Testing Strategy

### Unit Tests

- Commitment generation
- Proof verification
- Database operations

### Integration Tests

- Full mint flow
- Transfer flow with approval
- Cancel flow
- Error cases

### End-to-End Tests

- Complete workflow (mint → resale → transfer → cancel)
- Multiple concurrent operations
- Error recovery

## Monitoring & Logging

### Application Logs

- Request/response logging
- Operation timestamps
- Error stack traces

### Audit Logs

- All state-changing operations
- User/operator identification
- Timestamp and details

### Metrics

- Request count and latency
- Error rates
- Database query times
- Midnight SDK call times

## Future Enhancements

### Phase 2

- Real Midnight SDK integration
- Plutus script deployment
- Mainnet support
- Advanced analytics

### Phase 3

- Multi-event support
- Dynamic pricing
- Bulk operations
- Admin dashboard

### Phase 4

- Cross-chain support
- Layer 2 scaling
- Advanced privacy features
- Decentralized governance
