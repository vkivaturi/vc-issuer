const pool = require('../config/database');

async function checkCredentialAvailability(userId, credentialType) {
  const [rows] = await pool.execute(
    `SELECT id FROM Credential 
      WHERE user_id = ? 
      AND type = ? 
      `,
    [userId, credentialType]
  );
  return rows.length > 0;
}

async function getCredentialDetails(userId) {
  const [rows] = await pool.execute(
    `SELECT 
      c.id,
      c.type,
      c.user_id,
      c.issuer_id,
      c.issuance_date,
      c.expiration_date,
      vp.permit_image,
      vp.image_updated_at
    FROM Credential c
    LEFT JOIN VendorPermit vp ON c.id = vp.credential_id
    WHERE c.user_id = ? 
    LIMIT 1`,
    [userId]
  );
  
  if (rows.length === 0) {
    return null;
  }

  const credential = rows[0];
  const response = {
    id: credential.id,
    type: credential.type,
    userId: credential.user_id,
    issuerId: credential.issuer_id,
    issuanceDate: credential.issuance_date,
    expirationDate: credential.expiration_date
  };

  // Add VendorPermit specific data if available
  if (credential.type === 'VendorPermit' && credential.permit_image) {
    response.permitImage = credential.permit_image;
    response.imageUpdatedAt = credential.image_updated_at;
  }

  return response;
}

module.exports = {
  checkCredentialAvailability,
  getCredentialDetails
}; 