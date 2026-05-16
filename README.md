# Smart Artisan Assistant

A production-ready MERN stack web application for local artisans to manage production, materials, earnings, and payments with AI-powered product analysis.

## Tech Stack

**Frontend:** React + Vite, Tailwind CSS, React Router, Recharts, Context API  
**Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Passport.js (Google OAuth), Multer  
**Database:** MongoDB Atlas

---

## Project Structure

```
TeamBz/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and Passport config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth, admin, upload, error handler
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API route definitions
│   │   ├── uploads/         # Uploaded images
│   │   ├── utils/           # Token generator, seed script
│   │   └── server.js        # Express entry point
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context provider
│   │   ├── layouts/         # Dashboard and Auth layouts
│   │   ├── pages/           # All page components
│   │   ├── routes/          # Route configuration
│   │   ├── services/        # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── render.yaml
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project (for OAuth)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend (.env):**

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

**Frontend (.env):**

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Seed admin account

```bash
cd backend
npm run seed
```

This creates an admin account:
- **Email:** admin@artisan.com
- **Password:** admin123

### 4. Run the application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Features

- **Authentication:** Email/password and Google OAuth login
- **Dashboard:** Stats cards, weekly summary, monthly charts
- **Production Management:** Full CRUD for production entries
- **Payments:** Track received and pending payments
- **Reports:** Weekly/monthly charts, profit analysis, top products
- **AI Product Analyzer:** Upload product images for quality and pricing analysis
- **Admin Panel:** User management, platform analytics
- **Role-based Access:** User and Admin roles

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login with email/password |
| POST | /api/auth/google/login | Public | Google OAuth login |
| GET | /api/auth/profile | User | Get current profile |
| PUT | /api/auth/profile | User | Update profile |
| GET | /api/production | User | Get all production entries |
| POST | /api/production | User | Create production entry |
| PUT | /api/production/:id | User | Update production entry |
| DELETE | /api/production/:id | User | Delete production entry |
| GET | /api/payments | User | Get all payments |
| POST | /api/payments | User | Create payment |
| PUT | /api/payments/:id | User | Update payment |
| DELETE | /api/payments/:id | User | Delete payment |
| GET | /api/reports/dashboard | User | Dashboard statistics |
| GET | /api/reports/weekly | User | Weekly summary |
| GET | /api/reports/monthly | User | Monthly summary |
| POST | /api/ai/analyze | User | Analyze product image |
| GET | /api/admin/users | Admin | Get all users |
| DELETE | /api/admin/users/:id | Admin | Delete user |
| GET | /api/admin/analytics | Admin | Platform analytics |
| GET | /api/admin/production | Admin | All production entries |

---

## Deployment on Render

### Backend (Web Service)

1. Create a new **Web Service** on Render
2. Connect your repository
3. Set **Root Directory** to `backend`
4. Set **Build Command** to `npm install`
5. Set **Start Command** to `npm start`
6. Add environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A secure random string
   - `NODE_ENV` - `production`
   - `CORS_ORIGIN` - Your frontend Render URL
   - `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret

### Frontend (Static Site)

1. Create a new **Static Site** on Render
2. Connect your repository
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm install && npm run build`
5. Set **Publish Directory** to `dist`
6. Add a rewrite rule: `/*` -> `/index.html`
7. Add environment variables:
   - `VITE_API_URL` - Your backend Render URL + `/api`
   - `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth client ID

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-backend.onrender.com/api/auth/google/callback` (production)
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://your-frontend.onrender.com` (production)

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a cluster (free tier available)
3. Create a database user
4. Whitelist IP address (use `0.0.0.0/0` for Render)
5. Get connection string and add to backend `.env`

---

## Default Accounts

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@artisan.com | admin123 |

Change these credentials in production.

---

## License

This project is for educational purposes.
