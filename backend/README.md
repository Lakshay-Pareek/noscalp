# Event Ticketing dApp Backend

Production-oriented backend for an event ticketing application using Midnight (ZK/private smart contracts) and Cardano (NFT minting).

## Features

- **Private Ticket Management**: Midnight contracts enforce ticket ownership and resale policies
- **On-Chain NFT Minting**: Cardano Plutus V2 policy for organizer-controlled minting/burning
- **Compact Commitments**: SHA256-based metadata commitments (no PII on-chain)
- **JWT Authentication**: Role-based access control (organizer, buyer, marketplace)
- **Audit Logging**: Immutable append-only transaction log
- **Rate Limiting**: Built-in protection against abuse

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (lightweight) / PostgreSQL (production)
- **Blockchain**: Cardano (Blockfrost API)
- **Private Contracts**: Midnight SDK (mocked for hackathon)
- **Cryptography**: SHA256 commitments, Ed25519 signatures

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Blockfrost API key (testnet)
- Organizer signing key

### Installation

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file in the backend directory:

```env
# Organizer Configuration
ORGANIZER_PUBKEY_HASH=00000000000000000000000000000000000000000000000000000000
ORGANIZER_SIGNING_KEY_PATH=/path/to/organizer/signing.key

# Blockfrost Configuration
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
CARDANO_NETWORK=testnet

# Midnight Configuration (mock mode for hackathon)
MIDNIGHT_API_URL=http://localhost:8080
MIDNIGHT_API_KEY=your_midnight_api_key
MIDNIGHT_MOCK=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Database Configuration
DB_URL=sqlite:./tickets.db

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Running the Server

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

### Running the Demo

```bash
npm run demo
```

This will:
1. Mint a ticket (organizer)
2. Request resale approval (buyer)
3. Transfer ticket to new owner
4. Retrieve ticket details
5. Cancel a ticket (organizer)

## API Endpoints

### Authentication

All endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

Generate tokens for testing:

```bash
# Organizer token
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "org-001", "role": "organizer"}'

