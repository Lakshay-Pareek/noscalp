# API cURL Examples

Complete examples for testing all Event Ticketing dApp endpoints.

## Setup

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run dev
```

Server will run on `http://localhost:3001`

### 2. Generate Test Tokens

```bash
# Organizer token (valid for 24 hours)
ORGANIZER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "org-001", "role": "organizer"}' | jq -r '.token')

# Buyer token
BUYER_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "buyer-001", "role": "buyer"}' | jq -r '.token')

# Marketplace token
MARKETPLACE_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "marketplace-001", "role": "marketplace"}' | jq -r '.token')

# Export for use in examples
export ORGANIZER_TOKEN BUYER_TOKEN MARKETPLACE_TOKEN
```

Or manually set tokens:

```bash
export ORGANIZER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export BUYER_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export MARKETPLACE_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Health Check

```bash
curl -X GET http://localhost:3001/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 1. Mint Ticket

**Endpoint**: `POST /api/tickets/mint`

**Auth**: Organizer only

### Basic Mint

```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "concert-2024-001",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "metadata": {
      "title": "Concert 2024 - VIP Pass",
      "seat": "A1",
      "image": "ipfs://QmVIPTicket"
    }
  }'
```

### Mint with Full Metadata

```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "festival-2024-premium-001",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "metadata": {
      "title": "Summer Festival 2024 - Premium Pass",
      "description": "3-day festival pass with VIP lounge access",
      "seat": "VIP-001",
      "image": "ipfs://QmFestivalImage",
      "eventDate": "2024-06-15",
      "eventLocation": "Central Park"
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "txHash": "abc123def456...",
  "policyId": "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
  "tokenName": "TICKET#concert-2024-001",
  "commitmentHash": "def456ghi789...",
  "ticket": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "ticketId": "concert-2024-001",
    "tokenName": "TICKET#concert-2024-001",
    "policyId": "a1234567890abcdef...",
    "commitmentHash": "def456ghi789...",
    "ownerCommitment": "xyz789abc123...",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "status": "active",
    "metadata": {
      "title": "Concert 2024 - VIP Pass",
      "seat": "A1"
    },
    "txHash": "abc123def456...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error: Missing Authorization

```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "test", "buyerPubKey": "addr", "metadata": {"title": "Test"}}'
```

**Response** (401):
```json
{
  "error": "Missing or invalid authorization header"
}
```

### Error: Insufficient Permissions

```bash
curl -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{"ticketId": "test", "buyerPubKey": "addr", "metadata": {"title": "Test"}}'
```

**Response** (403):
```json
{
  "error": "Organizer role required"
}
```

## 2. Request Resale

**Endpoint**: `POST /api/tickets/request-resale`

**Auth**: Buyer or marketplace

### Request Resale Approval

```bash
curl -X POST http://localhost:3001/api/tickets/request-resale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "ticketId": "concert-2024-001",
    "buyerProof": {
      "type": "ownership_proof",
      "ticketId": "concert-2024-001",
      "signature": "ed25519_signature_hex_here",
      "timestamp": 1699999999
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "approved": true
}
```

### Error: Invalid Proof

```bash
curl -X POST http://localhost:3001/api/tickets/request-resale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "ticketId": "concert-2024-001",
    "buyerProof": {
      "type": "invalid_proof_type"
    }
  }'
```

**Response** (400):
```json
{
  "error": "Failed to request resale",
  "message": "Invalid buyerProof structure"
}
```

## 3. Transfer Ticket

**Endpoint**: `POST /api/tickets/transfer`

**Auth**: Buyer or marketplace

### Transfer to New Owner

```bash
curl -X POST http://localhost:3001/api/tickets/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MARKETPLACE_TOKEN" \
  -d '{
    "ticketId": "concert-2024-001",
    "newBuyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "transferProof": {
      "type": "transfer_proof",
      "ticketId": "concert-2024-001",
      "newOwnerCommitment": "new_owner_commitment_hash",
      "signature": "ed25519_signature_hex_here",
      "timestamp": 1699999999
    }
  }'
```

### Expected Response

```json
{
  "success": true,
  "transferCommitment": "xyz789abc123...",
  "approval": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "ticketId": "concert-2024-001",
    "transferCommitment": "xyz789abc123...",
    "newOwnerCommitment": "new_owner_commitment_hash",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-02T00:00:00.000Z"
  }
}
```

### Error: Not Approved for Resale

```bash
curl -X POST http://localhost:3001/api/tickets/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MARKETPLACE_TOKEN" \
  -d '{
    "ticketId": "concert-2024-002",
    "newBuyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "transferProof": {
      "type": "transfer_proof",
      "ticketId": "concert-2024-002",
      "newOwnerCommitment": "new_commitment",
      "signature": "sig",
      "timestamp": 1699999999
    }
  }'
```

**Response** (400):
```json
{
  "error": "Failed to transfer ticket",
  "message": "Ticket not approved for resale in Midnight"
}
```

## 4. Cancel Ticket

**Endpoint**: `POST /api/tickets/cancel`

**Auth**: Organizer only

### Cancel a Ticket

```bash
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "concert-2024-001"
  }'
```

### Expected Response

```json
{
  "success": true,
  "burnTxHash": "ghi012jkl345..."
}
```

### Error: Ticket Not Found

```bash
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "nonexistent-ticket"
  }'
```

**Response** (404):
```json
{
  "error": "Ticket not found"
}
```

### Error: Already Canceled

```bash
# First cancel
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{"ticketId": "concert-2024-001"}'

