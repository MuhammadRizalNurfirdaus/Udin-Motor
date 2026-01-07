import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get all motors (public)
export const getAllMotors = async (req: Request, res: Response) => {
    try {
        const { brand, minPrice, maxPrice, search } = req.query;

        const where: any = {};

        if (brand) where.brand = brand;
        if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice as string) };
        if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice as string) };
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { brand: { contains: search as string, mode: 'insensitive' } },
                { model: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const motors = await prisma.motor.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        res.json(motors);
    } catch (error) {
        console.error('Get motors error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data motor' });
    }
};

// Get motor by ID (public)
export const getMotorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const motor = await prisma.motor.findUnique({ where: { id } });

        if (!motor) {
            return res.status(404).json({ error: 'Motor tidak ditemukan' });
        }

        res.json(motor);
    } catch (error) {
        console.error('Get motor error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};

// Create motor (Owner only)
export const createMotor = async (req: AuthRequest, res: Response) => {
    try {
        const { name, brand, model, year, price, stock, image, description } = req.body;

        if (!name || !brand || !model || !year || !price) {
            return res.status(400).json({ error: 'Nama, brand, model, tahun, dan harga wajib diisi' });
        }

        const motor = await prisma.motor.create({
            data: {
                name,
                brand,
                model,
                year: parseInt(year),
                price: parseFloat(price),
                stock: parseInt(stock) || 0,
                image,
                description
            }
        });

        res.status(201).json({ message: 'Motor berhasil ditambahkan', motor });
    } catch (error) {
        console.error('Create motor error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menambah motor' });
    }
};

// Update motor (Owner only)
export const updateMotor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, brand, model, year, price, stock, image, description } = req.body;

        const existingMotor = await prisma.motor.findUnique({ where: { id } });
        if (!existingMotor) {
            return res.status(404).json({ error: 'Motor tidak ditemukan' });
        }

        const motor = await prisma.motor.update({
            where: { id },
            data: {
                name,
                brand,
                model,
                year: year ? parseInt(year) : undefined,
                price: price ? parseFloat(price) : undefined,
                stock: stock !== undefined ? parseInt(stock) : undefined,
                image,
                description
            }
        });

        res.json({ message: 'Motor berhasil diupdate', motor });
    } catch (error) {
        console.error('Update motor error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat update motor' });
    }
};

// Delete motor (Owner only)
export const deleteMotor = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const existingMotor = await prisma.motor.findUnique({ where: { id } });
        if (!existingMotor) {
            return res.status(404).json({ error: 'Motor tidak ditemukan' });
        }

        await prisma.motor.delete({ where: { id } });

        res.json({ message: 'Motor berhasil dihapus' });
    } catch (error) {
        console.error('Delete motor error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan saat menghapus motor' });
    }
};

// Get brands for filter
export const getBrands = async (req: Request, res: Response) => {
    try {
        const brands = await prisma.motor.findMany({
            select: { brand: true },
            distinct: ['brand']
        });

        res.json(brands.map(b => b.brand));
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Terjadi kesalahan' });
    }
};
