"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDatabase = getDatabase;
exports.createTicket = createTicket;
exports.getTicket = getTicket;
exports.updateTicketStatus = updateTicketStatus;
exports.createAuditLog = createAuditLog;
exports.createTransferApproval = createTransferApproval;
exports.getTransferApproval = getTransferApproval;
exports.updateTransferApprovalStatus = updateTransferApprovalStatus;
exports.closeDatabase = closeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const uuid_1 = require("uuid");
let db;
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = process.env.DB_URL?.replace('sqlite:', '') || './tickets.db';
        db = new sqlite3_1.default.Database(dbPath, (err) => {
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
function createTables() {
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
function getDatabase() {
    return db;
}
function createTicket(ticketId, tokenName, policyId, commitmentHash, ownerCommitment, buyerPubKey, metadata, txHash) {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const ticket = {
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
        db.run(`INSERT INTO tickets (id, ticketId, tokenName, policyId, commitmentHash, ownerCommitment, buyerPubKey, status, metadata, txHash, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
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
        ], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(ticket);
            }
        });
    });
}
function getTicket(ticketId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM tickets WHERE ticketId = ?', [ticketId], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row) {
                resolve({
                    ...row,
                    metadata: JSON.parse(row.metadata),
                });
            }
            else {
                resolve(null);
            }
        });
    });
}
function updateTicketStatus(ticketId, status, burnTxHash) {
    return new Promise((resolve, reject) => {
        const now = new Date().toISOString();
        db.run('UPDATE tickets SET status = ?, updatedAt = ?, burnTxHash = ? WHERE ticketId = ?', [status, now, burnTxHash || null, ticketId], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
function createAuditLog(operation, ticketId, requestorId, details) {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const timestamp = new Date().toISOString();
        const log = {
            id,
            operation,
            ticketId,
            requestorId,
            details,
            timestamp,
        };
        db.run(`INSERT INTO audit_logs (id, operation, ticketId, requestorId, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, operation, ticketId, requestorId, JSON.stringify(details), timestamp], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(log);
            }
        });
    });
}
function createTransferApproval(ticketId, transferCommitment, newOwnerCommitment) {
    return new Promise((resolve, reject) => {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
        const approval = {
            id,
            ticketId,
            transferCommitment,
            newOwnerCommitment,
            status: 'pending',
            createdAt: now,
            expiresAt,
        };
        db.run(`INSERT INTO transfer_approvals (id, ticketId, transferCommitment, newOwnerCommitment, status, createdAt, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, ticketId, transferCommitment, newOwnerCommitment, 'pending', now, expiresAt], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(approval);
            }
        });
    });
}
function getTransferApproval(ticketId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM transfer_approvals WHERE ticketId = ? AND status = ?', [ticketId, 'approved'], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row) {
                resolve(row);
            }
            else {
                resolve(null);
            }
        });
    });
}
function updateTransferApprovalStatus(ticketId, status) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE transfer_approvals SET status = ? WHERE ticketId = ?', [status, ticketId], (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
function closeDatabase() {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
}
//# sourceMappingURL=db.js.map