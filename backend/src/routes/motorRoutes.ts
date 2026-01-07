import { Router } from 'express';
import {
    getAllMotors,
    getMotorById,
    createMotor,
    updateMotor,
    deleteMotor,
    getBrands
} from '../controllers/motorController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getAllMotors);
router.get('/brands', getBrands);
router.get('/:id', getMotorById);

// Owner only routes
router.post('/', authenticateToken, requireRole('OWNER'), createMotor);
router.put('/:id', authenticateToken, requireRole('OWNER'), updateMotor);
router.delete('/:id', authenticateToken, requireRole('OWNER'), deleteMotor);

export default router;
