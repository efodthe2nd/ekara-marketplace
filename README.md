# Spare Parts Marketplace

A full-stack e-commerce platform for trading vehicle spare parts with bidding capabilities, product listings, user profiles, and more.

## 📋 Overview

This marketplace application provides a complete solution for buying and selling spare parts. It features user authentication, product listings with categories, a bidding system, order management, and user reviews.

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **File Storage**: Vercel Blob Storage
- **Scheduling**: node-cron for bid management

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Context API
- **Form Validation**: Zod
- **API Integration**: Axios

## 🏗️ Project Structure

```
spareparts-marketplace/
├── backend/               # Express.js API server
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── dto/           # Data transfer objects
│   │   ├── entities/      # Database models
│   │   ├── middleware/    # Express middleware
│   │   ├── migrations/    # Database migrations
│   │   ├── routes/        # API routes
│   │   ├── schedulers/    # Cron jobs for bids
│   │   ├── services/      # Business logic
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── uploads/           # Local file storage
├── frontend/              # Next.js client
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context providers
│   │   ├── lib/           # Utility functions
│   │   ├── styles/        # Global styles
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── shared/                # Shared code between front and backend
└── docs/                  # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v15 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spareparts-marketplace
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` in both backend and frontend directories
   - Update the values as needed

4. **Set up the database**
   ```bash
   cd backend
   npm run migration:run
   ```

### Development

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api

## 🔑 Key Features

- **User Authentication**: Register, login, and profile management
- **Product Listings**: Browse, search, and filter products
- **Category Navigation**: Organize products by categories
- **Bidding System**: Create and participate in timed auctions
- **Order Management**: Purchase tracking and history
- **Review System**: Rate sellers and products
- **Admin Dashboard**: Manage users, products, and orders

## 📦 API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user
- `POST /api/auth/login` - Authenticate user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create a new category

### Orders
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create a new order

### Bids
- `GET /api/bids` - List active bids
- `POST /api/bids` - Place a bid
- `GET /api/bids/listings` - Get bid listings

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create a review

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🚢 Deployment

The application is designed to be deployed on:
- Backend: Docker container or Node.js hosting
- Frontend: Vercel or any static hosting provider
- Database: Managed PostgreSQL service

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request