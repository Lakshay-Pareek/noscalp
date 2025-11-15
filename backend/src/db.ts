import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

let db: sqlite3.Database;

export function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_URL?.replace('sqlite:', '') || './tickets.db';
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err);
          return;
        }

        createTables()
          .then(() => resolve())
          .catch(reject);
      });
    });
  });
}

function createTables(): Promise<void> {
  return new Promise((resolve, reject) => {
    const tables = [
      `
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          ticketId TEXT UNIQUE NOT NULL,
          tokenName TEXT NOT NULL,
          policyId TEXT NOT NULL,
          commitmentHash TEXT NOT NULL,
          ownerCommitment TEXT NOT NULL,
          buyerPubKey TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          metadata TEXT NOT NULL,
          txHash TEXT NOT NULL,
          burnTxHash TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          operation TEXT NOT NULL,
          ticketId TEXT NOT NULL,
          requestorId TEXT NOT NULL,
          details TEXT NOT NULL,
          timestamp TEXT NOT NULL
        )
      `,
      `
        CREATE TABLE IF NOT EXISTS transfer_approvals (
          id TEXT PRIMARY KEY,
          ticketId TEXT NOT NULL UNIQUE,
          transferCommitment TEXT NOT NULL,
          newOwnerCommitment TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          createdAt TEXT NOT NULL,
          expiresAt TEXT NOT NULL,
          FOREIGN KEY (ticketId) REFERENCES tickets(ticketId)
        )
      `,
    ];

    let completed = 0;
    tables.forEach((table) => {
      db.run(table, (err) => {
        if (err) {
          reject(err);
          return;
        }
        completed++;
        if (completed === tables.length) {
          resolve();
        }
      });
    });
  });
}

export function getDatabase(): sqlite3.Database {
  return db;
}

export function createTicket(
  ticketId: string,
  tokenName: string,
  policyId: string,
  commitmentHash: string,
  ownerCommitment: string,
  buyerPubKey: string,
  metadata: Record<string, any>,
  txHash: string
): Promise<Ticket> {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const ticket: Ticket = {
      id,
      ticketId,
      tokenName,
      policyId,
      commitmentHash,
      ownerCommitment,
      buyerPubKey,
      status: 'active',
      metadata,
      txHash,
      createdAt: now,
      updatedAt: now,
    };

    db.run(
      `INSERT INTO tickets (id, ticketId, tokenName, policyId, commitmentHash, ownerCommitment, buyerPubKey, status, metadata, txHash, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ticketId,
        tokenName,
        policyId,
        commitmentHash,
        ownerCommitment,
        buyerPubKey,
        'active',
        JSON.stringify(metadata),
        txHash,
        now,
        now,
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(ticket);
        }
      }
    );
  });
}

export function getTicket(ticketId: string): Promise<Ticket | null> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM tickets WHERE ticketId = ?',
      [ticketId],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve({
            ...row,
            metadata: JSON.parse(row.metadata),
          });
        } else {
          resolve(null);
        }
      }
    );
  });
}

export function updateTicketStatus(
  ticketId: string,
  status: 'active' | 'canceled' | 'transferred',
  burnTxHash?: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const now = new Date().toISOString();
    db.run(
      'UPDATE tickets SET status = ?, updatedAt = ?, burnTxHash = ? WHERE ticketId = ?',
      [status, now, burnTxHash || null, ticketId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export function createAuditLog(
  operation: string,
  ticketId: string,
  requestorId: string,
  details: Record<string, any>
): Promise<AuditLog> {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    const log: AuditLog = {
      id,
      operation,
      ticketId,
      requestorId,
      details,
      timestamp,
    };

    db.run(
      `INSERT INTO audit_logs (id, operation, ticketId, requestorId, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, operation, ticketId, requestorId, JSON.stringify(details), timestamp],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(log);
        }
      }
    );
  });
}

export function createTransferApproval(
  ticketId: string,
  transferCommitment: string,
  newOwnerCommitment: string
): Promise<TransferApproval> {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const approval: TransferApproval = {
      id,
      ticketId,
      transferCommitment,
      newOwnerCommitment,
      status: 'pending',
      createdAt: now,
      expiresAt,
    };

    db.run(
      `INSERT INTO transfer_approvals (id, ticketId, transferCommitment, newOwnerCommitment, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, ticketId, transferCommitment, newOwnerCommitment, 'pending', now, expiresAt],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(approval);
        }
      }
    );
  });
}

export function getTransferApproval(ticketId: string): Promise<TransferApproval | null> {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM transfer_approvals WHERE ticketId = ? AND status = ?',
      [ticketId, 'approved'],
      (err, row: any) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(row);
        } else {
          resolve(null);
        }
      }
    );
  });
}

export function updateTransferApprovalStatus(
  ticketId: string,
  status: 'pending' | 'approved' | 'completed'
): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE transfer_approvals SET status = ? WHERE ticketId = ?',
      [status, ticketId],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

export function closeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
