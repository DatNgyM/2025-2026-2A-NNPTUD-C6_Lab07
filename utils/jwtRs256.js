/**
 * JWT RS256 — ký bằng private key, verify bằng public key (asymmetric).
 * File keys/private.pem + keys/public.pem (lab: có thể nộp cả 2; production: chỉ public trên server verify).
 */
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const PRIVATE_PATH = path.join(KEYS_DIR, 'private.pem');
const PUBLIC_PATH = path.join(KEYS_DIR, 'public.pem');

function loadPrivateKey() {
  return fs.readFileSync(PRIVATE_PATH, 'utf8');
}

function loadPublicKey() {
  return fs.readFileSync(PUBLIC_PATH, 'utf8');
}

module.exports = {
  loadPrivateKey,
  loadPublicKey,
  signOptions: { algorithm: 'RS256', expiresIn: '30d' },
  verifyOptions: { algorithms: ['RS256'] }
};
