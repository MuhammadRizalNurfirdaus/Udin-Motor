import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Register staff (Cashier or Driver) - Owner only
export const registerStaff: RequestHandler = async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;

        if (!email || !password || !name || !role) {
            res.status(400).json({ error: 'Email, password, nama, dan role wajib diisi' });
            return;
        }

        if (!['CASHIER', 'DRIVER'].includes(role)) {
            res.status(400).json({ error: 'Role harus CASHIER atau DRIVER' });
            return;
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email sudah terdaftar' });
            return;
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
export const getAllStaff: RequestHandler = async (req, res) => {
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
export const deleteStaff: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id } });

        if (!user) {
            res.status(404).json({ error: 'Staff tidak ditemukan' });
            return;
        }

        if (!['CASHIER', 'DRIVER'].includes(user.role)) {
            res.status(400).json({ error: 'Hanya bisa menghapus kasir atau supir' });
            return;
        }

        await prisma.user.delete({ where: { id } });

        res.json({ message: 'Staff berhasil dihapus' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus staff' });
    }
};
