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

# 📋 Tổng quan triển khai dự án

## ✅ Hoàn thành: Hệ thống xác thực chứng chỉ Blockchain

Đã xây dựng ứng dụng web đầy đủ, sẵn sàng sản xuất, để quản lý và xác thực chứng chỉ trên mạng Ethereum Sepolia testnet.

---

## 📦 Cấu trúc dự án

```
Blockchain/
│
├── smart-contract/
│   ├── contracts/
│   │   └── CertificateRegistry.sol          ✅ Hợp đồng thông minh hoàn chỉnh
│   ├── scripts/
│   │   └── deploy.js                        ✅ Script triển khai
│   ├── hardhat.config.js                    ✅ Cấu hình Hardhat
│   ├── package.json                         ✅ Các thư viện phụ thuộc
│   └── .env                                 ✅ Cấu hình môi trường
│
├── backend/
│   ├── src/
│   │   ├── index.js                         ✅ Máy chủ chính
│   │   ├── routes/
│   │   │   ├── auth.js                      ✅ API xác thực
│   │   │   ├── certificates.js              ✅ CRUD chứng chỉ
│   │   │   ├── verify.js                    ✅ API xác thực
│   │   │   ├── qr.js                        ✅ QR code
│   │   │   └── admin.js                     ✅ Chức năng admin
│   │   ├── middleware/
│   │   │   └── auth.js                      ✅ JWT middleware
│   │   └── utils/
│   │       ├── BlockchainService.js         ✅ Tương tác blockchain
│   │       ├── HashService.js               ✅ Hash SHA-256
│   │       ├── JWTService.js                ✅ Tiện ích JWT
│   │       └── CertificateRegistry.json     ✅ ABI hợp đồng
│   ├── package.json                         ✅ Các thư viện phụ thuộc
│   └── .env                                 ✅ Cấu hình môi trường
│
├── frontend/
│   ├── src/
│   │   ├── App.js                           ✅ Thành phần chính
│   │   ├── index.js                         ✅ Entry point
│   │   ├── pages/
│   │   │   ├── Login.js                     ✅ Trang đăng nhập
│   │   │   ├── Register.js                  ✅ Trang đăng ký
│   │   │   ├── Dashboard.js                 ✅ Trang tổng quan
│   │   │   ├── CreateCertificate.js         ✅ Tạo chứng chỉ
│   │   │   └── VerifyCertificate.js         ✅ Xác thực chứng chỉ
│   │   └── utils/
│   │       └── api.js                       ✅ Client API
│   ├── public/
│   │   └── index.html                       ✅ Mẫu HTML
│   ├── package.json                         ✅ Các thư viện phụ thuộc
│   └── .env                                 ✅ Cấu hình môi trường
│
├── SETUP.md                                 ✅ Tài liệu cài đặt
├── QUICKSTART.md                            ✅ Hướng dẫn nhanh
├── agents.md                                ✅ Kiến trúc agent
└── usercase.md                              ✅ Các kịch bản sử dụng
```

---

## 🔧 Tính năng hợp đồng thông minh

### CertificateRegistry.sol (Solidity 0.8.19)

**Các hàm chính:**
- ✅ `createCertificate()` - Tạo chứng chỉ mới trên blockchain
- ✅ `updateCertificate()` - Cập nhật chứng chỉ (versioning)
- ✅ `revokeCertificate()` - Thu hồi chứng chỉ
- ✅ `verifyCertificate()` - Xác thực tính hợp lệ của chứng chỉ
- ✅ `getCertificate()` - Lấy dữ liệu chứng chỉ
- ✅ `getVersionHistory()` - Lấy lịch sử phiên bản
- ✅ `authorizeIssuer()` - Thêm người phát hành được ủy quyền

**Cấu trúc dữ liệu:**
- ✅ Struct Certificate với các trường cần thiết
- ✅ Theo dõi lịch sử phiên bản
- ✅ Enum trạng thái chứng chỉ (ACTIVE, REVOKED, SUPERSEDED, PENDING)
- ✅ Mapping xác thực quyền issuer

**Sự kiện:**
- ✅ CertificateCreated
- ✅ CertificateUpdated
- ✅ CertificateRevoked
- ✅ IssuerAuthorized

---

## 🚀 Tính năng API Backend

### Route xác thực (`/api/auth`)
- ✅ POST `/register` - Đăng ký người dùng
- ✅ POST `/login` - Đăng nhập
- ✅ GET `/me` - Lấy thông tin người dùng hiện tại

