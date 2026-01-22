import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate Virtual Account Number
const generateVirtualAccount = (bankCode: string) => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${bankCode}${timestamp}${random}`;
};

// Create transaction (User)
export const createTransaction: RequestHandler = async (req, res) => {
    try {
        const {
            motorId,
            quantity,
            paymentMethod,
            shippingAddress,
            shippingProvince,
            shippingCity,
            shippingDistrict,
            shippingVillage,
            shippingPostalCode,
            shippingPhone,
            latitude,
            longitude
        } = req.body;

        if (!motorId) {
            res.status(400).json({ error: 'Motor ID wajib diisi' });
            return;
        }

        if (!shippingAddress || !shippingProvince || !shippingCity || !shippingPhone) {
            res.status(400).json({ error: 'Alamat, provinsi, kota, dan nomor HP wajib diisi' });
            return;
        }

        const motor = await prisma.motor.findUnique({ where: { id: motorId } });
        if (!motor) {
            res.status(404).json({ error: 'Motor tidak ditemukan' });
            return;
        }

        const qty = quantity || 1;
        if (motor.stock < qty) {
            res.status(400).json({ error: 'Stok motor tidak mencukupi' });
            return;
        }

        // Kuningan area bounds (approximate)
        const KUNINGAN_BOUNDS = {
            minLat: -7.15,
            maxLat: -6.75,
            minLng: 108.25,
            maxLng: 108.75
        };

        // Check if GPS coordinates are within Kuningan area
        const isGpsInKuningan = latitude && longitude &&
            latitude >= KUNINGAN_BOUNDS.minLat &&
            latitude <= KUNINGAN_BOUNDS.maxLat &&
            longitude >= KUNINGAN_BOUNDS.minLng &&
            longitude <= KUNINGAN_BOUNDS.maxLng;

        // Calculate shipping cost (free for Kuningan area - by city name OR GPS)
        const isKuninganByCity = shippingCity?.toLowerCase().includes('kuningan');
        const isKuninganArea = isKuninganByCity || isGpsInKuningan;
        const shippingCost = isKuninganArea ? 0 : 500000;
        const totalPrice = (motor.price * qty) + shippingCost;

        // Real bank account numbers
        const bankAccounts: Record<string, { number: string; name: string }> = {
            'BANK_BCA': { number: '5270424224', name: 'UDIN MOTOR INDONESIA' },
            'BANK_BNI': { number: '1234567890', name: 'UDIN MOTOR INDONESIA' },
            'BANK_BRI': { number: '032101003456789', name: 'UDIN MOTOR INDONESIA' },
            'BANK_MANDIRI': { number: '1370012345678', name: 'UDIN MOTOR INDONESIA' }
        };

        let accountNumber: string | null = null;
        let accountName: string | null = null;

        if (paymentMethod && paymentMethod.startsWith('BANK_')) {
            const bankInfo = bankAccounts[paymentMethod];
            if (bankInfo) {
                accountNumber = bankInfo.number;
                accountName = bankInfo.name;
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user!.id,
                motorId,
                quantity: qty,
                totalPrice,
                paymentMethod: paymentMethod || 'COD',
                status: 'PENDING',
                shippingAddress,
                shippingProvince,
                shippingCity,
                shippingDistrict,
                shippingVillage,
                shippingPostalCode,
                shippingPhone,
                latitude: latitude || null,
                longitude: longitude || null,
                virtualAccount: accountNumber
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

        res.status(201).json({
            message: 'Pesanan berhasil dibuat',
            transaction,
            shippingCost,
            isKuninganArea,
            virtualAccount: accountNumber ? {
                number: accountNumber,
                bank: paymentMethod?.replace('BANK_', ''),
                name: accountName,
                amount: totalPrice,
                expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            } : null
        });
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat membuat pesanan' });
    }
};


// Get my transactions (User)
export const getMyTransactions: RequestHandler = async (req, res) => {
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
export const getAllTransactions: RequestHandler = async (req, res) => {
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
export const getPendingTransactions: RequestHandler = async (req, res) => {
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
export const processTransaction: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const transaction = await prisma.transaction.findUnique({ where: { id } });
        if (!transaction) {
            res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            return;
        }

        const validStatuses = ['PAID', 'PROCESSING', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Status tidak valid' });
            return;
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
export const assignDelivery: RequestHandler = async (req, res) => {
    try {
        const { transactionId, driverId, address } = req.body;

        if (!transactionId || !driverId || !address) {
            res.status(400).json({ error: 'Transaction ID, Driver ID, dan alamat wajib diisi' });
            return;
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { delivery: true }
        });

        if (!transaction) {
            res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            return;
        }

        if (transaction.delivery) {
            res.status(400).json({ error: 'Transaksi sudah memiliki pengiriman' });
            return;
        }

        const driver = await prisma.user.findUnique({ where: { id: driverId } });
        if (!driver || driver.role !== 'DRIVER') {
            res.status(400).json({ error: 'Driver tidak ditemukan atau bukan driver' });
            return;
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
export const getTransactionStats: RequestHandler = async (req, res) => {
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
