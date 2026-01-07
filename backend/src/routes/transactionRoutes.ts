import { Router } from 'express';
import {
    createTransaction,
    getMyTransactions,
    getAllTransactions,
    getPendingTransactions,
    processTransaction,
    assignDelivery,
    getTransactionStats
} from '../controllers/transactionController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

// User routes
router.post('/', authenticateToken, requireRole('USER'), createTransaction);
router.get('/my', authenticateToken, getMyTransactions);

// Cashier routes
router.get('/pending', authenticateToken, requireRole('CASHIER', 'OWNER'), getPendingTransactions);
router.put('/:id/process', authenticateToken, requireRole('CASHIER', 'OWNER'), processTransaction);
router.post('/assign-delivery', authenticateToken, requireRole('CASHIER', 'OWNER'), assignDelivery);

// Owner routes
router.get('/', authenticateToken, requireRole('OWNER', 'CASHIER'), getAllTransactions);
router.get('/stats', authenticateToken, requireRole('OWNER'), getTransactionStats);

export default router;