### Route chứng chỉ (`/api/certificates`)
- ✅ POST `/create` - Tạo chứng chỉ (chỉ admin)
- ✅ GET `/` - Lấy danh sách chứng chỉ của người dùng
- ✅ GET `/:id` - Lấy chi tiết chứng chỉ
- ✅ PUT `/:id` - Cập nhật chứng chỉ (chỉ admin)
- ✅ POST `/:id/revoke` - Thu hồi chứng chỉ (chỉ admin)
- ✅ GET `/:id/history` - Lấy lịch sử phiên bản

### Route xác thực (`/api/verify`)
- ✅ POST `/certificate-id` - Xác thực bằng ID chứng chỉ
- ✅ POST `/upload` - Xác thực bằng cách tải lên dữ liệu

### Route QR Code (`/api/qr`)
- ✅ POST `/generate` - Tạo QR code
- ✅ GET `/:certificateId` - Lấy QR code

### Route admin (`/api/admin`)
- ✅ GET `/certificates` - Lấy tất cả chứng chỉ
- ✅ GET `/users` - Lấy tất cả người dùng
- ✅ GET `/stats` - Lấy số liệu hệ thống

---

## 🎨 Tính năng giao diện Frontend

### Các trang đã triển khai
- ✅ **Login** - Đăng nhập người dùng
- ✅ **Register** - Đăng ký người dùng mới
- ✅ **Dashboard** - Tổng quan và thống kê
- ✅ **Create Certificate** - Form tạo chứng chỉ
- ✅ **Verify Certificate** - Xác thực chứng chỉ bằng ID hoặc tải dữ liệu

### Thành phần giao diện
- ✅ Thanh điều hướng với thông tin người dùng
- ✅ Kiểm tra dữ liệu form
- ✅ Xử lý và hiển thị lỗi
- ✅ Thông báo thành công
- ✅ Lưới thống kê cho admin
- ✅ Bảng chứng chỉ với hành động
- ✅ Hiển thị QR code
- ✅ Thiết kế đáp ứng

---

## 🔐 Triển khai bảo mật

✅ **Xác thực:**
- JWT token-based
- Mã hóa mật khẩu bằng bcryptjs
- Token lưu trong localStorage

✅ **Phân quyền:**
- Kiểm soát vai trò (Admin, User, Verifier)
- Các thao tác admin được bảo vệ
- Middleware kiểm tra xác thực và phân quyền

✅ **Toàn vẹn dữ liệu:**
- Hash SHA-256 cho tất cả chứng chỉ
- Xác thực hash trên blockchain
- Dữ liệu lưu trên blockchain bất biến

✅ **Hợp đồng thông minh:**
- Xác thực quyền issuer
- Yêu cầu xác nhận giao dịch
- Không xoá dữ liệu trực tiếp (chỉ dùng versioning)
- Kiểm soát truy cập theo trạng thái

---

## 📊 Sơ đồ dữ liệu

### Collection Users
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

### Collection Certificates
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

## 🧪 Các luồng kiểm thử

### 1. Luồng tạo chứng chỉ
```
1. Admin đăng ký và đăng nhập
2. Chuyển tới trang Create Certificate
3. Điền thông tin chứng chỉ
4. Hệ thống tạo hash SHA-256
5. Gửi giao dịch lên blockchain
6. Chờ xác nhận
7. Tạo mã QR
8. Lưu chứng chỉ vào MongoDB
✓ Hiển thị thông báo thành công
```

### 2. Luồng xác thực chứng chỉ
```
1. Verifier vào trang Verify
2. Nhập Certificate ID HOẶC tải dữ liệu lên
3. Hệ thống tạo hash
4. Tra cứu giao dịch trên blockchain
5. Xác nhận hash khớp
6. Kiểm tra trạng thái chứng chỉ
7. Hiển thị kết quả xác thực
✓ Hiển thị VALID/REVOKED/NOT_FOUND
```

### 3. Luồng Dashboard admin
```
1. Admin đăng nhập
2. Dashboard hiển thị:
   - Tổng số chứng chỉ
   - Chứng chỉ đang hoạt động
   - Chứng chỉ đã thu hồi
   - Tổng số người dùng
   - Bảng chứng chỉ gần đây
3. Admin có thể thực hiện CRUD
✓ Tất cả số liệu cập nhật theo thời gian thực
```

---

## 🔗 Điểm tích hợp

### Smart Contract → Backend
- ✅ ABI được cung cấp dưới dạng JSON
- ✅ BlockchainService xử lý tương tác với blockchain
- ✅ Sử dụng ethers.js để giao tiếp Web3
- ✅ Ký giao dịch bằng khóa riêng

