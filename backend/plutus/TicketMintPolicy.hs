{-# LANGUAGE DataKinds #-}
{-# LANGUAGE FlexibleContexts #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}
{-# LANGUAGE TemplateHaskell #-}
{-# LANGUAGE TypeApplications #-}
{-# LANGUAGE TypeFamilies #-}

module TicketMintPolicy where

import qualified Data.ByteString.Short as SBS
import Ledger
import Ledger.Typed.Scripts qualified as Scripts
import Plutus.Script.Utils.V2.Typed.Scripts qualified as V2
import Plutus.V2.Ledger.Api
import PlutusTx qualified
import PlutusTx.Prelude

{-|
  Ticket Minting Policy for Event Ticketing dApp
  
  Enforces: Only the organizer (identified by their PubKeyHash) can mint or burn tickets.
  
  This is a simple policy that checks if the transaction is signed by the organizer.
  In production, this would be parameterized with the organizer's PubKeyHash.
  
  Usage:
  - Minting: Organizer signs transaction to mint new ticket tokens
  - Burning: Organizer signs transaction to burn (cancel) ticket tokens
  
  Token naming convention: TICKET#{ticketId}
  Metadata: CIP-25 NFT with commitment hash
-}

-- | The organizer's public key hash (this would be parameterized in production)
organizerPubKeyHash :: PubKeyHash
organizerPubKeyHash = PubKeyHash "00000000000000000000000000000000000000000000000000000000"

-- | Minting policy that requires organizer signature
{-# INLINABLE ticketMintPolicy #-}
ticketMintPolicy :: () -> ScriptContext -> Bool
ticketMintPolicy () ctx =
  -- Check if the transaction is signed by the organizer
  txSignedBy (scriptContextTxInfo ctx) organizerPubKeyHash

-- | Wrap the policy for use with Plutus
data TicketMint

instance Scripts.ValidatorTypes TicketMint where
  type instance DatumType TicketMint = ()
  type instance RedeemerType TicketMint = ()

ticketMintPolicyTyped :: V2.MintingPolicy
ticketMintPolicyTyped = V2.mkMintingPolicyScript $$(PlutusTx.compile [|| ticketMintPolicy ||])

-- | Export the script for use in transactions
ticketMintPolicySBS :: SBS.ShortByteString
ticketMintPolicySBS = SBS.toShort . serialiseUPLC $ ticketMintPolicyTyped

{-|
  Example usage and testing:

  To compile this policy:
  $ cabal build

  To get the policy ID:
  $ cardano-cli transaction policyid --script-file TicketMintPolicy.plutus

  To mint a ticket:
  $ cardano-cli transaction build \
      --tx-in <UTXO> \
      --tx-out <ADDRESS>+<LOVELACE>+"1 <POLICY_ID>.TICKET#ticket-001" \
      --mint "1 <POLICY_ID>.TICKET#ticket-001" \
      --minting-script-file TicketMintPolicy.plutus \
      --mint-redeemer-file unit.json \
      --signing-key-file organizer.skey \
      --out-file mint.tx

  To burn a ticket:
  $ cardano-cli transaction build \
      --tx-in <UTXO> \
      --tx-in-collateral <COLLATERAL_UTXO> \
      --tx-out <ADDRESS>+<LOVELACE> \
      --mint "-1 <POLICY_ID>.TICKET#ticket-001" \
      --minting-script-file TicketMintPolicy.plutus \
      --mint-redeemer-file unit.json \
      --signing-key-file organizer.skey \
      --out-file burn.tx
-}
