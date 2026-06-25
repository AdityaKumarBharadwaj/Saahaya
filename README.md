# Saahaya — Donate With Purpose

> *Saahaya (सहाय) — A Sanskrit word meaning "help" or "support"*

**Saahaya** is a full-stack NGO donation platform that connects verified charitable organizations with donors across India. Built with transparency, trust, and impact at its core, Saahaya enables secure digital donations, instant 80G tax receipts, and real-time impact tracking — making giving simpler, safer, and more meaningful.

---

## 📌 Table of Contents

- [Why Saahaya?](#-why-saahaya)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Payment Flow](#-payment-flow)
- [File Structure](#-file-structure)
- [API Endpoints](#-api-endpoints)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 Why Saahaya?

India has over **3.3 million NGOs** but most donors struggle to:

-  Verify if an NGO is genuine
-  Donate digitally with confidence
-  Receive instant tax receipts (80G)
-  Track how their money is being used
-  Discover NGOs by cause or location

**Saahaya solves all of this** with a verified NGO ecosystem, secure Razorpay payments, automatic tax certificate generation, and transparent impact reporting — all in one platform.

---

## 🚀 Live Demo

| Service | URL |
|---------|-----|
| Frontend | Coming Soon |
| Backend API | Coming Soon |
| API Documentation | Coming Soon |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with 30-day token expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based access control (Donor, NGO, Admin)
- Protected and public routes
- Signature-based payment verification (HMAC-SHA256)

### 🏢 NGO Management
- NGO registration with organization details
- Document upload (Trust Deed, 80G Certificate, PAN Card)
- Admin verification workflow (Pending → Approved / Rejected)
- Rejection with detailed reason
- NGO financial dashboard (Total received, balance, donor count)
- Impact metrics (Beneficiaries helped, projects completed)
- Rating and donor count tracking

### 💰 Donation System
- Razorpay payment gateway integration (UPI, Cards, NetBanking)
- Minimum donation: ₹10
- Anonymous donation option
- Optional donor message to NGO
- Atomic receipt number generation (race-condition safe)
- Real-time NGO financial updates
- Complete donation history

### 📄 Tax Receipts (80G)
- Automatic PDF receipt generation on payment success
- Section 80G eligible certificate
- Tax savings calculation (50% of donation)
- Unique receipt number: `REC-YYYYMMDD-XXXXX`
- Download receipt anytime from dashboard
- Receipt emailed instantly to donor

### 📧 Email Notifications
- Welcome email on registration
- Donation receipt email with PDF
- NGO approval notification
- NGO rejection with reason and next steps
- Professional HTML email templates

### 📁 File Upload
- NGO document uploads (PDF)
- NGO logo upload (Images)
- Cloud storage via Cloudinary
- Automatic image optimization and resizing
- File type and size validation

### 🔍 Search & Discovery
- Filter NGOs by cause (Education, Health, Environment, Animals, Poverty, Women)
- Filter by city/state
- Search by NGO name (regex, case-insensitive)
- Sort by rating and popularity
- Public NGO profiles

---

## 👥 User Roles

### 🙋 Donor
| Capability | Details |
|-----------|---------|
| Browse NGOs | Filter by cause, location, search by name |
| View NGO Profile | Full details, impact, ratings |
| Make Donations | UPI, Cards, NetBanking via Razorpay |
| Anonymous Donations | Hide name from public view |
| Download Receipts | 80G PDF certificates |
| Donation History | Full history with amounts and dates |
| Dashboard | Total donated, tax savings, NGOs supported |

### 🏢 NGO
| Capability | Details |
|-----------|---------|
| Create Profile | Organization details, cause, address |
| Upload Documents | Trust Deed, 80G Certificate, PAN Card |
| Track Donations | Amount, donor details, date |
| Financial Dashboard | Total received, balance, withdrawals |
| Update Impact | Beneficiaries helped, projects done |
| Verification Status | Track pending/approved/rejected status |

### 🛡️ Admin
| Capability | Details |
|-----------|---------|
| View Pending NGOs | All unverified applications |
| Review Documents | Trust Deed, Certificates, PAN |
| Approve NGOs | Make them live for donations |
| Reject NGOs | With detailed rejection reason |
| Platform Statistics | Total users, donations, NGOs |
| Monitor Activities | All donations and activities |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React.js | UI Framework |
| React Router | Client-side routing |
| Axios | HTTP requests |
| Context API | Global state management |
| Tailwind CSS | Styling |
| Razorpay SDK | Payment popup integration |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB | Database |
| Mongoose | ODM (Object Data Modeling) |
| JWT | Authentication tokens |
| Bcryptjs | Password hashing |
| Multer | File upload handling |
| PDFKit | PDF receipt generation |
| Nodemailer | Email service |
| Crypto | HMAC signature verification |

### Cloud & Third-Party Services
| Service | Purpose |
|---------|---------|
| Razorpay | Payment gateway (UPI, Cards, NetBanking) |
| Cloudinary | Image and document cloud storage |
| MongoDB Atlas | Cloud database hosting |
| SendGrid | Production email service |

### Deployment
| Platform | Service |
|---------|---------|
| Railway / Render | Backend API hosting |
| Vercel / Netlify | Frontend hosting |
| MongoDB Atlas | Database |
| Cloudinary | Media storage |

---

## 🏗️ System Architecture

```
                        SAAHAYA PLATFORM
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   FRONTEND (React.js)                                   │
│   ┌───────────┐  ┌──────────┐  ┌────────────────────┐   │
│   │ Donor UI  │  │  NGO UI  │  │     Admin Panel    │   │
│   └─────┬─────┘  └────┬─────┘  └─────────┬──────────┘   │
│         │              │                   │            │
└─────────┼──────────────┼───────────────────┼────────────┘
          │              │                   │
          ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                  REST API (Express.js)                  │
│                                                         │
│   ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│   │   Auth   │  │   NGO    │  │      Donations       │  │
│   │  Routes  │  │  Routes  │  │       Routes         │  │
│   └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│        │              │                    │            │
│   ┌────▼─────────────▼────────────────────▼───────────┐ │
│   │              Middlewares                          │ │
│   │   JWT Auth │ Role Check │ File Upload │ Validator │ │
│   └────┬────────────────────────────────────┬─────────┘ │
│        │                                    │           │
│   ┌────▼──────────────────┐  ┌─────────────▼──────────┐ │
│   │     Controllers       │  │        Services        │ │
│   │  Auth │ NGO │ Donation│  │  Email │ PDF │ Upload  │ │
│   └────┬──────────────────┘  └────────────────────────┘ │
│        │                                                │
└────────┼────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│                                                         │
│   ┌──────────────┐    ┌──────────────┐                  │
│   │   MongoDB    │    │  Cloudinary  │                  │
│   │   Atlas      │    │   Storage    │                  │
│   │              │    │              │                  │
│   │ Users        │    │ NGO Logos    │                  │
│   │ NGOs         │    │ Documents    │                  │
│   │ Donations    │    │ Receipts     │                  │
│   │ Counters     │    │              │                  │
│   └──────────────┘    └──────────────┘                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│               THIRD-PARTY SERVICES                      │
│                                                         │
│   ┌─────────────┐   ┌────────────┐   ┌───────────────┐  │
│   │  Razorpay   │   │  SendGrid  │   │   Nodemailer  │  │
│   │  Payments   │   │   Email    │   │  (Dev Email)  │  │
│   └─────────────┘   └────────────┘   └───────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Collections Overview

```
MongoDB Database: saahaya
│
├── users           → All registered users (donors, NGOs, admins)
├── ngos            → NGO profiles and details
├── donations       → All donation transactions
└── counters        → Atomic receipt number generation
```

### Relationships

```
USER (role: ngo)
    │
    │ 1-to-1
    ▼
NGO PROFILE
    │
    │ 1-to-many
    ▼
DONATIONS ◄────── USER (role: donor)
    │
    │ references
    ▼
COUNTER (for receipt numbers)
```

---

## 💳 Payment Flow

```
DONOR                    SAAHAYA BACKEND              RAZORPAY
  │                            │                          │
  │  1. Click "Donate ₹500"    │                          │
  │──────────────────────────► │                          │
  │                            │  2. Create Order         │
  │                            │─────────────────────────►│
  │                            │                          │
  │                            │  3. Return order_id      │
  │                            │◄─────────────────────────│
  │  4. Send order_id + keyId  │                          │
  │◄────────────────────────── │                          │
  │                            │                          │
  │  5. Open Payment Popup     │                          │
  │─────────────────────────────────────────────────────► │
  │                            │                          │
  │  6. User Pays (UPI/Card)   │                          │
  │◄───────────────────────────────────────────────────── │
  │                            │                          │
  │  7. Send payment_id        │                          │
  │      + signature           │                          │
  │──────────────────────────► │                          │
  │                            │                          │
  │                     8. Verify signature (HMAC)        │
  │                     9. Update donation → success      │
  │                     10. Generate receipt number       │
  │                     11. Create PDF receipt            │
  │                     12. Update NGO financials         │
  │                     13. Send email with PDF           │
  │                            │                          │
  │  14. Success + Receipt     │                          │
  │◄────────────────────────── │                          │
```

---

## 📁 File Structure

```
saahaya/
│
├── backend/                        → Express.js API Server
│   │
│   ├── config/
│   │   ├── db.js                   → MongoDB connection
│   │   ├── cloudinary.js           → Cloudinary configuration
│   │   └── razorpay.js             → Razorpay instance setup
│   │
│   ├── controllers/
│   │   ├── authController.js       → Register, Login, GetMe
│   │   ├── ngoController.js        → NGO CRUD, Approve, Reject
│   │   └── donationController.js   → CreateOrder, Verify, History
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js       → JWT protect + Role authorize
│   │   ├── uploadMiddleware.js     → Local file upload (Multer)
│   │   └── cloudinaryUpload.js     → Cloud file upload
│   │
│   ├── models/
│   │   ├── User.js                 → User schema (bcrypt hooks)
│   │   ├── NGO.js                  → NGO schema (all details)
│   │   └── Donation.js             → Donation + Counter schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js           → /api/auth/*
│   │   ├── ngoRoutes.js            → /api/ngos/*
│   │   └── donationRoutes.js       → /api/donations/*
│   │
│   ├── services/
│   │   ├── emailService.js         → Nodemailer + SendGrid
│   │   └── pdfService.js           → PDFKit receipt generation
│   │
│   ├── uploads/                    → Local file storage (gitignored)
│   │   ├── documents/              → NGO PDF documents
│   │   ├── logos/                  → NGO logo images
│   │   └── receipts/               → Generated PDF receipts
│   │
│   ├── .env                        → Environment variables (gitignored)
│   ├── .gitignore
│   ├── package.json
│   └── server.js                   → Entry point
│
├── frontend/                       → React.js Application
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── NGOCard.jsx
│   │   │   ├── DonationForm.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     → Global auth state
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── NGOs.jsx            → Browse NGOs
│   │   │   ├── NGODetail.jsx       → Single NGO page
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── NGODashboard.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js              → Axios instance + interceptors
│   │   │
│   │   ├── App.jsx
│   │   └── index.jsx
│   │
│   └── package.json
│
└── README.md
```

---

## 🔗 API Endpoints

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login user |
| GET | `/me` | Private | Get current user |

### NGOs — `/api/ngos`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | Get all approved NGOs (filter/search) |
| GET | `/:id` | Public | Get single NGO |
| POST | `/` | NGO only | Create NGO profile |
| PUT | `/:id` | NGO/Admin | Update NGO profile |
| GET | `/me/profile` | NGO only | Get my NGO profile |
| PUT | `/:id/upload-logo` | NGO only | Upload NGO logo |
| PUT | `/:id/upload-documents` | NGO only | Upload documents |
| GET | `/admin/pending` | Admin only | Get pending NGOs |
| PUT | `/:id/approve` | Admin only | Approve NGO |
| PUT | `/:id/reject` | Admin only | Reject NGO with reason |

### Donations — `/api/donations`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/create-order` | Private | Create Razorpay order |
| POST | `/verify` | Private | Verify payment & save |
| GET | `/my-donations` | Private | Get donation history |
| GET | `/ngo-donations` | NGO only | Get received donations |
| GET | `/:id` | Private | Get single donation |
| GET | `/:id/download-receipt` | Private | Download PDF receipt |

---

## ⚙️ Getting Started

### Prerequisites

Before you begin, make sure you have:

- Node.js (v18 or above)
- npm or yarn
- MongoDB Atlas account (free tier)
- Razorpay account (test mode)
- Cloudinary account (free tier)
- Gmail account (for email service)

---

### Installation

**1. Clone the repository**

```
git clone https://github.com/yourusername/saahaya.git
cd saahaya
```

**2. Setup Backend**

```
cd backend
npm install
```

**3. Setup Frontend**

```
cd ../frontend
npm install
```

**4. Configure Environment Variables**

Create a `.env` file in the `backend/` folder. See the section below for all required variables.

**5. Run Development Servers**

Backend (from `/backend`):
```
npm run dev
```

Frontend (from `/frontend`):
```
npm start
```

**6. Access the App**

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` folder:

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/saahaya

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer - Development)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Email (SendGrid - Production)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

> ⚠️ **Never commit your `.env` file to GitHub. It is already included in `.gitignore`.**

---

## 🚀 Deployment

### Backend (Railway / Render)

1. Push your code to GitHub
2. Connect your GitHub repo to Railway or Render
3. Add all environment variables in the platform dashboard
4. Deploy — it's live!

### Frontend (Vercel / Netlify)

1. Push frontend code to GitHub
2. Connect repo to Vercel or Netlify
3. Set the API base URL environment variable to your deployed backend URL
4. Deploy!

### Database (MongoDB Atlas)

1. Create a free cluster at mongodb.com/atlas
2. Create a database user
3. Whitelist your server's IP address
4. Copy the connection string into your `.env`

---

## 🗺️ Roadmap

### ✅ Phase 1 — Core Platform (Completed)
- [x] User authentication (JWT + Bcrypt)
- [x] NGO registration and management
- [x] Admin verification workflow
- [x] Donation system with Razorpay
- [x] Signature-based payment verification
- [x] Atomic receipt number generation
- [x] File uploads (Multer + Cloudinary)
- [x] PDF tax receipt generation (80G)
- [x] Email notifications

### 🔄 Phase 2 — Dashboards & Analytics (In Progress)
- [ ] Admin dashboard with platform statistics
- [ ] NGO dashboard with financial metrics
- [ ] Donor dashboard with tax savings
- [ ] Monthly donation reports
- [ ] Donation trend charts

### 📋 Phase 3 — Frontend (Upcoming)
- [ ] Responsive React UI
- [ ] NGO browse and filter page
- [ ] Donation flow with Razorpay popup
- [ ] Donor and NGO dashboards
- [ ] Admin panel

### 🤖 Phase 4 — AI Features (Planned)
- [ ] Smart NGO recommendations based on donation history
- [ ] Impact prediction (estimated beneficiaries)
- [ ] Document OCR for auto-verification
- [ ] Basic FAQ chatbot for donor support
- [ ] Fraud detection using anomaly patterns
- [ ] Sentiment analysis on donor reviews
- [ ] AI-generated impact reports for NGOs

---

## 🔒 Security Highlights

- **Passwords** are never stored in plain text — hashed with Bcrypt (10 salt rounds)
- **JWT tokens** expire in 30 days and are verified on every protected request
- **Payment verification** uses HMAC-SHA256 signature — fake payments are impossible
- **Role-based access control** — donors cannot access admin or NGO-only routes
- **File validation** — file type and size checked before any upload is accepted
- **Environment variables** — all secrets stored securely, never in code
- **Atomic operations** — MongoDB `$inc` used for all financial updates (no race conditions)
- **Unique receipt numbers** — generated atomically with a counter collection

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

Please make sure your code follows the existing style and all tests pass before submitting a PR.

---

## 📸 Screenshots

> Screenshots coming soon after frontend completion.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@adityakumarbharadwaj](https://github.com/adityakumarbharadwaj)
- LinkedIn: [Aditya Kumar](https://linkedin.com/in/aditya-kumar-8248a2293/)
- Email: your@email.com

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Razorpay](https://razorpay.com) — Payment gateway
- [Cloudinary](https://cloudinary.com) — Media storage
- [MongoDB Atlas](https://mongodb.com/atlas) — Cloud database
- [SendGrid](https://sendgrid.com) — Email service
- [PDFKit](https://pdfkit.org) — PDF generation
- All open-source contributors whose packages made this possible

---

<div align="center">

**Made with ❤️ for a better India**

*Saahaya — Because every rupee counts*

⭐ Star this repo if you found it helpful!

</div>
