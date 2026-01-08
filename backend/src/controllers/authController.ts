import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import '../types/express';

const prisma = new PrismaClient();

const generateToken = (user: { id: string; email: string; role: string }) => {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, phone, address } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, dan nama wajib diisi' });
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
                address,
                role: 'USER'
            }
        });

        const token = generateToken(user);

        res.status(201).json({
            message: 'Registrasi berhasil',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'Email tidak terdaftar' });
        }

        if (!user.password) {
            return res.status(401).json({ error: 'Akun ini menggunakan Google login' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Password salah' });
        }

        const token = generateToken(user);

        res.json({
            message: 'Login berhasil',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const user = req.user as any;

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const token = generateToken(user);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

export const getMe: RequestHandler = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                createdAt: true
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User tidak ditemukan' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

export const updateProfile: RequestHandler = async (req, res) => {
    try {
        const { name, phone, address } = req.body;

        const user = await prisma.user.update({
            where: { id: req.user!.id },
            data: { name, phone, address },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true
            }
        });

        res.json({ message: 'Profil berhasil diupdate', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat update profil' });
    }
};
