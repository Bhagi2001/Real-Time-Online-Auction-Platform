# BidLanka — Sri Lanka's Premier Online Auction Platform

A modern, full-stack MERN auction marketplace with real-time bidding, built for Sri Lanka.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ 
- MongoDB (local on port 27017, or Atlas URI in `.env`)

### 1. Start the Backend Server

```powershell
cd server
node src/index.js
```

Server runs on **http://localhost:5000**

### 2. Start the Frontend (in a new terminal)

```powershell
cd client
npm run dev
```

Frontend runs on **http://localhost:3000**

> ⚠️ **Note:** The `npm run dev` uses `node node_modules/vite/bin/vite.js` directly to avoid npx path issues on Windows with spaces in the directory name.

---

## 🏗️ Project Structure

```
Auction/
├── client/                # React + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── api/           # Axios API modules
│   │   ├── components/    # Reusable UI + auction + layout components
│   │   ├── contexts/      # AuthContext, SocketContext, ToastContext
│   │   ├── hooks/         # useCountdown, useDebounce
│   │   ├── pages/         # 14 pages
│   │   └── App.tsx        # Router + layout
│   └── package.json
│
├── server/                # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── models/        # MongoDB models (User, Auction, Bid, ...)
│   │   ├── routes/        # REST API routes
│   │   ├── middleware/     # Auth (JWT), Upload, ErrorHandler
│   │   └── socket/        # Bid socket rooms
│   ├── uploads/           # Local image storage
│   └── .env               # Environment variables
└── README.md
```

---

## 📄 Pages

| Route | Page |
|-------|------|
| `/` | Home / Landing |
| `/auctions` | Browse Auctions |
| `/auctions/:id` | Auction Detail |
| `/auctions/create` | Create Listing |
| `/dashboard` | User Dashboard |
| `/messages` | Messages |
| `/notifications` | Notifications |
| `/profile/:id` | User Profile |
| `/settings` | Settings |
| `/login` | Login |
| `/register` | Register |
| `/forgot-password` | Forgot Password |
| `/reset-password` | Reset Password |
| `/watchlist` | Watchlist |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auctions` | List auctions |
| GET | `/api/auctions/featured` | Featured auctions |
| GET | `/api/auctions/:id` | Auction detail |
| POST | `/api/auctions` | Create auction |
| POST | `/api/bids` | Place bid |
| GET | `/api/bids/auction/:id` | Bid history |
| GET | `/api/messages/conversations` | Conversations |
| POST | `/api/messages` | Send message |
| GET | `/api/notifications` | Notifications |
| GET/POST/DELETE | `/api/watchlist` | Watchlist |
| POST | `/api/upload/images` | Upload images |

---

## ⚡ Real-time Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_auction` | Client → Server | Join auction room |
| `new_bid` | Server → Client | New bid placed |
| `join_user` | Client → Server | Join user room |
| `new_message` | Server → Client | New message |
| `typing` | Client → Client | Typing indicator |

---

## 🎨 Design System

- **Primary:** `#FF6B35` (Orange)
- **Secondary:** `#1A1A2E` (Navy)
- **Accent:** `#F7C948` (Gold)
- **Font:** Inter (Google Fonts)

---

## ⚙️ Environment Variables (server/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bidlanka
JWT_SECRET=your-secret-here
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=  # Optional
SMTP_USER=              # Optional (for password reset emails)
```
