import { generateKeyPairSync, randomBytes } from 'node:crypto';

console.log('Generating RSA-4096 key pair (this may take a few seconds)...\n');

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');
const fieldEncryptionKey = randomBytes(32).toString('hex');
const fieldHmacKey = randomBytes(32).toString('hex');

console.log('# ─── Copy the lines below into your .env file ───────────────────\n');
console.log(`JWT_PRIVATE_KEY_BASE64=${privateKeyBase64}`);
console.log(`JWT_PUBLIC_KEY_BASE64=${publicKeyBase64}`);
console.log(`FIELD_ENCRYPTION_KEY=${fieldEncryptionKey}`);
console.log(`FIELD_HMAC_KEY=${fieldHmacKey}`);
console.log('\n# ─────────────────────────────────────────────────────────────────');
console.log('# Keep the private key secret. Never commit .env to version control.');
