// In-memory store for credential mappings
const credentialMappings = new Map();

// Sample predefined credentials with verified claims
const predefinedCredentials = [
  {
    type: 'UniversityDegree',
    credentialSubject: {
      id: 'user1',
      degree: 'Computer Science',
      university: 'Example University',
      graduationYear: 2024,
      gpa: 3.8,
      verificationDetails: {
        verifiedBy: 'University Registry',
        verificationDate: '2024-03-21',
        verificationMethod: 'Official Records',
        verificationId: 'VER123456'
      }
    }
  },
  {
    type: 'EmploymentCredential',
    credentialSubject: {
      id: 'user2',
      employer: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01-15',
      department: 'Engineering',
      verificationDetails: {
        verifiedBy: 'HR Department',
        verificationDate: '2024-03-20',
        verificationMethod: 'Employment Records',
        verificationId: 'EMP789012'
      }
    }
  },
  {
    type: 'ResidencyCredential',
    credentialSubject: {
      id: 'user3',
      address: {
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      },
      residencySince: '2019-06-01',
      verificationDetails: {
        verifiedBy: 'City Registry',
        verificationDate: '2024-03-19',
        verificationMethod: 'Property Records',
        verificationId: 'RES345678'
      }
    }
  }
];

// Initialize mappings
predefinedCredentials.forEach(credential => {
  credentialMappings.set(credential.credentialSubject.id, credential);
});

/**
 * Get credential for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Object|null} The credential object if found, null otherwise
 */
const getCredentialForUser = (userId) => {
  const credential = credentialMappings.get(userId);
  if (!credential) return null;

  // Add standard VC properties
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1'
    ],
    type: ['VerifiableCredential', credential.type],
    ...credential
  };
};

/**
 * Check if a user has an assigned credential
 * @param {string} userId - The ID of the user
 * @returns {boolean} True if user has a credential, false otherwise
 */
const hasCredential = (userId) => {
  return credentialMappings.has(userId);
};

module.exports = {
  getCredentialForUser,
  hasCredential
}; 