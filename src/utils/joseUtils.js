const { SignJWT, jwtVerify, importPKCS8, importSPKI } = require('jose');

const importPrivateKey = async (pemKey) => {
  try {
    // Clean up the PEM key - remove any extra spaces and ensure proper line breaks
    const cleanKey = pemKey
      .replace(/\\n/g, '\n')
      .replace(/^['"]|['"]$/g, '')
      .trim();
    
    console.log('Attempting to import private key...');
    return await importPKCS8(cleanKey, 'ES256');
  } catch (error) {
    console.error('Private key import error:', error);
    console.error('Key format received:', pemKey);
    throw new Error(`Failed to import private key: ${error.message}`);
  }
};

const importPublicKey = async (pemKey) => {
  try {
    // Clean up the PEM key - remove any extra spaces and ensure proper line breaks
    const cleanKey = pemKey
      .replace(/\\n/g, '\n')
      .replace(/^['"]|['"]$/g, '')
      .trim();
    
    return await importSPKI(cleanKey, 'ES256');
  } catch (error) {
    throw new Error(`Failed to import public key: ${error.message}`);
  }
};

const createAccessToken = async (payload, privateKeyPem, kid) => {
  try {
    const privateKey = await importPrivateKey(privateKeyPem);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'ES256', kid })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(privateKey);
    return jwt;
  } catch (error) {
    throw new Error(`Failed to create access token: ${error.message}`);
  }
};

const verifyToken = async (token, publicKeyPem) => {
  try {
    const publicKey = await importPublicKey(publicKeyPem);
    const { payload } = await jwtVerify(token, publicKey);
    return payload;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

const signCredential = async (credential, privateKeyPem, kid) => {
  try {
    const privateKey = await importPrivateKey(privateKeyPem);
    const jwt = await new SignJWT(credential)
      .setProtectedHeader({ alg: 'ES256', kid, typ: 'vc+ld+jwt' })
      .setIssuedAt()
      .setExpirationTime('1y')
      .sign(privateKey);
    return jwt;
  } catch (error) {
    throw new Error(`Failed to sign credential: ${error.message}`);
  }
};

module.exports = {
  createAccessToken,
  verifyToken,
  signCredential,
  importPrivateKey,
  importPublicKey
}; 