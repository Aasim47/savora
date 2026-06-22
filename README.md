# Bhojanwale 🍲

Bhojanwale is a full-stack, real-time food delivery web application designed to bring "Ghar Jaisa Swaad" (Home-like Taste) right to your doorstep. It features a complete customer ordering experience and a powerful administrative dashboard, all synced seamlessly in real-time.

## 🚀 Features

### Customer Experience
* **Restaurant & Menu Browsing**: Browse live restaurants and beautifully structured menus with real-time caching for lightning-fast speeds.
* **Smart Cart Management**: Smooth cart interactions with dynamic item quantities and real-time subtotal tracking.
* **Promo Codes**: Apply dynamic promo codes for flat or percentage-based discounts.
* **Real-time Order Tracking**: Watch your order progress from "Pending" to "Out for Delivery" with live WebSocket updates—no refreshing needed!
* **Dynamic Delivery Fees**: Delivery fees are auto-calculated based on distance (First 2km free!).
* **Digital Receipts**: Get beautifully formatted digital receipts for past orders.

### Administrative Powerhouse
* **Real-time Order Dashboard**: Get instant alerts (with audio notifications!) the moment a new order is placed.
* **Restaurant Management**: Add, update, or disable restaurants, and upload their images securely via ImgBB.
* **Menu Engineering**: Manage categories and specific menu items, mark them as sold out, or update pricing on the fly.
* **Distance Calculations**: Calculate and set delivery distances for new orders before accepting them.
* **User & Promo Management**: View customer statistics and create expiring or limited-use promotional codes.

## 🛠 Tech Stack

### Frontend (`savora-frontend`)
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Framer Motion (for buttery smooth micro-animations)
* **Icons**: [Lucide React](https://lucide.dev/)
* **State Management**: React Context API
* **Real-time**: Socket.io-client
* **HTTP Client**: Axios (with custom global interceptors for auth and rate limits)

### Backend (`savora-backend`)
* **Server**: Node.js & [Express.js](https://expressjs.com/)
* **Database**: PostgreSQL (hosted on [Neon](https://neon.tech/))
* **ORM**: [Prisma](https://www.prisma.io/) (Highly optimized with strict foreign key indexing)
* **Real-time**: Socket.io
* **Authentication**: JSON Web Tokens (JWT)
* **Caching**: Node-Cache (In-memory LRU cache for high-traffic routes)
* **Image Hosting**: ImgBB API Integration
* **Security**: Helmet, CORS, and Express-Rate-Limit

## 💻 Local Development Setup

To run this application locally, you will need Node.js and PostgreSQL installed.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/savora.git
cd savora
```

### 2. Backend Setup
```bash
cd savora-backend
npm install
```

Create a `.env` file in `savora-backend` with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/savora"
JWT_SECRET="your_super_secret_key"
FRONTEND_URL="http://localhost:3000"
IMGBB_API_KEY="your_imgbb_api_key_here"
PORT=5000
```

Run the database migrations and start the server:
```bash
npx prisma db push
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd savora-frontend
npm install
```

Create a `.env.local` file in `savora-frontend` with:
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Start the frontend development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to view the customer app, and `http://localhost:3000/login?role=admin` to access the admin dashboard.

## ☁️ Production Deployment

### Backend (Railway/Render)
1. Set the `DATABASE_URL` to your production Postgres instance (e.g., Neon).
2. Set `FRONTEND_URL` to your live Netlify domain.
3. Add a build script: `"build": "tsc && npx prisma generate"`
4. Run migrations on deployment using `"postbuild": "npx prisma migrate deploy"`

### Frontend (Netlify/Vercel)
1. Set `NEXT_PUBLIC_API_URL` to your live Railway backend URL.
2. Ensure you append `/api` to the URL.
3. The app is fully optimized for static generation and edge caching out of the box.

## 🛡 Performance & Security
- **Global Error Handling**: Prevents sensitive database stack traces from leaking to the frontend.
- **Rate Limiting**: Protects against brute-force and DDoS attacks (1000 requests / 15 mins).
- **In-Memory Caching**: 99% reduction in DB queries for public restaurant/menu endpoints.
- **Foreign Key Indexing**: Deeply optimized Prisma schema prevents CPU-spiking full table scans during heavy load.

---
Built with ❤️ for incredible food and seamless user experiences.
