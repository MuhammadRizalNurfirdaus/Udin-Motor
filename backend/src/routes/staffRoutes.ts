import { Router } from 'express';
import { registerStaff, getAllStaff, deleteStaff } from '../controllers/staffController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Owner only routes
router.post('/register', authenticateToken, requireRole('OWNER'), registerStaff);
router.get('/', authenticateToken, requireRole('OWNER'), getAllStaff);
router.delete('/:id', authenticateToken, requireRole('OWNER'), deleteStaff);

export default router;
