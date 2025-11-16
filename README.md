# Real Estate Listing Platform

A full-featured real estate platform where users can buy, sell, or rent commercial and residential properties. Built with React, Node.js, Express, Prisma, and MySQL.

## Features

- ✅ **User Authentication**: Register, login, and logout with JWT tokens and bcrypt password hashing
- ✅ **Property Listings**: Create, edit, and delete property listings
- ✅ **Buy/Sell/Rent**: Support for different listing types (Buy, Sell, Rent)
- ✅ **Commercial & Residential**: Support for all property types (Apartments, Houses, Commercial, Offices, etc.)
- ✅ **Advanced Filtering**: Filter by location, price, property type, listing type, bedrooms, etc.
- ✅ **Favorites System**: Save and manage favorite properties
- ✅ **User Dashboard**: Manage your listings in one place
- ✅ **Responsive Design**: Beautiful, modern UI that works on all devices
- ✅ **Protected Routes**: Secure API endpoints with authentication middleware

## Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 6.22.0
- Axios for API calls
- CSS3 with modern design

### Backend
- Node.js
- Express.js 4.21.1
- Prisma ORM
- MySQL Database
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MySQL Server

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd resume_project
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your MySQL database credentials:

```env
DATABASE_URL="mysql://username:password@localhost:3306/real_estate_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
```

### 4. Set up the database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### 5. Install frontend dependencies

```bash
cd client
npm install
cd ..
```

## Running the Application

### Development Mode

#### Start the backend server:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

#### Start the React frontend (in a new terminal):

```bash
npm run client
```

The frontend will run on `http://localhost:3000` (if proxy is set) or `http://localhost:3001`

### Production Mode

#### Build the React app:

```bash
npm run client:build
```

#### Start the production server:

```bash
npm start
```

## Project Structure

```
resume_project/
├── client/                 # React frontend
│   ├── public/            # Public assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React Context (Auth)
│   │   ├── utils/         # Utility functions
│   │   ├── App.js         # Main App component
│   │   └── index.js       # Entry point
│   └── package.json
├── prisma/
│   └── schema.prisma      # Database schema
├── server.js              # Express server
├── package.json           # Backend dependencies
└── .env                   # Environment variables
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Listings
- `GET /api/listings` - Get all listings (with filters)
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)
- `GET /api/user/listings` - Get user's listings (protected)

### Favorites
- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites/:listingId` - Add to favorites (protected)
- `DELETE /api/favorites/:listingId` - Remove from favorites (protected)

### Locations
- `GET /api/locations` - Get cities and states for filters

## Database Schema

### User
- id, name, email, password, phone, role, createdAt, updatedAt

### Listing
- id, title, description, price, currency, listingType, propertyType, status
- bedrooms, bathrooms, areaSqFt
- address, city, state, country, zipCode, latitude, longitude
- amenities (JSON), ownerId, createdAt, updatedAt

### Image
- id, url, caption, listingId, createdAt

### Favorite
- id, userId, listingId, createdAt

## Usage

1. **Register an account** or login if you already have one
2. **Browse properties** on the home page with advanced filters
3. **Create listings** from your dashboard
4. **Manage your listings** - edit, delete, or update status
5. **Save favorites** by clicking the favorite button on any listing
6. **Contact owners** directly through listing details

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Input validation with express-validator
- SQL injection prevention with Prisma ORM
- XSS protection with React's built-in escaping

## Contributing

This is a resume project. Feel free to fork and customize it for your needs.

## License

ISC

## Author

Built for resume/portfolio showcase.

---

**Note**: Make sure to change the `JWT_SECRET` in production and use a strong, unique value. Also, update the database URL with your actual MySQL credentials.

