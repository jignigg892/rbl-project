const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-ctr';
const secretKey = process.env.ENCRYPTION_KEY;
if (!secretKey) {
    throw new Error('Server configuration error');
}
const iv = crypto.randomBytes(16);

const encrypt = (val) => {
    if (!val) return val;
    // Handle objects/arrays by stringifying
    const text = typeof val === 'object' ? JSON.stringify(val) : String(val);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {
    if (!hash || !hash.iv || !hash.content) return hash;
    try {
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
        const str = decrypted.toString();
        // Try to parse as JSON if it looks like an object/array
        if (str.startsWith('{') || str.startsWith('[')) {
            try { return JSON.parse(str); } catch (e) { return str; }
        }
        return str;
    } catch (err) {
        // Decryption failed silently
        return null;
    }
};

module.exports = { encrypt, decrypt };
