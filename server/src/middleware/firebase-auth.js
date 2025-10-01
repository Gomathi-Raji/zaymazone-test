import jwt from 'jsonwebtoken';
import { verifyFirebaseToken } from '../lib/firebase-admin.js';
import User from '../models/User.js';

// Middleware to authenticate requests with Firebase tokens or JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    
    // Try Firebase token first (preferred method)
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      
      // Find or create user in MongoDB based on Firebase UID
      let user = await User.findOne({ firebaseUid: firebaseUser.uid });
      
      if (!user) {
        // Create new user from Firebase data
        user = new User({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.name || firebaseUser.email.split('@')[0],
          avatar: firebaseUser.picture || '',
          authProvider: 'firebase',
          isEmailVerified: firebaseUser.emailVerified || false,
          lastLogin: new Date()
        });
        await user.save();
      } else {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      }
      
      req.user = user;
      req.firebaseUser = firebaseUser;
      return next();
      
    } catch (firebaseError) {
      // If Firebase token verification fails, try JWT token (for backward compatibility)
      try {
        if (!process.env.JWT_SECRET) {
          throw new Error('JWT_SECRET not configured');
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isActive) {
          return res.status(401).json({ error: 'User not found or inactive' });
        }
        
        req.user = user;
        return next();
        
      } catch (jwtError) {
        console.log('Token verification failed:', { firebase: firebaseError.message, jwt: jwtError.message });
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional authentication - continues even if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }
    
    const token = authHeader.substring(7);
    
    // Try Firebase token first
    try {
      const firebaseUser = await verifyFirebaseToken(token);
      const user = await User.findOne({ firebaseUid: firebaseUser.uid });
      
      if (user) {
        req.user = user;
        req.firebaseUser = firebaseUser;
      }
      
    } catch (firebaseError) {
      // Try JWT token
      try {
        if (process.env.JWT_SECRET) {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.userId);
          
          if (user && user.isActive) {
            req.user = user;
          }
        }
      } catch (jwtError) {
        // Continue without user
      }
    }
    
    return next();
    
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    return next(); // Continue even on error
  }
};

export {
  authenticateToken,
  optionalAuth,
  authenticateToken as requireAuth // Alias for backward compatibility
};