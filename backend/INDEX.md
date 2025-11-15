# Backend Documentation Index

Complete guide to all backend documentation and code.

## 📖 Documentation Files

### Getting Started
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
  - Installation steps
  - Configuration template
  - First test requests
  - Common tasks

- **[README.md](README.md)** - Complete documentation
  - Full setup instructions
  - API endpoint reference
  - Configuration guide
  - Deployment instructions
  - Troubleshooting

### API Reference
- **[CURL_EXAMPLES.md](CURL_EXAMPLES.md)** - API endpoint examples
  - cURL examples for all 5 endpoints
  - Error cases
  - Postman collection
  - Workflow test script
  - Rate limiting examples

### Architecture & Design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design
  - Component architecture
  - Data flow diagrams
  - Security model
  - Performance considerations
  - Deployment architecture

### Project Information
- **[PROJECT_DELIVERY.md](PROJECT_DELIVERY.md)** - Delivery summary
  - Deliverables checklist
  - Feature summary
  - Technology stack
  - Acceptance criteria

- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details
  - File structure
  - Configuration reference
  - Testing guide
  - Known limitations
  - Next steps

### Integration Guides
- **[midnight/README.md](midnight/README.md)** - Midnight integration
  - Contract functions
  - Proof formats
  - Private state
  - Real SDK integration
  - Testing examples

- **[plutus/README.md](plutus/README.md)** - Plutus policy guide
  - Policy details
  - Compilation instructions
  - Usage examples
  - Security considerations
  - Troubleshooting

---

## 📁 Source Code Structure

### Core Server
```
src/
├── index.ts                    # Express server entry point
│   ├─ Middleware setup
│   ├─ Route registration
│   └─ Graceful shutdown
```

### Database Layer
```
src/db.ts                       # SQLite database
├─ initializeDatabase()         # Schema creation
├─ createTicket()               # Insert ticket
├─ getTicket()                  # Query ticket
├─ updateTicketStatus()         # Update status
├─ createAuditLog()             # Log operation
└─ createTransferApproval()     # Record approval
```

### Blockchain Integration
```
src/midnight-client.ts          # Midnight wrapper
├─ mintTicket()                 # Record in private contract
├─ requestResale()              # Approve resale
├─ transferTicket()             # Update ownership
├─ cancelTicket()               # Remove from circulation
└─ verifyZKProof()              # Verify proof

src/cardano-tx.ts               # Cardano builder
├─ buildAndSubmitMintTx()       # Create mint transaction
├─ buildAndSubmitBurnTx()       # Create burn transaction
├─ getTransactionStatus()       # Query status
├─ generateNFTMetadata()        # CIP-25 metadata
└─ generateCancelMetadata()     # Cancel metadata
```

### Authentication & Security
```
src/middleware/auth.ts          # Authentication
├─ generateToken()              # Create JWT
├─ verifyToken()                # Validate JWT
├─ requireAuth()                # Auth middleware
├─ requireOrganizerRole()       # Role check
├─ rateLimit()                  # Rate limiting
└─ requestLogger()              # Request logging
```

### API Routes
```
src/routes/tickets.ts           # Ticket endpoints
├─ POST /api/tickets/mint       # Mint ticket
├─ POST /api/tickets/cancel     # Cancel ticket
├─ POST /api/tickets/request-resale  # Request resale
├─ POST /api/tickets/transfer   # Transfer ticket
└─ GET /api/tickets/:ticketId   # Get ticket
```

### Utilities
```
src/utils/crypto.ts             # Cryptographic utilities
├─ sha256()                     # Hash function
├─ generateSalt()               # Random salt
├─ createOwnerCommitment()      # Buyer commitment
├─ createCommitmentHash()       # On-chain commitment
├─ createMetadataHash()         # Metadata hash
└─ verifyCommitment()           # Verify commitment
```

### Midnight Contract
```
midnight/TicketContract.ts      # Private contract (mock)
├─ mintTicket()                 # Mint in private state
├─ requestResale()              # Approve resale
├─ transferTicket()             # Transfer ownership
├─ cancelTicket()               # Cancel ticket
└─ verifyZKProof()              # Verify proof
```

### Plutus Policy
```
plutus/TicketMintPolicy.hs      # Minting policy
├─ ticketMintPolicy()           # Organizer-only enforcement
└─ Compilation & deployment
```

### Demo & Scripts
```
scripts/demo.ts                 # Complete workflow demo
├─ Mint ticket
├─ Request resale
├─ Transfer ticket
├─ Get details
└─ Cancel ticket
```

---

## 🚀 Quick Navigation

### I want to...

**Get started quickly**
→ Read [QUICKSTART.md](QUICKSTART.md)

**Understand the API**
→ See [CURL_EXAMPLES.md](CURL_EXAMPLES.md)

**Learn the architecture**
→ Read [ARCHITECTURE.md](ARCHITECTURE.md)

**Integrate Midnight**
→ See [midnight/README.md](midnight/README.md)

**Deploy Plutus policy**
→ See [plutus/README.md](plutus/README.md)

**See all deliverables**
→ Read [PROJECT_DELIVERY.md](PROJECT_DELIVERY.md)

