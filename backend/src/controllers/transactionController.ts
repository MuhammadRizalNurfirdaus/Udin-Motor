import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Create transaction (User)
export const createTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { motorId, quantity, paymentMethod, address } = req.body;

        if (!motorId) {
            return res.status(400).json({ error: 'Motor ID wajib diisi' });
        }

        const motor = await prisma.motor.findUnique({ where: { id: motorId } });
        if (!motor) {
            return res.status(404).json({ error: 'Motor tidak ditemukan' });
        }

        const qty = quantity || 1;
        if (motor.stock < qty) {
            return res.status(400).json({ error: 'Stok motor tidak mencukupi' });
        }

        const totalPrice = motor.price * qty;

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user!.id,
                motorId,
                quantity: qty,
                totalPrice,
                paymentMethod: paymentMethod || 'CASH',
                status: 'PENDING'
            },
            include: {
                motor: true,
                user: { select: { id: true, name: true, email: true, phone: true, address: true } }
            }
        });

        // Update stock
        await prisma.motor.update({
            where: { id: motorId },
            data: { stock: { decrement: qty } }
        });

        res.status(201).json({ message: 'Pesanan berhasil dibuat', transaction });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat pesanan' });
    }
};

// Get my transactions (User)
export const getMyTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user!.id },
            include: {
                motor: true,
                delivery: { include: { driver: { select: { name: true, phone: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get my transactions error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get all transactions (Cashier/Owner)
export const getAllTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;

        const where: any = {};
        if (status) where.status = status;

        const transactions = await prisma.transaction.findMany({
            where,
            include: {
                motor: true,
                user: { select: { id: true, name: true, email: true, phone: true, address: true } },
                cashier: { select: { name: true } },
                delivery: { include: { driver: { select: { name: true, phone: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get all transactions error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get pending transactions (Cashier)
export const getPendingTransactions = async (req: AuthRequest, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { status: 'PENDING' },
            include: {
                motor: true,
                user: { select: { id: true, name: true, email: true, phone: true, address: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(transactions);
    } catch (error) {
        console.error('Get pending transactions error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Process transaction / Confirm payment (Cashier)
export const processTransaction = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        }

        const validStatuses = ['PAID', 'PROCESSING', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status tidak valid' });
        }

        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                status,
                cashierId: req.user!.id
            },
            include: {
                motor: true,
                user: { select: { name: true, email: true, phone: true, address: true } }
            }
        });

        // If cancelled, restore stock
        if (status === 'CANCELLED' && transaction.status !== 'CANCELLED') {
            await prisma.motor.update({
                where: { id: transaction.motorId },
                data: { stock: { increment: transaction.quantity } }
            });
        }

        res.json({ message: 'Status transaksi berhasil diupdate', transaction: updated });
    } catch (error) {
        console.error('Process transaction error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat memproses transaksi' });
    }
};

// Assign driver for delivery (Cashier)
export const assignDelivery = async (req: AuthRequest, res: Response) => {
    try {
        const { transactionId, driverId, address } = req.body;

        if (!transactionId || !driverId || !address) {
            return res.status(400).json({ error: 'Transaction ID, Driver ID, dan alamat wajib diisi' });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { delivery: true }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        }

        if (transaction.delivery) {
            return res.status(400).json({ error: 'Transaksi sudah memiliki pengiriman' });
        }

        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver || driver.role !== 'DRIVER') {
            return res.status(400).json({ error: 'Driver tidak ditemukan atau bukan driver' });
        }

        const delivery = await prisma.delivery.create({
            data: {
                transactionId,
                driverId,
                address,
                status: 'PENDING'
            },
            include: {
                driver: { select: { name: true, phone: true } },
                transaction: { include: { motor: true, user: { select: { name: true, phone: true } } } }
            }
        });

        // Update transaction status
        await prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'DELIVERING' }
        });

        res.status(201).json({ message: 'Pengiriman berhasil ditugaskan', delivery });
    } catch (error) {
        console.error('Assign delivery error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menugaskan pengiriman' });
    }
};

// Get transaction stats (Owner)
export const getTransactionStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalTransactions = await prisma.transaction.count();
        const pendingCount = await prisma.transaction.count({ where: { status: 'PENDING' } });
        const completedCount = await prisma.transaction.count({ where: { status: 'COMPLETED' } });

        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] } },
            _sum: { totalPrice: true }
        });

        res.json({
            totalTransactions,
            pendingCount,
            completedCount,
            totalRevenue: totalRevenue._sum.totalPrice || 0
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};
