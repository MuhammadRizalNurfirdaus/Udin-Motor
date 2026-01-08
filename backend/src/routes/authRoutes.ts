import { Router } from 'express';
import passport from 'passport';
import { register, login, googleCallback, getMe, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Register (User only)
router.post('/register', register);

// Login
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
    googleCallback
);

// Get current user (authenticated)
router.get('/me', authenticateToken, getMe);

// Update profile (authenticated)
router.put('/profile', authenticateToken, updateProfile);

export default router;
