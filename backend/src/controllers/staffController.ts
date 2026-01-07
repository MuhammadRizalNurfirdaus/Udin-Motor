import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Register staff (Cashier or Driver) - Owner only
export const registerStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !name || !role) {
            return res.status(400).json({ error: 'Email, password, nama, dan role wajib diisi' });
        }

        if (!['CASHIER', 'DRIVER'].includes(role)) {
            return res.status(400).json({ error: 'Role harus CASHIER atau DRIVER' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
                role
            }
        });

        res.status(201).json({
            message: `${role === 'CASHIER' ? 'Kasir' : 'Supir'} berhasil didaftarkan`,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Register staff error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mendaftarkan staff' });
    }
};

// Get all staff (Owner only)
export const getAllStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.query;

        const where: any = { role: { in: ['CASHIER', 'DRIVER'] } };
        if (role && ['CASHIER', 'DRIVER'].includes(role as string)) {
            where.role = role;
        }

        const staff = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(staff);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Delete staff (Owner only)
export const deleteStaff = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            return res.status(404).json({ error: 'Staff tidak ditemukan' });
        }

        if (!['CASHIER', 'DRIVER'].includes(user.role)) {
            return res.status(400).json({ error: 'Hanya bisa menghapus kasir atau supir' });
        }

        await prisma.user.delete({ where: { id } });

        res.json({ message: 'Staff berhasil dihapus' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus staff' });
    }
};