**Understand implementation**
→ Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 📋 API Endpoints Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/tickets/mint | Organizer | Mint new ticket |
| POST | /api/tickets/cancel | Organizer | Cancel ticket |
| POST | /api/tickets/request-resale | Buyer | Request resale |
| POST | /api/tickets/transfer | Buyer | Transfer ticket |
| GET | /api/tickets/:id | Any | Get ticket |

See [CURL_EXAMPLES.md](CURL_EXAMPLES.md) for complete examples.

---

## 🔧 Configuration

### Environment Variables
```env
# Organizer
ORGANIZER_PUBKEY_HASH=<hash>
ORGANIZER_SIGNING_KEY_PATH=/path/to/key

# Blockfrost
BLOCKFROST_PROJECT_ID=<project_id>
CARDANO_NETWORK=testnet

# Midnight
MIDNIGHT_API_URL=http://localhost:8080
MIDNIGHT_API_KEY=<api_key>
MIDNIGHT_MOCK=true

# JWT
JWT_SECRET=<secret>

# Database
DB_URL=sqlite:./tickets.db

# Server
PORT=3001
NODE_ENV=development
```

See [README.md](README.md) for complete configuration guide.

---

## 🧪 Testing

### Run Demo
```bash
npm run demo
```

### Test Endpoints
See [CURL_EXAMPLES.md](CURL_EXAMPLES.md) for examples:
```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Unit Tests
```bash
npm test
```

---

## 📚 Documentation by Topic

### Setup & Deployment
- [QUICKSTART.md](QUICKSTART.md) - Quick setup
- [README.md](README.md) - Full setup guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Deployment architecture

### API Usage
- [CURL_EXAMPLES.md](CURL_EXAMPLES.md) - API examples
- [README.md](README.md) - Endpoint documentation

### Integration
- [midnight/README.md](midnight/README.md) - Midnight integration
- [plutus/README.md](plutus/README.md) - Plutus integration
- [ARCHITECTURE.md](ARCHITECTURE.md) - Integration points

### Project Information
- [PROJECT_DELIVERY.md](PROJECT_DELIVERY.md) - Deliverables
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details

---

## 🔐 Security

### Key Management
- Never commit keys to repository
- Load from environment variables
- Use secure file permissions

### JWT Security
- 24-hour token expiry
- Strong secret required
- Role-based authorization

### Rate Limiting
- 100 requests per minute per IP
- Prevents abuse and DDoS

See [README.md](README.md) for complete security guide.

---

## 🎯 Development Workflow

### 1. Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Endpoints
```bash
# See CURL_EXAMPLES.md for examples
curl http://localhost:3001/health
```

### 4. Run Demo
```bash
npm run demo
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📞 Support

### Documentation
- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Full Guide**: [README.md](README.md)
- **API Examples**: [CURL_EXAMPLES.md](CURL_EXAMPLES.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

### Integration
- **Midnight**: [midnight/README.md](midnight/README.md)
- **Plutus**: [plutus/README.md](plutus/README.md)

### Code
- Inline documentation in source files
- TODO markers for production integration
- Mock implementations clearly marked

---

## 📄 File Manifest

```
backend/
├── Documentation/
│   ├── INDEX.md                          ← You are here
│   ├── QUICKSTART.md                     ← Start here
│   ├── README.md                         ← Complete guide
│   ├── CURL_EXAMPLES.md                  ← API examples
│   ├── ARCHITECTURE.md                   ← System design
│   ├── PROJECT_DELIVERY.md               ← Deliverables
│   └── IMPLEMENTATION_SUMMARY.md         ← Implementation
│
├── Source Code/
│   ├── src/
│   │   ├── index.ts                      ← Server entry
│   │   ├── db.ts                         ← Database
│   │   ├── midnight-client.ts            ← Midnight wrapper
│   │   ├── cardano-tx.ts                 ← Cardano builder
│   │   ├── middleware/auth.ts            ← Authentication
│   │   ├── routes/tickets.ts             ← API routes
│   │   └── utils/crypto.ts               ← Utilities
│   │
│   ├── midnight/
│   │   ├── TicketContract.ts             ← Private contract
│   │   └── README.md                     ← Integration guide
│   │
│   ├── plutus/
│   │   ├── TicketMintPolicy.hs           ← Minting policy
│   │   └── README.md                     ← Policy guide
│   │
│   └── scripts/
│       └── demo.ts                       ← Demo workflow
│
└── Configuration/
    ├── package.json                      ← Dependencies
    ├── tsconfig.json                     ← TypeScript config
    └── env.example                       ← Environment template
```

---

## ✅ Checklist for Getting Started

- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Run `npm install`
- [ ] Create `.env` file from `env.example`
- [ ] Run `npm run dev`
- [ ] Test with `curl http://localhost:3001/health`
- [ ] Run `npm run demo`
- [ ] Read [CURL_EXAMPLES.md](CURL_EXAMPLES.md) for API usage
- [ ] Review [ARCHITECTURE.md](ARCHITECTURE.md) for design
- [ ] Check [midnight/README.md](midnight/README.md) for Midnight integration
- [ ] Check [plutus/README.md](plutus/README.md) for Plutus policy

---

**Status**: ✅ Complete and Ready
**Version**: 1.0.0
**Last Updated**: January 2024

🚀 **Start with [QUICKSTART.md](QUICKSTART.md)**
