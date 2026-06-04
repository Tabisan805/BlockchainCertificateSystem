# Quick Start Guide - Blockchain Certificate System

## 🚀 30-Second Setup

### Step 1: Clone/Setup Project
```bash
# Project structure should be:
project-root/
├── smart-contract/
├── backend/
└── frontend/
```

### Step 2: Get Sepolia Testnet Funds
1. Go to [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
2. Enter your MetaMask address
3. Wait for funds (~1 ETH)

### Step 3: Deploy Smart Contract
```bash
cd smart-contract

# 1. Create .env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x... (from MetaMask)

# 2. Install & Deploy
npm install
npm run deploy:sepolia

# Save the contract address! 📝
```

### Step 4: Setup Backend
```bash
cd ../backend

# 1. Create .env with:
MONGODB_URI=mongodb://localhost:27017
CONTRACT_ADDRESS=0x... (from step 3)
SEPOLIA_RPC_URL=...
PRIVATE_KEY=0x...
JWT_SECRET=super_secret_key

# 2. Start
npm install
npm run dev
# Runs on http://localhost:5000 ✓
```

### Step 5: Setup Frontend
```bash
cd ../frontend

# 1. Create .env with:
REACT_APP_API_URL=http://localhost:5000/api

# 2. Start
npm install
npm start
# Opens http://localhost:3000 ✓
```

---

## 🧪 Test the System

### 1. Register & Login
- Go to http://localhost:3000
- Register as **Admin**
- Login with your credentials

### 2. Create Certificate
1. Click "Create"
2. Fill certificate details
3. Submit
4. ✓ Certificate saved to blockchain!

### 3. Verify Certificate
1. Click "Verify"
2. Enter Certificate ID or upload data
3. ✓ See verification result

---

## 📊 What's Included

| Component | Tech | Port |
|-----------|------|------|
| Smart Contract | Solidity 0.8.19 | - |
| Backend API | Node.js/Express | 5000 |
| Frontend | React 18 | 3000 |
| Database | MongoDB | 27017 |
| Blockchain | Sepolia Testnet | - |

---

## 🔑 Key Features Implemented

✅ Smart Contract for certificate management  
✅ Blockchain verification with Sepolia testnet  
✅ SHA-256 hashing for data integrity  
✅ User authentication with JWT  
✅ Role-based access (Admin, User, Verifier)  
✅ Certificate CRUD operations  
✅ QR code generation  
✅ Certificate verification  
✅ Version history tracking  
✅ Admin dashboard with statistics  

---

## 🐛 Troubleshooting

### "Contract not found" error
- Check `CONTRACT_ADDRESS` in backend `.env`
- Verify contract was deployed successfully
- Check contract exists on Sepolia Scan

### "MongoDB connection failed"
- Start MongoDB: `mongod`
- Or use MongoDB Atlas (update URI)

### "Out of gas" error
- Get more Sepolia ETH from faucet
- Reduce gas price in hardhat config

### "CORS errors"
- Backend CORS is configured
- Check `REACT_APP_API_URL` in frontend `.env`

---

## 📝 File Locations

- Smart Contract: `smart-contract/contracts/CertificateRegistry.sol`
- Backend API: `backend/src/index.js`
- Frontend App: `frontend/src/App.js`
- Setup Guide: `SETUP.md` (full documentation)
- Use Cases: `usercase.md`
- Agent Structure: `agents.md`

---

## 🔗 Useful Links

- [Sepolia Faucet](https://sepolia-faucet.pk910.de/)
- [Sepolia Explorer](https://sepolia.etherscan.io/)
- [Infura Dashboard](https://infura.io/)
- [MetaMask](https://metamask.io/)
- [MongoDB](https://www.mongodb.com/)

---

## 📞 Next Steps

1. Test all features in local environment
2. Read `SETUP.md` for production deployment
3. Configure custom styling/branding
4. Set up email notifications
5. Deploy to testnet/mainnet

---

**You're all set! 🎉**

Start by running the three services and test creating your first certificate!

Questions? Check SETUP.md or AGENTS.md for more details.
