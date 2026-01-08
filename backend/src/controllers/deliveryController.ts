import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get my deliveries (Driver)
export const getMyDeliveries: RequestHandler = async (req, res) => {
    try {
        const { status } = req.query;

        const where: any = { driverId: req.user!.id };
        if (status) where.status = status;

        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                transaction: {
                    include: {
                        motor: true,
                        user: { select: { name: true, phone: true, address: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(deliveries);
    } catch (error) {
        console.error('Get my deliveries error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get all deliveries (Owner/Cashier)
export const getAllDeliveries: RequestHandler = async (req, res) => {
    try {
        const { status } = req.query;

        const where: any = {};
        if (status) where.status = status;

        const deliveries = await prisma.delivery.findMany({
            where,
            include: {
                driver: { select: { name: true, phone: true } },
                transaction: {
                    include: {
                        motor: true,
                        user: { select: { name: true, phone: true, address: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(deliveries);
    } catch (error) {
        console.error('Get all deliveries error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Update delivery status (Driver)
export const updateDeliveryStatus: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const delivery = await prisma.delivery.findUnique({ where: { id } });

        if (!delivery) {
            res.status(404).json({ error: 'Pengiriman tidak ditemukan' });
            return;
        }

        if (delivery.driverId !== req.user!.id) {
            res.status(403).json({ error: 'Anda tidak berhak mengupdate pengiriman ini' });
            return;
        }

        const validStatuses = ['PENDING', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Status tidak valid' });
            return;
        }

        const updateData: any = { status, notes };
        if (status === 'DELIVERED') {
            updateData.deliveredAt = new Date();
        }

        const updated = await prisma.delivery.update({
            where: { id },
            data: updateData,
            include: {
                transaction: { include: { motor: true, user: { select: { name: true, phone: true } } } }
            }
        });

        // Update transaction status if delivered
        if (status === 'DELIVERED') {
            await prisma.transaction.update({
                where: { id: delivery.transactionId },
                data: { status: 'DELIVERED' }
            });
        }

        res.json({ message: 'Status pengiriman berhasil diupdate', delivery: updated });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat update status pengiriman' });
    }
};

// Complete delivery (Driver marks as complete / User confirms)
export const completeDelivery: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: { transaction: true }
        });

        if (!delivery) {
            res.status(404).json({ error: 'Pengiriman tidak ditemukan' });
            return;
        }

        if (delivery.status !== 'DELIVERED') {
            res.status(400).json({ error: 'Pengiriman belum sampai' });
            return;
        }

        // Update transaction to completed
        await prisma.transaction.update({
            where: { id: delivery.transactionId },
            data: { status: 'COMPLETED' }
        });

        res.json({ message: 'Pengiriman selesai, transaksi berhasil diselesaikan' });
    } catch (error) {
        console.error('Complete delivery error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get drivers list (for assignment)
export const getDrivers: RequestHandler = async (req, res) => {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { id: true, name: true, phone: true }
        });

        res.json(drivers);
    } catch (error) {
        console.error('Get drivers error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};
