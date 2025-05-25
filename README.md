# Verifiable Credentials Issuer

A secure credential issuing service that implements the OpenID for Verifiable Credential Issuance specification. The system supports issuing signed verifiable credentials with image attachments and provides verification capabilities.

## Key Features

- **Secure Credential Issuance**: Issues JWT-signed verifiable credentials
- **Image Attachment Support**: Handles image attachments with hash-based integrity verification
- **Database Integration**: MySQL-based credential storage and verification
- **JWKS Endpoint**: Provides public key for credential verification
- **Standards Compliant**: Follows OpenID4VCI specification

## API Endpoints

### Credential Issuance Flow

1. **GET /.well-known/openid-credential-issuer**
   - OpenID Credential Issuer metadata endpoint
   - Returns issuer configuration

2. **GET /.well-known/jwks.json**
   - JSON Web Key Set endpoint
   - Provides public key for credential verification

3. **POST /credential-offer**
   - Request body:
     ```json
     {
       "credential_type": "string",
       "user_id": "string"
     }
     ```
   - Returns a credential offer with pre-authorized code

4. **POST /token**
   - Request body:
     ```json
     {
       "grant_type": "urn:ietf:params:oauth:grant-type:pre-authorized_code",
       "pre-authorized_code": "string"
     }
     ```
   - Returns an access token

5. **POST /credentials**
   - Headers: `Authorization: Bearer <access_token>`
   - Returns signed credential with optional image attachments

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- OpenSSL for key generation

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vc-issuer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate EC private key:
   ```bash
   openssl ecparam -name prime256v1 -genkey -noout -out private.pem
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `ISSUER_PRIVATE_KEY`: Contents of private.pem
   - `ISSUER_KID`: Key identifier for JWKS
   - Database configuration
   - Other required variables

5. Initialize database:
   ```bash
   npm run db:migrate
   ```

## Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Testing

1. Run the test suite:
   ```bash
   npm test
   ```

2. Test credential verification:
   ```bash
   node test/verifyCredential.js
   ```

## Credential Types

Currently supported credential types:
- UniversityDegree
- VendorPermit (with image attachment)

## Security Features

- JWT-based credential signing
- Image integrity verification using SHA-256 hashes
- Public key distribution through JWKS endpoint
- Access token-based authorization
- Pre-authorized code flow for credential issuance

## Database Schema

### Credentials Table
- id (UUID)
- user_id (string)
- type (string)
- issuer_id (string)
- issuance_date (datetime)
- expiration_date (datetime)

### VendorPermit Table
- credential_id (UUID, FK)
- permit_image (BLOB)
- image_updated_at (datetime)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Add your license here] 