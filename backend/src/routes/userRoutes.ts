import { Router } from 'express';
import { getAllUsers, getDashboardStats, getFinancialReports } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Owner only routes
router.get('/', authenticateToken, requireRole('OWNER'), getAllUsers);
router.get('/dashboard', authenticateToken, requireRole('OWNER'), getDashboardStats);
router.get('/reports', authenticateToken, requireRole('OWNER'), getFinancialReports);

export default router;
