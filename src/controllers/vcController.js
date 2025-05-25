const pool = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

const createCredential = async (req, res) => {
  const { type, user_id, issuer_id, event_id, details } = req.body;

  if (!type || !user_id || !details) {
    throw new ApiError(400, 'type, user_id, and details are required fields');
  }

  // Validate credential type
  const validTypes = ['UniversityDegree', 'VendorPermit'];
  if (!validTypes.includes(type)) {
    throw new ApiError(400, `Invalid credential type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate that details contains the type as main attribute
  if (!details[type]) {
    throw new ApiError(400, `details must contain ${type} as the main attribute`);
  }

  const connection = await pool.getConnection();
  try {
    // If event_id is provided, verify it exists
    if (event_id) {
      const [events] = await connection.execute(
        'SELECT id FROM Event WHERE id = ?',
        [event_id]
      );
      if (!events.length) {
        throw new ApiError(404, 'Specified event_id not found');
      }
    }

    await connection.beginTransaction();

    // Insert into Credential table with issuer_id and event_id as NULL if not provided
    const [credResult] = await connection.execute(
      'INSERT INTO Credential (type, user_id, issuer_id, event_id, issuance_date) VALUES (?, ?, ?, ?, NOW())',
      [type, user_id, issuer_id || null, event_id || null]
    );
    const credentialId = credResult.insertId;

    // Handle type-specific details
    if (type === 'UniversityDegree') {
      const degree = details.UniversityDegree;
      await connection.execute(
        `INSERT INTO UniversityDegree (
          credential_id, degree, university, graduation_year, gpa,
          verified_by, verification_date, verification_method, verification_id
        ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          credentialId,
          degree.degree,
          degree.university,
          degree.graduation_year,
          degree.gpa,
          degree.verified_by,
          degree.verification_method,
          degree.verification_id
        ]
      );
    } 
    else if (type === 'VendorPermit') {
      const permit = details.VendorPermit;
      let permitImage = null;
      
      // Handle base64 image if provided
      if (permit.permit_image) {
        // Remove data:image/xyz;base64, prefix if present
        const base64Data = permit.permit_image.replace(/^data:image\/\w+;base64,/, '');
        permitImage = Buffer.from(base64Data, 'base64');
      }

      await connection.execute(
        `INSERT INTO VendorPermit (
          credential_id, permit_image, image_updated_at
        ) VALUES (?, ?, NOW())`,
        [credentialId, permitImage]
      );
    }

    await connection.commit();

    // Return the created credential
    const [credential] = await connection.execute(
      'SELECT c.*, e.name as event_name FROM Credential c LEFT JOIN Event e ON c.event_id = e.id WHERE c.id = ?',
      [credentialId]
    );

    // Get type-specific details
    let typeSpecificDetails = {};
    if (type === 'UniversityDegree') {
      const [degreeDetails] = await connection.execute(
        'SELECT * FROM UniversityDegree WHERE credential_id = ?',
        [credentialId]
      );
      typeSpecificDetails = { UniversityDegree: degreeDetails[0] };
    } 
    else if (type === 'VendorPermit') {
      const [permitDetails] = await connection.execute(
        'SELECT id, credential_id, image_updated_at FROM VendorPermit WHERE credential_id = ?',
        [credentialId]
      );
      typeSpecificDetails = { 
        VendorPermit: {
          ...permitDetails[0],
          permit_image: null // Don't send image in response
        }
      };
    }

    res.status(201).json({
      status: 'success',
      data: {
        credential: credential[0],
        details: typeSpecificDetails
      }
    });

  } catch (error) {
    await connection.rollback();
    throw new ApiError(500, `Error creating credential: ${error.message}`);
  } finally {
    connection.release();
  }
};

const getCredentialImage = async (req, res) => {
  const { id } = req.params;

  try {
    const [permit] = await pool.execute(
      'SELECT vp.permit_image, c.type FROM VendorPermit vp JOIN Credential c ON c.id = vp.credential_id WHERE vp.credential_id = ?',
      [id]
    );

    if (!permit || !permit.length || !permit[0].permit_image) {
      throw new ApiError(404, 'Image not found');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(permit[0].permit_image);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Error retrieving image: ${error.message}`);
  }
};

module.exports = {
  createCredential,
  getCredentialImage
}; 