const { ApiError } = require('../middleware/errorHandler');

const getIssuerMetadata = async (req, res) => {
  try {
    const metadata = {
      issuer: `http://localhost:${process.env.PORT}`,
      authorization_endpoint: `http://localhost:${process.env.PORT}/authorize`,
      token_endpoint: `http://localhost:${process.env.PORT}/token`,
      credential_endpoint: `http://localhost:${process.env.PORT}/credentials`,
      credential_issuer: `http://localhost:${process.env.PORT}`,
      jwks_uri: `http://localhost:${process.env.PORT}/.well-known/jwks.json`,
      credential_configurations_supported: {
        "VerifiableCredential": {
          formats: {
            jwt_vc: {
              types: ["VerifiableCredential"],
              cryptographic_binding_methods_supported: ["did"],
              cryptographic_suites_supported: ["ES256"]
            }
          },
          display: [
            {
              name: "Verifiable Credential",
              locale: "en-US"
            }
          ]
        }
      },
      grant_types_supported: [
        "urn:ietf:params:oauth:grant-type:pre-authorized_code"
      ],
      response_types_supported: ["token"],
      token_endpoint_auth_methods_supported: ["none"],
      id_token_signing_alg_values_supported: ["ES256"]
    };

    res.json(metadata);
  } catch (error) {
    throw new ApiError(500, 'Error retrieving issuer metadata');
  }
};

module.exports = {
  getIssuerMetadata
}; 