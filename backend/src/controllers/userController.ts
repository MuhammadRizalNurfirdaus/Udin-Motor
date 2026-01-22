import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';

const prisma = new PrismaClient();

// Multer config for profile images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const uploadProfile = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed'));
    }
});

// Get all users (Owner only)
export const getAllUsers: RequestHandler = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { role: 'USER' },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                createdAt: true,
                _count: { select: { transactions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get current user profile
export const getProfile: RequestHandler = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                profileImage: true,
                province: true,
                city: true,
                district: true,
                village: true,
                postalCode: true,
                googleId: true,
                createdAt: true
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User tidak ditemukan' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Update user profile
export const updateProfile: RequestHandler = async (req, res) => {
    try {
        const {
            name,
            phone,
            address,
            province,
            city,
            district,
            village,
            postalCode,
            currentPassword,
            newPassword
        } = req.body;

        const userId = req.user!.id;

        // Get current user
        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!currentUser) {
            res.status(404).json({ error: 'User tidak ditemukan' });
            return;
        }

        // Prepare update data
        const updateData: any = {
            name,
            phone,
            address,
            province,
            city,
            district,
            village,
            postalCode
        };

        // Handle password change
        if (newPassword) {
            // If user has a password (not Google-only), verify current password
            if (currentUser.password && !currentPassword) {
                res.status(400).json({ error: 'Password lama wajib diisi' });
                return;
            }

            if (currentUser.password) {
                const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password);
                if (!isValidPassword) {
                    res.status(400).json({ error: 'Password lama tidak sesuai' });
                    return;
                }
            }

            // Hash new password
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                address: true,
                profileImage: true,
                province: true,
                city: true,
                district: true,
                village: true,
                postalCode: true,
                createdAt: true
            }
        });

        res.json({ message: 'Profil berhasil diperbarui', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Upload profile image
export const uploadProfileImage: RequestHandler = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'File gambar wajib diupload' });
            return;
        }

        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { profileImage: imageUrl },
            select: {
                id: true,
                profileImage: true
            }
        });

        res.json({ message: 'Foto profil berhasil diupload', profileImage: user.profileImage });
    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get dashboard stats (Owner)
export const getDashboardStats: RequestHandler = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalCashiers = await prisma.user.count({ where: { role: 'CASHIER' } });
        const totalDrivers = await prisma.user.count({ where: { role: 'DRIVER' } });
        const totalMotors = await prisma.motor.count();
        const totalTransactions = await prisma.transaction.count();

        const revenue = await prisma.transaction.aggregate({
            where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] } },
            _sum: { totalPrice: true }
        });

        const pendingTransactions = await prisma.transaction.count({ where: { status: 'PENDING' } });
        const activeDeliveries = await prisma.delivery.count({
            where: { status: { in: ['PENDING', 'PICKED_UP', 'ON_THE_WAY'] } }
        });

        res.json({
            totalUsers,
            totalCashiers,
            totalDrivers,
            totalMotors,
            totalTransactions,
            totalRevenue: revenue._sum.totalPrice || 0,
            pendingTransactions,
            activeDeliveries
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Get financial reports (Owner)
export const getFinancialReports: RequestHandler = async (req, res) => {
    try {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Get monthly sales data for the current year
        const monthlySales = [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = new Date(currentYear, month + 1, 0, 23, 59, 59);

            const monthlyRevenue = await prisma.transaction.aggregate({
                where: {
                    status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] },
                    createdAt: { gte: startDate, lte: endDate }
                },
                _sum: { totalPrice: true },
                _count: true
            });

            monthlySales.push({
                month: monthNames[month],
                revenue: monthlyRevenue._sum.totalPrice || 0,
                transactions: monthlyRevenue._count || 0
            });
        }

        // Get sales by status
        const statusCounts = await prisma.transaction.groupBy({
            by: ['status'],
            _count: true,
            _sum: { totalPrice: true }
        });

        // Get top selling motors
        const topMotors = await prisma.transaction.groupBy({
            by: ['motorId'],
            where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] } },
            _count: true,
            _sum: { totalPrice: true },
            orderBy: { _count: { motorId: 'desc' } },
            take: 5
        });

        // Get motor details for top selling
        const topMotorsWithDetails = await Promise.all(
            topMotors.map(async (item) => {
                const motor = await prisma.motor.findUnique({
                    where: { id: item.motorId },
                    select: { name: true, brand: true, price: true }
                });
                return {
                    motor: motor?.name || 'Unknown',
                    brand: motor?.brand || 'Unknown',
                    unitPrice: motor?.price || 0,
                    soldCount: item._count,
                    totalRevenue: item._sum.totalPrice || 0
                };
            })
        );

        // Calculate totals
        const totalRevenue = await prisma.transaction.aggregate({
            where: { status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] } },
            _sum: { totalPrice: true },
            _count: true
        });

        // Calculate estimated profit (assuming 15% profit margin)
        const profitMargin = 0.15;
        const estimatedProfit = (totalRevenue._sum.totalPrice || 0) * profitMargin;
        const estimatedCost = (totalRevenue._sum.totalPrice || 0) * (1 - profitMargin);

        // Get this month's data
        const thisMonthStart = new Date(currentYear, now.getMonth(), 1);
        const thisMonthEnd = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59);

        const thisMonthRevenue = await prisma.transaction.aggregate({
            where: {
                status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] },
                createdAt: { gte: thisMonthStart, lte: thisMonthEnd }
            },
            _sum: { totalPrice: true },
            _count: true
        });

        // Get last month's data for comparison
        const lastMonthStart = new Date(currentYear, now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(currentYear, now.getMonth(), 0, 23, 59, 59);

        const lastMonthRevenue = await prisma.transaction.aggregate({
            where: {
                status: { in: ['PAID', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'COMPLETED'] },
                createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
            },
            _sum: { totalPrice: true }
        });

        // Calculate growth percentage
        const lastMonthTotal = lastMonthRevenue._sum.totalPrice || 0;
        const thisMonthTotal = thisMonthRevenue._sum.totalPrice || 0;
        const growthPercentage = lastMonthTotal > 0
            ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
            : 0;

        res.json({
            summary: {
                totalRevenue: totalRevenue._sum.totalPrice || 0,
                totalTransactions: totalRevenue._count || 0,
                estimatedProfit,
                estimatedCost,
                profitMargin: profitMargin * 100,
                thisMonthRevenue: thisMonthTotal,
                thisMonthTransactions: thisMonthRevenue._count || 0,
                lastMonthRevenue: lastMonthTotal,
                growthPercentage: Math.round(growthPercentage * 100) / 100
            },
            monthlySales,
            salesByStatus: statusCounts.map(item => ({
                status: item.status,
                count: item._count,
                revenue: item._sum.totalPrice || 0
            })),
            topSellingMotors: topMotorsWithDetails
        });
    } catch (error) {
        console.error('Get financial reports error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};


// Get monthly sales data for the current year

