<h2 align="center">
    <a href="https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin">
    🎓 Faculty of Information Technology (DaiNam University)
    </a>
</h2>
<h2 align="center">
   SpaceShip10k
</h2>
<div align="center">
    <p align="center">
        <img src="https://github.com/user-attachments/assets/ee72b1c4-04c7-4e4b-8d7a-8cf16932804a"width="170" />
        <img src="https://github.com/user-attachments/assets/1459f5bf-7fc9-4462-996d-eb1ef7633a97"width="180" />
        <img src="https://github.com/user-attachments/assets/f081d02c-b644-4e87-a40c-fcb8383c2985"width="200" />
    </p>

[![AIoTLab](https://img.shields.io/badge/AIoTLab-green?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Faculty of Information Technology](https://img.shields.io/badge/Faculty%20of%20Information%20Technology-blue?style=for-the-badge)](https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-orange?style=for-the-badge)](https://dainam.edu.vn)

</div>

# 📋 Project Implementation Summary

## ✅ Completed: Blockchain Certificate Verification System

Created a complete, production-ready web application for managing and verifying certificates on Ethereum Sepolia testnet.

---

## 📦 Project Structure

```
Blockchain/
│
├── smart-contract/
│   ├── contracts/
│   │   └── CertificateRegistry.sol          ✅ Complete smart contract
│   ├── scripts/
│   │   └── deploy.js                        ✅ Deployment script
│   ├── hardhat.config.js                    ✅ Hardhat configuration
│   ├── package.json                         ✅ Dependencies
│   └── .env                                 ✅ Environment config
│
├── backend/
│   ├── src/
│   │   ├── index.js                         ✅ Main server
│   │   ├── routes/
│   │   │   ├── auth.js                      ✅ Authentication endpoints
│   │   │   ├── certificates.js              ✅ Certificate CRUD
│   │   │   ├── verify.js                    ✅ Verification endpoints
│   │   │   ├── qr.js                        ✅ QR code generation
│   │   │   └── admin.js                     ✅ Admin operations
│   │   ├── middleware/
│   │   │   └── auth.js                      ✅ JWT middleware
│   │   └── utils/
│   │       ├── BlockchainService.js         ✅ Blockchain interaction
│   │       ├── HashService.js               ✅ SHA-256 hashing
│   │       ├── JWTService.js                ✅ JWT utilities
│   │       └── CertificateRegistry.json     ✅ Contract ABI
│   ├── package.json                         ✅ Dependencies
│   └── .env                                 ✅ Environment config
│
├── frontend/
│   ├── src/
│   │   ├── App.js                           ✅ Main app component
│   │   ├── index.js                         ✅ Entry point
│   │   ├── pages/
│   │   │   ├── Login.js                     ✅ Login page
│   │   │   ├── Register.js                  ✅ Registration page
│   │   │   ├── Dashboard.js                 ✅ Dashboard with stats
│   │   │   ├── CreateCertificate.js         ✅ Certificate creation
│   │   │   └── VerifyCertificate.js         ✅ Certificate verification
│   │   └── utils/
│   │       └── api.js                       ✅ API client
│   ├── public/
│   │   └── index.html                       ✅ HTML template
│   ├── package.json                         ✅ Dependencies
│   └── .env                                 ✅ Environment config
│
├── SETUP.md                                 ✅ Full documentation
├── QUICKSTART.md                            ✅ Quick start guide
├── agents.md                                ✅ Agent structure
└── usercase.md                              ✅ Use cases
```

---

## 🔧 Smart Contract Features

### CertificateRegistry.sol (Solidity 0.8.19)

**Core Functions:**
- ✅ `createCertificate()` - Create new certificate on blockchain
- ✅ `updateCertificate()` - Update certificate (versioning)
- ✅ `revokeCertificate()` - Revoke certificate
- ✅ `verifyCertificate()` - Verify certificate authenticity
- ✅ `getCertificate()` - Retrieve certificate data
- ✅ `getVersionHistory()` - Get all versions
- ✅ `authorizeIssuer()` - Add authorized issuer

**Data Structures:**
- ✅ Certificate struct with all required fields
- ✅ VersionHistory tracking
- ✅ Certificate Status enum (ACTIVE, REVOKED, SUPERSEDED, PENDING)
- ✅ Authorization mapping

**Events:**
- ✅ CertificateCreated
- ✅ CertificateUpdated
- ✅ CertificateRevoked
- ✅ IssuerAuthorized

---

## 🚀 Backend API Features

### Authentication Routes (`/api/auth`)
- ✅ POST `/register` - User registration
- ✅ POST `/login` - User login
- ✅ GET `/me` - Get current user

### Certificate Routes (`/api/certificates`)
- ✅ POST `/create` - Create certificate (admin only)
- ✅ GET `/` - List user's certificates
- ✅ GET `/:id` - Get certificate details
- ✅ PUT `/:id` - Update certificate (admin only)
- ✅ POST `/:id/revoke` - Revoke certificate (admin only)
- ✅ GET `/:id/history` - Get version history

### Verification Routes (`/api/verify`)
- ✅ POST `/certificate-id` - Verify by certificate ID
- ✅ POST `/upload` - Verify by uploading data

### QR Code Routes (`/api/qr`)
- ✅ POST `/generate` - Generate QR code
- ✅ GET `/:certificateId` - Get QR code

### Admin Routes (`/api/admin`)
- ✅ GET `/certificates` - Get all certificates
- ✅ GET `/users` - Get all users
- ✅ GET `/stats` - Get system statistics

---

## 🎨 Frontend Features

### Pages Implemented
- ✅ **Login Page** - User authentication
- ✅ **Register Page** - New user registration
- ✅ **Dashboard** - Overview with statistics
- ✅ **Create Certificate** - Form for admin to create certificates
- ✅ **Verify Certificate** - Verification by ID or upload

### UI Components
- ✅ Navigation bar with user info
- ✅ Form validation
- ✅ Error handling and display
- ✅ Success notifications
- ✅ Statistics grid (admin)
- ✅ Certificate table with actions
- ✅ QR code display
- ✅ Responsive design

---

## 🔐 Security Implementation

✅ **Authentication:**
- JWT token-based
- Secure password hashing with bcryptjs
- Token stored in localStorage

✅ **Authorization:**
- Role-based access control (Admin, User, Verifier)
- Admin-only operations protected
- Middleware for authentication/authorization

✅ **Data Integrity:**
- SHA-256 hashing for all certificates
- Hash verification on blockchain
- Immutable blockchain records

✅ **Smart Contract:**
- Authorized issuer validation
- Transaction confirmation required
- No direct data deletion (versioning only)
- Status-based access control

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String (admin|user|verifier),
  createdAt: Date,
  active: Boolean
}
```

### Certificates Collection
```javascript
{
  _id: ObjectId,
  certificateId: String (unique),
  ownerName: String,
  ownerEmail: String,
  ownerAddress: String,
  skillName: String,
  issuerName: String,
  issuerEmail: String,
  issueDate: Number,
  expiryDate: Number,
  certificateHash: String (SHA-256),
  status: String (ACTIVE|REVOKED|SUPERSEDED|PENDING),
  blockchainTx: String,
  blockNumber: Number,
  version: Number,
  metadata: Object,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId
}
```

---

## 🧪 Testing Flows

### 1. Certificate Creation Flow
```
1. Admin registers and logs in
2. Navigate to Create Certificate
3. Fill in certificate details
4. System generates SHA-256 hash
5. Transaction submitted to blockchain
6. Wait for confirmation
7. QR code generated
8. Certificate saved to MongoDB
✓ Success notification shown
```

### 2. Certificate Verification Flow
```
1. Verifier navigates to Verify page
2. Enter Certificate ID OR upload data
3. System generates hash
4. Query blockchain for transaction
5. Verify hash matches
6. Check certificate status
7. Display verification result
✓ VALID/REVOKED/NOT_FOUND result shown
```

### 3. Admin Dashboard Flow
```
1. Admin logs in
2. Dashboard shows:
   - Total certificates
   - Active certificates
   - Revoked certificates
   - Total users
   - Recent certificates table
3. Admin can perform CRUD operations
✓ All statistics updated in real-time
```

---

## 🔗 Integration Points

### Smart Contract → Backend
- ✅ ABI provided in JSON format
- ✅ BlockchainService handles all interactions
- ✅ ethers.js library for Web3 communication
- ✅ Transaction signing with private key

### Backend → Frontend
- ✅ RESTful API with JSON responses
- ✅ Error handling and status codes
- ✅ JWT authentication
- ✅ CORS configured

### Frontend → Blockchain
- ✅ Indirect through backend API
- ✅ MetaMask integration ready (for future)
- ✅ QR code with verification link

---

## 🚀 Deployment Instructions

### Development (Already Done)
```bash
# Smart Contract
cd smart-contract && npm run deploy:sepolia

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### Production Checklist
See `SETUP.md` Section: Deployment

---

## 📝 Configuration Files

| File | Location | Status |
|------|----------|--------|
| Smart Contract Config | `smart-contract/hardhat.config.js` | ✅ |
| Backend Config | `backend/.env` | ✅ |
| Frontend Config | `frontend/.env` | ✅ |
| Documentation | `SETUP.md` | ✅ |
| Quick Start | `QUICKSTART.md` | ✅ |

---

## 🎯 Features by Use Case

| UC | Feature | Status |
|----|---------|--------|
| UC-01 | Login | ✅ Complete |
| UC-02 | Create Certificate | ✅ Complete |
| UC-03 | Update Certificate | ✅ Complete |
| UC-04 | Revoke Certificate | ✅ Complete |
| UC-05 | List Certificates | ✅ Complete |
| UC-06 | View Certificate | ✅ Complete |
| UC-07 | Verify Certificate | ✅ Complete |
| UC-08 | Version History | ✅ Complete |
| UC-09 | QR Verification | ✅ Complete |
| UC-10 | Export Certificate | 🔄 Ready (API ready) |

---

## 📚 Documentation Provided

✅ **SETUP.md** - Full setup and deployment guide
✅ **QUICKSTART.md** - 5-minute quick start
✅ **agents.md** - System architecture and agents
✅ **usercase.md** - Business requirements and use cases
✅ **README.md** (This file) - Project summary

---

## 🔄 Next Steps (Optional Enhancements)

1. **PDF Export** - Generate downloadable certificates as PDF
2. **Email Notifications** - Notify users of certificate actions
3. **Mobile App** - React Native version
4. **NFT Support** - Issue certificates as NFTs
5. **IPFS Integration** - Decentralized file storage
6. **Multi-chain** - Support other blockchains
7. **Advanced Search** - Full-text search capabilities
8. **Audit Logs** - Complete activity logging

---

## 📊 Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Smart Contract | Solidity | 0.8.19 |
| Backend | Node.js | 16+ |
| Backend Framework | Express | 4.18+ |
| Frontend | React | 18+ |
| Blockchain | Ethereum/Sepolia | - |
| Database | MongoDB | 6+ |
| Wallet | MetaMask | - |
| Hashing | SHA-256 | - |

---

## ✨ Key Achievements

✅ **Full-stack application** - Frontend, backend, smart contract  
✅ **Blockchain integration** - Live Sepolia testnet  
✅ **Data integrity** - SHA-256 hashing verified on-chain  
✅ **User management** - Multi-role authentication  
✅ **Certificate lifecycle** - Create, update, revoke, verify  
✅ **Version control** - Complete history tracking  
✅ **QR codes** - Verification links with QR  
✅ **Admin dashboard** - Statistics and management  
✅ **Production-ready** - Comprehensive documentation  

---

## 📞 Support

For issues or questions:
1. Check `SETUP.md` troubleshooting section
2. Review `QUICKSTART.md` for common issues
3. Check blockchain transactions on Sepolia Scan
4. Verify `.env` configuration files

---

**Project Status:** ✅ COMPLETE & READY FOR USE

**Last Updated:** May 11, 2026  
**Version:** 1.0.0