# Buyer token
curl -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "buyer-001", "role": "buyer"}'
```

### 1. Mint Ticket

**Endpoint**: `POST /api/tickets/mint`

**Auth**: Organizer only

**Request**:
```json
{
  "ticketId": "ticket-001",
  "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
  "metadata": {
    "title": "Concert 2024 - VIP Pass",
    "seat": "A1",
    "image": "ipfs://QmTicketImage"
  }
}
```

**Response**:
```json
{
  "success": true,
  "txHash": "abc123...",
  "policyId": "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
  "tokenName": "TICKET#ticket-001",
  "commitmentHash": "def456...",
  "ticket": {
    "id": "uuid",
    "ticketId": "ticket-001",
    "status": "active",
    "metadata": {...}
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" \
  -d '{
    "ticketId": "ticket-001",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "metadata": {
      "title": "Concert 2024 - VIP Pass",
      "seat": "A1"
    }
  }'
```

### 2. Request Resale

**Endpoint**: `POST /api/tickets/request-resale`

**Auth**: Buyer or marketplace

**Request**:
```json
{
  "ticketId": "ticket-001",
  "buyerProof": {
    "type": "ownership_proof",
    "ticketId": "ticket-001",
    "signature": "ed25519_signature_hex",
    "timestamp": 1699999999
  }
}
```

**Response**:
```json
{
  "success": true,
  "approved": true
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/tickets/request-resale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <BUYER_TOKEN>" \
  -d '{
    "ticketId": "ticket-001",
    "buyerProof": {
      "type": "ownership_proof",
      "ticketId": "ticket-001",
      "signature": "mock-signature",
      "timestamp": 1699999999
    }
  }'
```

### 3. Transfer Ticket

**Endpoint**: `POST /api/tickets/transfer`

**Auth**: Buyer or marketplace

**Request**:
```json
{
  "ticketId": "ticket-001",
  "newBuyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
  "transferProof": {
    "type": "transfer_proof",
    "ticketId": "ticket-001",
    "newOwnerCommitment": "sha256_hash",
    "signature": "ed25519_signature_hex",
    "timestamp": 1699999999
  }
}
```

**Response**:
```json
{
  "success": true,
  "transferCommitment": "xyz789...",
  "approval": {
    "id": "uuid",
    "ticketId": "ticket-001",
    "status": "pending"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/tickets/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <MARKETPLACE_TOKEN>" \
  -d '{
    "ticketId": "ticket-001",
    "newBuyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "transferProof": {
      "type": "transfer_proof",
      "ticketId": "ticket-001",
      "newOwnerCommitment": "new-commitment-hash",
      "signature": "mock-signature",
      "timestamp": 1699999999
    }
  }'
```

### 4. Cancel Ticket

**Endpoint**: `POST /api/tickets/cancel`

**Auth**: Organizer only

**Request**:
```json
{
  "ticketId": "ticket-001"
}
```

**Response**:
```json
{
  "success": true,
  "burnTxHash": "ghi012..."
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" \
  -d '{"ticketId": "ticket-001"}'
```

### 5. Get Ticket Details

**Endpoint**: `GET /api/tickets/:ticketId`

**Auth**: Any authenticated user

**Response**:
```json
{
  "id": "uuid",
  "ticketId": "ticket-001",
  "tokenName": "TICKET#ticket-001",
  "policyId": "a1234567890abcdef...",
  "commitmentHash": "abc123...",
  "ownerCommitment": "def456...",
  "buyerPubKey": "addr_test1vqxdact...",
  "status": "active",
  "metadata": {
    "title": "Concert 2024 - VIP Pass",
    "seat": "A1"
  },
  "txHash": "ghi012...",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:3001/api/tickets/ticket-001 \
  -H "Authorization: Bearer <TOKEN>"
```

## Architecture

### Database Schema

**tickets table**:
- `id`: UUID primary key
- `ticketId`: Unique ticket identifier
- `tokenName`: Cardano token name (TICKET#{ticketId})
- `policyId`: Cardano minting policy ID
- `commitmentHash`: SHA256 commitment for on-chain metadata
- `ownerCommitment`: SHA256(buyerPubKey || salt)
- `buyerPubKey`: Initial buyer's public key
- `status`: active | canceled | transferred
- `metadata`: JSON metadata (title, seat, etc.)
- `txHash`: Mint transaction hash
- `burnTxHash`: Burn transaction hash (if canceled)
- `createdAt`, `updatedAt`: Timestamps

**audit_logs table**:
- `id`: UUID primary key
- `operation`: MINT | CANCEL | REQUEST_RESALE | TRANSFER
- `ticketId`: Reference to ticket
- `requestorId`: User who performed operation
- `details`: JSON operation details
- `timestamp`: ISO timestamp

**transfer_approvals table**:
- `id`: UUID primary key
- `ticketId`: Reference to ticket
- `transferCommitment`: Midnight transfer commitment
- `newOwnerCommitment`: New owner's commitment
- `status`: pending | approved | completed
- `createdAt`, `expiresAt`: Timestamps

### Flow Diagrams

#### Mint Flow
```
Organizer → POST /mint
  ↓
Backend: Create ownerCommitment = sha256(buyerPubKey || salt)
  ↓
Midnight: mintTicket() → commitmentHash
  ↓
Cardano: Build mint tx with CIP-25 metadata
  ↓
Cardano: Sign with organizer key → submit
  ↓
DB: Persist ticket mapping
  ↓
Response: txHash, commitmentHash
```

#### Transfer Flow
```
Buyer → POST /request-resale with buyerProof
  ↓
Midnight: requestResale() → approved
  ↓
DB: Record approval
  ↓
Marketplace → POST /transfer with transferProof
  ↓
Midnight: transferTicket() → transferCommitment
  ↓
DB: Update ticket ownership
  ↓
Response: transferCommitment
```

## Midnight Integration

### Mock Mode (Hackathon)

For the hackathon demo, Midnight calls are mocked:

```typescript
// In src/midnight-client.ts
const midnight = new MidnightClient();
midnight.mockMode = true; // Uses mock implementations
```

Mock implementations:
- `mintTicket()`: Returns deterministic commitmentHash
- `requestResale()`: Validates proof structure, approves
- `transferTicket()`: Validates proof, updates ownership
- `cancelTicket()`: Removes from private state

### Production Integration

To switch to real Midnight SDK:

1. Install Midnight SDK:
```bash
npm install @midnight-ntwrk/midnight-js
```

2. Update `src/midnight-client.ts`:
```typescript
import { MidnightSDK } from '@midnight-ntwrk/midnight-js';

// Replace mock implementations with real SDK calls
async mintTicket(request: MintTicketRequest) {
  const result = await this.midnightSDK.contracts.ticket.mintTicket(request);
  return result;
}
```

3. Implement real ZK proof verification:
```typescript
// Replace mock verifyZKProof with actual circuit verification
async verifyZKProof(proof: Record<string, any>): Promise<boolean> {
  return await this.midnightSDK.verifyProof(proof);
}
```

## Cardano Integration

### Plutus Minting Policy

The minting policy (`plutus/TicketMintPolicy.hs`) enforces:
- Only organizer (identified by PubKeyHash) can mint
- Only organizer can burn (cancel)
- Requires organizer signature on all mint/burn transactions

**Compile the policy**:
```bash
cd plutus
cabal build
```

**Get policy ID**:
```bash
cardano-cli transaction policyid --script-file TicketMintPolicy.plutus
```

### On-Chain Metadata

CIP-25 NFT metadata format:

```json
{
  "721": {
    "a1234567890abcdef...": {
      "TICKET#ticket-001": {
        "name": "Concert 2024 - VIP Pass",
        "description": "Event ticket with commitment abc123...",
        "image": "ipfs://QmTicketImage",
        "commitment": "abc123def456...",
        "ticketId": "ticket-001",
        "seat": "A1"
      }
    }
  }
}
```

### Blockfrost Integration

The backend uses Blockfrost API for:
- Transaction submission
- Transaction status queries
- UTXO queries

**Get Blockfrost API key**:
1. Visit https://blockfrost.io
2. Create account
3. Create project for testnet
4. Copy project ID to `.env`

## Security Considerations

### Private Keys

**DO NOT** hardcode organizer signing keys in the repository:

```bash
# ❌ WRONG
ORGANIZER_SIGNING_KEY=ed25519_key_hex

# ✅ CORRECT
ORGANIZER_SIGNING_KEY_PATH=/secure/path/to/signing.key
```

Load from environment at runtime:
```typescript
const signingKey = fs.readFileSync(process.env.ORGANIZER_SIGNING_KEY_PATH!, 'utf-8');
```

### JWT Secret

Change `JWT_SECRET` in production:

```bash
# Generate strong secret
openssl rand -base64 32
```

### Database

For production, use PostgreSQL with SSL:

```env
DB_URL=postgresql://user:password@host:5432/tickets?sslmode=require
```

### Rate Limiting

Adjust rate limits based on expected traffic:

```typescript
// In src/index.ts
app.use(rateLimit(60000, 100)); // 100 requests per minute
```

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:watch
```

### Manual Testing with cURL

See API Endpoints section above for cURL examples.

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]
```

Build and run:
```bash
docker build -t noscalp-backend .
docker run -p 3001:3001 --env-file .env noscalp-backend
```

### Environment Variables for CI/CD

```yaml
# GitHub Actions example
env:
  ORGANIZER_PUBKEY_HASH: ${{ secrets.ORGANIZER_PUBKEY_HASH }}
  ORGANIZER_SIGNING_KEY_PATH: /tmp/organizer.key
  BLOCKFROST_PROJECT_ID: ${{ secrets.BLOCKFROST_PROJECT_ID }}
  JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Troubleshooting

### Database Lock

If you see "database is locked" errors:
```bash
rm tickets.db
npm run dev
```

### Midnight Connection Error

If Midnight SDK is unavailable:
```env
MIDNIGHT_MOCK=true
```

### Blockfrost Rate Limit

Increase cache or implement request queuing:
```typescript
// Add caching layer
const cache = new Map<string, any>();
```

## File Structure

```
backend/
├── src/
│   ├── index.ts                 # Express server entry point
│   ├── db.ts                    # Database layer
│   ├── midnight-client.ts       # Midnight SDK wrapper
│   ├── cardano-tx.ts            # Cardano transaction builder
│   ├── middleware/
│   │   └── auth.ts              # JWT and role-based auth
│   ├── routes/
│   │   └── tickets.ts           # Ticket endpoints
│   └── utils/
│       └── crypto.ts            # Cryptographic utilities
├── midnight/
│   ├── TicketContract.ts        # Midnight contract (mock)
│   └── README.md                # Midnight integration guide
├── plutus/
│   ├── TicketMintPolicy.hs      # Plutus V2 minting policy
│   └── README.md                # Plutus compilation guide
├── scripts/
│   └── demo.ts                  # Demo workflow script
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API examples
3. Check Midnight and Cardano documentation
4. Open an issue in the repository