### Backend → Frontend
- ✅ RESTful API trả JSON
- ✅ Xử lý lỗi và mã trạng thái
- ✅ Xác thực JWT
- ✅ Cấu hình CORS

### Frontend → Blockchain
- ✅ Gián tiếp qua API backend
- ✅ Sẵn sàng tích hợp MetaMask trong tương lai
- ✅ QR code với liên kết xác thực

---

## 🚀 Hướng dẫn triển khai

### Môi trường phát triển (đã thực hiện)
```bash
# Smart Contract
cd smart-contract && npm run deploy:sepolia

# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm start
```

### Checklist sản phẩm
Xem phần `SETUP.md` mục Deployment

---

## 📝 Các tệp cấu hình

| File | Vị trí | Trạng thái |
|------|----------|--------|
| Smart Contract Config | `smart-contract/hardhat.config.js` | ✅ |
| Backend Config | `backend/.env` | ✅ |
| Frontend Config | `frontend/.env` | ✅ |
| Documentation | `SETUP.md` | ✅ |
| Quick Start | `QUICKSTART.md` | ✅ |

---

## 🎯 Tính năng theo kịch bản sử dụng

| UC | Tính năng | Trạng thái |
|----|---------|--------|
| UC-01 | Đăng nhập | ✅ Hoàn thành |
| UC-02 | Tạo chứng chỉ | ✅ Hoàn thành |
| UC-03 | Cập nhật chứng chỉ | ✅ Hoàn thành |
| UC-04 | Thu hồi chứng chỉ | ✅ Hoàn thành |
| UC-05 | Liệt kê chứng chỉ | ✅ Hoàn thành |
| UC-06 | Xem chứng chỉ | ✅ Hoàn thành |
| UC-07 | Xác thực chứng chỉ | ✅ Hoàn thành |
| UC-08 | Lịch sử phiên bản | ✅ Hoàn thành |
| UC-09 | Xác thực QR | ✅ Hoàn thành |
| UC-10 | Xuất chứng chỉ | 🔄 Đã sẵn sàng (API sẵn sàng) |

---

## 📚 Tài liệu cung cấp

✅ **SETUP.md** - Hướng dẫn cài đặt và triển khai đầy đủ
✅ **QUICKSTART.md** - Hướng dẫn nhanh 5 phút
✅ **agents.md** - Kiến trúc hệ thống và agents
✅ **usercase.md** - Yêu cầu nghiệp vụ và kịch bản sử dụng
✅ **README.md** (tệp này) - Tổng quan dự án

---

## 🔄 Bước tiếp theo (cải tiến tuỳ chọn)

1. **PDF Export** - Tạo chứng chỉ có thể tải về định dạng PDF
2. **Email Notifications** - Gửi thông báo khi xử lý chứng chỉ
3. **Mobile App** - Phiên bản React Native
4. **NFT Support** - Phát hành chứng chỉ dạng NFT
5. **IPFS Integration** - Lưu trữ phi tập trung
6. **Multi-chain** - Hỗ trợ nhiều blockchain
7. **Advanced Search** - Tìm kiếm toàn văn
8. **Audit Logs** - Lưu trữ nhật ký hoạt động đầy đủ

---

## 📊 Tóm tắt công nghệ

| Layer | Công nghệ | Phiên bản |
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

## ✨ Thành tựu chính

✅ **Ứng dụng full-stack** - Frontend, backend, hợp đồng thông minh
✅ **Tích hợp blockchain** - Hoạt động trên Sepolia testnet
✅ **Toàn vẹn dữ liệu** - Hash SHA-256 xác thực trên chain
✅ **Quản lý người dùng** - Xác thực đa vai trò
✅ **Vòng đời chứng chỉ** - Tạo, cập nhật, thu hồi, xác thực
✅ **Quản lý phiên bản** - Theo dõi lịch sử đầy đủ
✅ **Mã QR** - Liên kết xác thực qua QR
✅ **Dashboard admin** - Thống kê và quản lý
✅ **Sẵn sàng sản xuất** - Tài liệu đầy đủ


---

**Trạng thái dự án:** ✅ HOÀN THÀNH & SẴN SÀNG SỬ DỤNG

**Cập nhật lần cuối:** May 11, 2026  
**Phiên bản:** 1.0.0
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

**Project Status:** ✅ COMPLETE & READY FOR USE

**Last Updated:** May 11, 2026  
**Version:** 1.0.0
