# Quick Start Guide

Get the Event Ticketing dApp backend running in 5 minutes.

## Prerequisites

- Node.js 18+
- npm or pnpm

## Installation

```bash
cd backend
npm install
```

## Configuration

Create `.env` file:

```bash
cat > .env << 'EOF'
# Organizer
ORGANIZER_PUBKEY_HASH=00000000000000000000000000000000000000000000000000000000
ORGANIZER_SIGNING_KEY_PATH=/path/to/organizer.key

# Blockfrost (testnet)
BLOCKFROST_PROJECT_ID=testnetXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CARDANO_NETWORK=testnet

# Midnight (mock mode for demo)
MIDNIGHT_API_URL=http://localhost:8080
MIDNIGHT_API_KEY=demo-key
MIDNIGHT_MOCK=true

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Database
DB_URL=sqlite:./tickets.db

# Server
PORT=3001
NODE_ENV=development
EOF
```

## Start Server

```bash
npm run dev
```

You should see:
```
Database initialized
Server running on http://localhost:3001
Environment: development
```

## Test It

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Generate Token

```bash
# For organizer
ORGANIZER_TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({id: 'org-001', role: 'organizer'}, 'your-super-secret-key-change-in-production', {expiresIn: '24h'});
console.log(token);
")

echo $ORGANIZER_TOKEN
```

### Mint a Ticket

```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "demo-ticket-001",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "metadata": {
      "title": "Demo Concert",
      "seat": "A1"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "txHash": "abc123...",
  "policyId": "a1234567...",
  "tokenName": "TICKET#demo-ticket-001",
  "commitmentHash": "def456..."
}
```

## Run Demo

Complete workflow demo:

```bash
npm run demo
```

This will:
1. ✅ Mint a ticket
2. ✅ Request resale approval
3. ✅ Transfer ticket
4. ✅ Get ticket details
5. ✅ Cancel a ticket

## Next Steps

### Full Documentation

- **Setup**: See `README.md`
- **API Examples**: See `CURL_EXAMPLES.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Midnight Integration**: See `midnight/README.md`
- **Plutus Policy**: See `plutus/README.md`

### Common Tasks

**Get ticket details**:
```bash
curl http://localhost:3001/api/tickets/demo-ticket-001 \
  -H "Authorization: Bearer $ORGANIZER_TOKEN"
```

**Cancel ticket**:
```bash
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{"ticketId": "demo-ticket-001"}'
```

**Generate buyer token**:
```bash
BUYER_TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({id: 'buyer-001', role: 'buyer'}, 'your-super-secret-key-change-in-production', {expiresIn: '24h'});
console.log(token);
")
```

## Troubleshooting

### "Cannot find module 'sqlite3'"

```bash
npm install
```

### "EADDRINUSE: address already in use :::3001"

Port 3001 is in use. Either:
- Kill the process: `lsof -ti:3001 | xargs kill -9`
- Use different port: `PORT=3002 npm run dev`

### "Database is locked"

```bash
rm tickets.db
npm run dev
```

### "Invalid token"

Ensure JWT_SECRET matches in `.env`:
```bash
JWT_SECRET=your-super-secret-key-change-in-production
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| NODE_ENV | development | Environment |
| JWT_SECRET | (required) | JWT signing key |
| DB_URL | sqlite:./tickets.db | Database URL |
| MIDNIGHT_MOCK | true | Use mock Midnight |
| CARDANO_NETWORK | testnet | Cardano network |
| BLOCKFROST_PROJECT_ID | (optional) | Blockfrost API key |

## File Structure

```
backend/
├── src/
│   ├── index.ts              # Server
│   ├── db.ts                 # Database
│   ├── midnight-client.ts    # Midnight wrapper
│   ├── cardano-tx.ts         # Cardano builder
│   ├── middleware/auth.ts    # Authentication
│   ├── routes/tickets.ts     # API routes
│   └── utils/crypto.ts       # Utilities
├── scripts/demo.ts           # Demo script
├── package.json              # Dependencies
└── README.md                 # Full documentation
```

## API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | /api/tickets/mint | Organizer | Mint ticket |
| POST | /api/tickets/cancel | Organizer | Cancel ticket |
| POST | /api/tickets/request-resale | Buyer | Request resale |
| POST | /api/tickets/transfer | Buyer | Transfer ticket |
| GET | /api/tickets/:id | Any | Get ticket |

## Support

- Full API docs: `CURL_EXAMPLES.md`
- Architecture: `ARCHITECTURE.md`
- Midnight guide: `midnight/README.md`
- Plutus guide: `plutus/README.md`

## What's Next?

1. **Integrate with Frontend**: Connect to Next.js app
2. **Real Midnight SDK**: Replace mock with actual SDK
3. **Deploy Plutus**: Compile and deploy policy
4. **Production Setup**: Use PostgreSQL, enable HTTPS
5. **Monitoring**: Add logging and metrics

---

**Ready to go!** 🚀

Start the server with `npm run dev` and test with the examples above.
