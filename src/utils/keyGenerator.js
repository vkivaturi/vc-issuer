const { generateKeyPair } = require('crypto');
const fs = require('fs').promises;
const util = require('util');

const generateKeyPairAsync = util.promisify(generateKeyPair);

async function generateKeys() {
  try {
    const { privateKey, publicKey } = await generateKeyPairAsync('ec', {
      namedCurve: 'P-256',
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Create keys directory if it doesn't exist
    await fs.mkdir('keys', { recursive: true });

    // Save keys to files
    await fs.writeFile('keys/private.pem', privateKey);
    await fs.writeFile('keys/public.pem', publicKey);

    console.log('Keys generated successfully!');
    console.log('Public Key:', publicKey);
    console.log('\nAdd these to your .env file:');
    console.log(`ISSUER_PRIVATE_KEY='${privateKey.replace(/\n/g, '\\n')}'`);
    console.log(`ISSUER_KID='did:example:issuer#key-1'`);
    console.log(`ISSUER_DID='did:example:issuer'`);
  } catch (error) {
    console.error('Error generating keys:', error);
  }
}

generateKeys(); 