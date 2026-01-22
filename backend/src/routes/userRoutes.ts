import { Router } from 'express';
import { getAllUsers, getDashboardStats, getFinancialReports, getProfile, updateProfile, uploadProfileImage, uploadProfile } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Profile routes (any authenticated user)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/profile/image', authenticateToken, uploadProfile.single('image'), uploadProfileImage);

// Owner only routes
router.get('/', authenticateToken, requireRole('OWNER'), getAllUsers);
router.get('/dashboard', authenticateToken, requireRole('OWNER'), getDashboardStats);
router.get('/reports', authenticateToken, requireRole('OWNER'), getFinancialReports);

export default router;

