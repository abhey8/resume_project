const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const dotnev = require('dotenv').config();
const db = require("./db");
const app = express();
const prisma = new PrismaClient();
require("./db");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Serve React build files if they exist
app.use(express.static('client/build'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Validation helper
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Routes

// Register
app.post('/api/auth/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().trim(),
  validate
], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Listings Routes

// Get all listings with filters
app.get('/api/listings', async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      propertyType,
      listingType,
      city,
      state,
      bedrooms,
      status = 'ACTIVE',
      limit = 50,
      skip = 0,
      userId
    } = req.query;

    const where = {
      status: status
    };

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (propertyType) {
      where.propertyType = propertyType;
    }

    if (listingType) {
      where.listingType = listingType;
    }

    if (city) {
      // MySQL case-insensitive search
      where.city = { contains: city };
    }

    if (state) {
      // MySQL case-insensitive search
      where.state = { contains: state };
    }

    if (bedrooms) {
      where.bedrooms = { gte: parseInt(bedrooms) };
    }

    if (userId) {
      where.ownerId = parseInt(userId);
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await prisma.listing.count({ where });

    res.json({
      listings,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing by ID
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing (protected)
app.post('/api/listings', authenticateToken, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('listingType').isIn(['BUY', 'SELL', 'RENT']).withMessage('Valid listing type required'),
  body('propertyType').notEmpty().withMessage('Property type required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('city').trim().notEmpty().withMessage('City required'),
  body('state').trim().notEmpty().withMessage('State required'),
  validate
], async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      currency = 'INR',
      listingType,
      bedrooms,
      bathrooms,
      areaSqFt,
      propertyType,
      address,
      city,
      state,
      area,
      country = 'India',
      zipCode,
      latitude,
      longitude,
      amenities = [],
      images = []
    } = req.body;

    const listing = await prisma.listing.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price), // Convert to number - Prisma Decimal accepts number or string
        currency: currency || 'INR',
        listingType,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        areaSqFt: areaSqFt ? parseFloat(areaSqFt) : null,
        propertyType,
        address,
        city,
        state,
        area: area || null,
        country,
        zipCode: zipCode || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        amenities: Array.isArray(amenities) ? amenities : [],
        ownerId: req.user.id,
        images: {
          create: images.map(img => ({
            url: typeof img === 'string' ? img : (img.url || ''),
            caption: typeof img === 'object' ? (img.caption || null) : null
          })).filter(img => img.url)
        }
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    console.error('Error stack:', error.stack);
    
    // Handle Prisma validation errors
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: 'A unique constraint violation occurred'
      });
    }
    
    // Handle Prisma field validation errors
    if (error.meta) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.meta.message || error.message
      });
    }
    
    // Return more detailed error message
    const errorMessage = error.message || 'Failed to create listing';
    res.status(500).json({ 
      error: 'Failed to create listing',
      details: errorMessage 
    });
  }
});

