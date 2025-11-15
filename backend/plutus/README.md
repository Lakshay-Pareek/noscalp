# Plutus Minting Policy for Event Tickets

## Overview

This Plutus V2 minting policy enforces that only the organizer can mint or burn event ticket NFTs on Cardano.

## Policy Details

**File**: `TicketMintPolicy.hs`

**Language**: Haskell (Plutus)

**Cardano Version**: V2

**Enforcement**: 
- Only transactions signed by the organizer's PubKeyHash can mint tickets
- Only transactions signed by the organizer's PubKeyHash can burn tickets
- No other party can create or destroy ticket tokens

## Compilation

### Prerequisites

- GHC 9.2+
- Cabal 3.6+
- Plutus libraries

### Build Steps

```bash
cd plutus

# Update dependencies
cabal update

# Build the project
cabal build

# The compiled script will be in:
# dist-newstyle/build/x86_64-linux/ghc-9.2.x/noscalp-plutus-1.0.0.0/x/ticket-mint-policy/build/ticket-mint-policy/ticket-mint-policy
```

### Export to File

```bash
# Extract the compiled script
cabal exec -- ghc -O2 -o TicketMintPolicy TicketMintPolicy.hs

# Convert to CDDL format for cardano-cli
cardano-cli transaction policyid --script-file TicketMintPolicy.plutus > policy.id
```

## Policy ID

The policy ID is the hash of the compiled Plutus script:

```bash
# Get policy ID
cardano-cli transaction policyid --script-file TicketMintPolicy.plutus

# Example output:
# a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc
```

Store this policy ID in your backend configuration:

```env
CARDANO_POLICY_ID=a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc
```

## Usage

### Minting a Ticket

**Transaction Structure**:
```
Inputs:
  - UTxO with sufficient ADA for fees

Outputs:
  - UTxO with minted token: 1 {POLICY_ID}.TICKET#{ticketId}
  - Metadata: CIP-25 NFT with commitment hash

Mint:
  - 1 {POLICY_ID}.TICKET#{ticketId}

Script:
  - TicketMintPolicy.plutus
  - Redeemer: unit.json (empty)

Signers:
  - Organizer signing key
```

**Example with cardano-cli**:

```bash
# 1. Create redeemer file (empty unit)
echo '{}' > unit.json

# 2. Build the transaction
cardano-cli transaction build \
  --babbage-era \
  --testnet-magic 1 \
  --tx-in <UTXO_IN> \
  --tx-out <ADDRESS>+<LOVELACE>+"1 <POLICY_ID>.TICKET#ticket-001" \
  --mint "1 <POLICY_ID>.TICKET#ticket-001" \
  --minting-script-file TicketMintPolicy.plutus \
  --mint-redeemer-file unit.json \
  --signing-key-file organizer.skey \
  --change-address <CHANGE_ADDRESS> \
  --out-file mint.tx

# 3. Sign the transaction
cardano-cli transaction sign \
  --testnet-magic 1 \
  --tx-body-file mint.tx \
  --signing-key-file organizer.skey \
  --out-file mint.tx.signed

# 4. Submit the transaction
cardano-cli transaction submit \
  --testnet-magic 1 \
  --tx-file mint.tx.signed
```

### Burning a Ticket

**Transaction Structure**:
```
Inputs:
  - UTxO containing the ticket token

Outputs:
  - UTxO with remaining ADA

Mint:
  - -1 {POLICY_ID}.TICKET#{ticketId}

Script:
  - TicketMintPolicy.plutus
  - Redeemer: unit.json

Signers:
  - Organizer signing key
```

**Example with cardano-cli**:

```bash
# 1. Build the burn transaction
cardano-cli transaction build \
  --babbage-era \
  --testnet-magic 1 \
  --tx-in <UTXO_WITH_TICKET> \
  --tx-out <ADDRESS>+<LOVELACE> \
  --mint "-1 <POLICY_ID>.TICKET#ticket-001" \
  --minting-script-file TicketMintPolicy.plutus \
  --mint-redeemer-file unit.json \
  --signing-key-file organizer.skey \
  --change-address <CHANGE_ADDRESS> \
  --out-file burn.tx

# 2. Sign the transaction
cardano-cli transaction sign \
  --testnet-magic 1 \
  --tx-body-file burn.tx \
  --signing-key-file organizer.skey \
  --out-file burn.tx.signed

# 3. Submit the transaction
cardano-cli transaction submit \
  --testnet-magic 1 \
  --tx-file burn.tx.signed
```

## Metadata Format

### CIP-25 NFT Metadata (Mint)

Include this metadata in the transaction:

```json
{
  "721": {
    "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc": {
      "TICKET#ticket-001": {
        "name": "Concert 2024 - VIP Pass",
        "description": "Event ticket with commitment abc123def456...",
        "image": "ipfs://QmTicketImageHash",
        "commitment": "abc123def456...",
        "ticketId": "ticket-001",
        "seat": "A1"
      }
    }
  }
}
```