# Try to cancel again
curl -X POST http://localhost:3001/api/tickets/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{"ticketId": "concert-2024-001"}'
```

**Response** (400):
```json
{
  "error": "Cannot cancel ticket with status: canceled"
}
```

## 5. Get Ticket Details

**Endpoint**: `GET /api/tickets/:ticketId`

**Auth**: Any authenticated user

### Get Ticket

```bash
curl -X GET http://localhost:3001/api/tickets/concert-2024-001 \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

### Expected Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ticketId": "concert-2024-001",
  "tokenName": "TICKET#concert-2024-001",
  "policyId": "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
  "commitmentHash": "def456ghi789...",
  "ownerCommitment": "xyz789abc123...",
  "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
  "status": "active",
  "metadata": {
    "title": "Concert 2024 - VIP Pass",
    "seat": "A1",
    "image": "ipfs://QmVIPTicket"
  },
  "txHash": "abc123def456...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Error: Ticket Not Found

```bash
curl -X GET http://localhost:3001/api/tickets/nonexistent \
  -H "Authorization: Bearer $BUYER_TOKEN"
```

**Response** (404):
```json
{
  "error": "Ticket not found"
}
```

## Complete Workflow Script

Save as `test-workflow.sh`:

```bash
#!/bin/bash

set -e

API_URL="http://localhost:3001/api"

echo "🎫 Event Ticketing dApp - Complete Workflow Test\n"

# Generate tokens
echo "📝 Generating authentication tokens..."
ORGANIZER_TOKEN=$(curl -s -X POST $API_URL/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "org-001", "role": "organizer"}' | jq -r '.token')

BUYER_TOKEN=$(curl -s -X POST $API_URL/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "buyer-001", "role": "buyer"}' | jq -r '.token')

MARKETPLACE_TOKEN=$(curl -s -X POST $API_URL/auth/token \
  -H "Content-Type: application/json" \
  -d '{"userId": "marketplace-001", "role": "marketplace"}' | jq -r '.token')

echo "✅ Tokens generated\n"

# Step 1: Mint ticket
echo "📝 Step 1: Minting ticket..."
MINT_RESPONSE=$(curl -s -X POST $API_URL/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{
    "ticketId": "test-ticket-'$(date +%s)'",
    "buyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "metadata": {"title": "Test Concert", "seat": "A1"}
  }')

TICKET_ID=$(echo $MINT_RESPONSE | jq -r '.ticket.ticketId')
TX_HASH=$(echo $MINT_RESPONSE | jq -r '.txHash')

echo "✅ Ticket minted: $TICKET_ID"
echo "   TX Hash: $TX_HASH\n"

# Step 2: Request resale
echo "📝 Step 2: Requesting resale approval..."
RESALE_RESPONSE=$(curl -s -X POST $API_URL/tickets/request-resale \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUYER_TOKEN" \
  -d '{
    "ticketId": "'$TICKET_ID'",
    "buyerProof": {
      "type": "ownership_proof",
      "ticketId": "'$TICKET_ID'",
      "signature": "mock-sig",
      "timestamp": '$(date +%s)'
    }
  }')

echo "✅ Resale approved\n"

# Step 3: Transfer ticket
echo "📝 Step 3: Transferring ticket..."
TRANSFER_RESPONSE=$(curl -s -X POST $API_URL/tickets/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MARKETPLACE_TOKEN" \
  -d '{
    "ticketId": "'$TICKET_ID'",
    "newBuyerPubKey": "addr_test1vqxdact944dd20hvc2uq6cjf0qp4eh2rnsmeuwrs6mc0dqqz96uqt",
    "transferProof": {
      "type": "transfer_proof",
      "ticketId": "'$TICKET_ID'",
      "newOwnerCommitment": "new-commitment",
      "signature": "mock-sig",
      "timestamp": '$(date +%s)'
    }
  }')

TRANSFER_COMMITMENT=$(echo $TRANSFER_RESPONSE | jq -r '.transferCommitment')
echo "✅ Ticket transferred"
echo "   Transfer Commitment: $TRANSFER_COMMITMENT\n"

# Step 4: Get ticket details
echo "📝 Step 4: Retrieving ticket details..."
GET_RESPONSE=$(curl -s -X GET $API_URL/tickets/$TICKET_ID \
  -H "Authorization: Bearer $BUYER_TOKEN")

STATUS=$(echo $GET_RESPONSE | jq -r '.status')
echo "✅ Ticket status: $STATUS\n"

echo "🎉 Workflow completed successfully!"
```

Run the workflow:

```bash
chmod +x test-workflow.sh
./test-workflow.sh
```

## Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Event Ticketing dApp",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Mint Ticket",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{organizer_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"ticketId\": \"ticket-001\", \"buyerPubKey\": \"addr_test1...\", \"metadata\": {\"title\": \"Concert\"}}"
        },
        "url": {"raw": "{{base_url}}/api/tickets/mint", "host": ["{{base_url}}"], "path": ["api", "tickets", "mint"]}
      }
    }
  ]
}
```

## Rate Limiting

The API enforces rate limiting: 100 requests per minute per IP.

```bash
# This will fail after 100 requests
for i in {1..150}; do
  curl -s http://localhost:3001/health
done
```

**Response** (429):
```json
{
  "error": "Too many requests"
}
```

## Debugging

### Enable Verbose Output

```bash
curl -v -X POST http://localhost:3001/api/tickets/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ORGANIZER_TOKEN" \
  -d '{...}'
```

### Pretty Print JSON

```bash
curl -s http://localhost:3001/api/tickets/concert-2024-001 \
  -H "Authorization: Bearer $BUYER_TOKEN" | jq '.'
```

### Save Response to File

```bash
curl -s http://localhost:3001/api/tickets/concert-2024-001 \
  -H "Authorization: Bearer $BUYER_TOKEN" > ticket.json
```

### Check Response Headers

```bash
curl -i http://localhost:3001/health
```
