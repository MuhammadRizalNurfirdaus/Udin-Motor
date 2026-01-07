import { Router } from 'express';
import {
    getMyDeliveries,
    getAllDeliveries,
    updateDeliveryStatus,
    completeDelivery,
    getDrivers
} from '../controllers/deliveryController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Driver routes
router.get('/my', authenticateToken, requireRole('DRIVER'), getMyDeliveries);
router.put('/:id/status', authenticateToken, requireRole('DRIVER'), updateDeliveryStatus);

// Cashier/Owner routes
router.get('/', authenticateToken, requireRole('OWNER', 'CASHIER'), getAllDeliveries);
router.get('/drivers', authenticateToken, requireRole('OWNER', 'CASHIER'), getDrivers);
router.put('/:id/complete', authenticateToken, completeDelivery);

export default router;