// Update listing (protected - only owner)
app.put('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);

    // Check if listing exists and user is owner
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const {
      title,
      description,
      price,
      listingType,
      bedrooms,
      bathrooms,
      areaSqFt,
      propertyType,
      status,
      address,
      city,
      state,
      zipCode,
      latitude,
      longitude,
      amenities
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (listingType !== undefined) updateData.listingType = listingType;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms ? parseInt(bedrooms) : null;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms ? parseInt(bathrooms) : null;
    if (areaSqFt !== undefined) updateData.areaSqFt = areaSqFt ? parseFloat(areaSqFt) : null;
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (status !== undefined) updateData.status = status;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode || null;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (amenities !== undefined) updateData.amenities = Array.isArray(amenities) ? amenities : [];

    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing (protected - only owner)
app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);

    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await prisma.listing.delete({
      where: { id: listingId }
    });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Get user's listings (protected)
app.get('/api/user/listings', authenticateToken, async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { ownerId: req.user.id },
      include: {
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ listings });
  } catch (error) {
    console.error('Error fetching user listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Favorites Routes (protected)

// Add to favorites
app.post('/api/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Create or find favorite
    const favorite = await prisma.favorite.upsert({
      where: {
        userId_listingId: {
          userId: req.user.id,
          listingId: listingId
        }
      },
      update: {},
      create: {
        userId: req.user.id,
        listingId: listingId
      }
    });

    res.status(201).json({ favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
app.delete('/api/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const listingId = parseInt(req.params.listingId);

    await prisma.favorite.deleteMany({
      where: {
        userId: req.user.id,
        listingId: listingId
      }
    });

    res.json({ message: 'Favorite removed' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Get user's favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            images: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Loan Application Routes

// Apply for loan (protected)
app.post('/api/loans/apply', authenticateToken, [
  body('loanAmount').isFloat({ min: 0 }).withMessage('Loan amount must be positive'),
  body('tenure').isInt({ min: 1 }).withMessage('Tenure must be at least 1 month'),
  body('purpose').trim().notEmpty().withMessage('Purpose required'),
  body('employment').trim().notEmpty().withMessage('Employment type required'),
  body('annualIncome').isFloat({ min: 0 }).withMessage('Annual income must be positive'),
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone required'),
  body('address').trim().notEmpty().withMessage('Address required'),
  validate
], async (req, res) => {
  try {
    const {
      listingId,
      loanAmount,
      tenure,
      purpose,
      employment,
      annualIncome,
      name,
      email,
      phone,
      address
    } = req.body;

    const loanApplication = await prisma.loanApplication.create({
      data: {
        userId: req.user.id,
        listingId: listingId ? parseInt(listingId) : null,
        loanAmount: parseFloat(loanAmount),
        tenure: parseInt(tenure),
        purpose,
        employment,
        annualIncome: parseFloat(annualIncome),
        name,
        email,
        phone,
        address,
        status: 'PENDING'
      }
    });

    res.status(201).json({ loanApplication });
  } catch (error) {
    console.error('Error creating loan application:', error);
    res.status(500).json({ error: 'Failed to apply for loan' });
  }
});

// Get user's loan applications (protected)
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      where: { userId: req.user.id },
      include: {
        listing: {
          include: {
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Recommendations
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get user's favorite property types and locations
    const userFavorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        listing: true
      }
    });

    const favoritePropertyTypes = [...new Set(userFavorites.map(f => f.listing.propertyType))];
    const favoriteCities = [...new Set(userFavorites.map(f => f.listing.city))];
    const favoriteStates = [...new Set(userFavorites.map(f => f.listing.state))];

    // Get recommendations based on preferences
    const where = {
      status: 'ACTIVE',
      ownerId: { not: req.user.id } // Exclude user's own listings
    };

    if (favoritePropertyTypes.length > 0) {
      where.propertyType = { in: favoritePropertyTypes };
    }

    const recommendations = await prisma.listing.findMany({
      where,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({ recommendations });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Compare listings
app.post('/api/listings/compare', async (req, res) => {
  try {
    const { listingIds } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 listing IDs required' });
    }

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds.map(id => parseInt(id)) }
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({ listings });
  } catch (error) {
    console.error('Error comparing listings:', error);
    res.status(500).json({ error: 'Failed to compare listings' });
  }
});

// Get cities/states for filters
app.get('/api/locations', async (req, res) => {
  try {
    const cities = await prisma.listing.findMany({
      select: { city: true },
      distinct: ['city']
    });

    const states = await prisma.listing.findMany({
      select: { state: true },
      distinct: ['state']
    });

    res.json({
      cities: cities.map(c => c.city).sort(),
      states: states.map(s => s.state).sort()
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Serve React app for client-side routing (must be last)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const buildPath = path.join(__dirname, 'client', 'build', 'index.html');
    if (fs.existsSync(buildPath)) {
      res.sendFile(buildPath);
    } else {
      res.status(404).json({ error: 'React app not built. Run npm run client:build first.' });
    }
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