**Metadata Fields**:
- `name`: Human-readable ticket name
- `description`: Ticket description with commitment preview
- `image`: IPFS link to ticket image
- `commitment`: SHA256 commitment hash (on-chain proof of private state)
- `ticketId`: Unique ticket identifier
- `seat`: (Optional) Seat information

### Cancel Metadata (Burn)

Include this metadata when burning:

```json
{
  "721": {
    "a1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc": {
      "canceled": "cancel_commitment_hash"
    }
  }
}
```

## Testing

### Unit Test Example

```haskell
-- Test that organizer can mint
testOrganizerCanMint :: Assertion
testOrganizerCanMint = do
  let policy = ticketMintPolicy
  let ctx = scriptContextWithSignature organizerPubKeyHash
  ticketMintPolicy () ctx `shouldBe` True

-- Test that non-organizer cannot mint
testNonOrganizerCannotMint :: Assertion
testNonOrganizerCannotMint = do
  let policy = ticketMintPolicy
  let ctx = scriptContextWithSignature otherPubKeyHash
  ticketMintPolicy () ctx `shouldBe` False
```

### Integration Test with Emulator

```bash
# Run tests with plutus-apps emulator
cabal test
```

## Security Considerations

### 1. Organizer Key Management

**DO NOT** expose the organizer signing key:

```bash
# ❌ WRONG: Key in environment
export ORGANIZER_KEY="ed25519_key_hex"

# ✅ CORRECT: Key in secure file
chmod 600 organizer.skey
export ORGANIZER_KEY_PATH=/secure/path/organizer.skey
```

### 2. Policy ID Immutability

Once deployed, the policy ID is immutable. Verify it matches your backend configuration:

```bash
# Get policy ID from compiled script
POLICY_ID=$(cardano-cli transaction policyid --script-file TicketMintPolicy.plutus)

# Verify it matches your backend
grep "CARDANO_POLICY_ID=$POLICY_ID" .env
```

### 3. Redeemer Validation

The policy requires a valid redeemer (even if empty):

```bash
# ❌ WRONG: No redeemer
cardano-cli transaction build ... --mint "1 ..."

# ✅ CORRECT: With redeemer
cardano-cli transaction build ... --mint "1 ..." --mint-redeemer-file unit.json
```

### 4. Signature Verification

Always sign with the organizer key:

```bash
# ❌ WRONG: Signing with wrong key
cardano-cli transaction sign --signing-key-file buyer.skey ...

# ✅ CORRECT: Signing with organizer key
cardano-cli transaction sign --signing-key-file organizer.skey ...
```

## Troubleshooting

### "Script validation failed"

**Cause**: Transaction not signed by organizer

**Solution**: Ensure transaction is signed with organizer.skey:
```bash
cardano-cli transaction sign --signing-key-file organizer.skey ...
```

### "Redeemer not found"

**Cause**: Missing redeemer file

**Solution**: Provide redeemer file:
```bash
echo '{}' > unit.json
cardano-cli transaction build ... --mint-redeemer-file unit.json
```

### "Policy ID mismatch"

**Cause**: Using wrong policy ID

**Solution**: Regenerate policy ID:
```bash
cardano-cli transaction policyid --script-file TicketMintPolicy.plutus
```

### "Insufficient funds"

**Cause**: Not enough ADA for transaction fees

**Solution**: Ensure input UTxO has enough ADA:
```bash
cardano-cli query utxo --address <ADDRESS> --testnet-magic 1
```

## Advanced: Parameterized Policy

For production, parameterize the organizer PubKeyHash:

```haskell
-- Parameterized version
{-# INLINABLE ticketMintPolicyParam #-}
ticketMintPolicyParam :: PubKeyHash -> () -> ScriptContext -> Bool
ticketMintPolicyParam organizerHash () ctx =
  txSignedBy (scriptContextTxInfo ctx) organizerHash

-- Create policy with specific organizer
createTicketPolicy :: PubKeyHash -> MintingPolicy
createTicketPolicy organizerHash = 
  MintingPolicy $ 
    applyCode $$(compile [|| ticketMintPolicyParam ||]) 
      `applyCode` liftCode organizerHash
```

## References

- [Plutus Documentation](https://plutus.readthedocs.io/)
- [Cardano CLI Reference](https://github.com/input-output-hk/cardano-cli)
- [CIP-25: NFT Metadata Label](https://cips.cardano.org/cips/cip25/)
- [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

## Support

For issues with Plutus compilation or policy validation:

1. Check Cardano documentation
2. Verify organizer key is correct
3. Ensure script file is properly compiled
4. Check transaction structure matches examples
