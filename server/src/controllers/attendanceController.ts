import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getAllAttendance = async (req: Request, res: Response) => {
    try {
        const attendance = await prisma.attendance.findMany();
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};

const getUtcToday = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const checkIn = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const today = getUtcToday();

        // Security: Prevent duplicate check-in
        const existing = await prisma.attendance.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in for today' });
        }

        const record = await prisma.attendance.create({
            data: {
                userId,
                date: today,
                checkInTime: new Date(), // Stored as absolute UTC timestamp by Prisma
                status: 'PRESENT'
            }
        });
        res.json(record);
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ message: 'Error during check-in' });
    }
};

export const checkOut = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;
        const today = getUtcToday();

        const record = await prisma.attendance.findUnique({
            where: { userId_date: { userId, date: today } }
        });

        if (!record) {
            return res.status(404).json({ message: 'No check-in record found for today' });
        }

        if (record.checkOutTime) {
            return res.status(400).json({ message: 'Already checked out for today' });
        }

        const now = new Date();
        const updated = await prisma.attendance.update({
            where: { id: record.id },
            data: {
                checkOutTime: now,
                workHours: (now.getTime() - record.checkInTime!.getTime()) / (1000 * 60 * 60)
            }
        });
        res.json(updated);
    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json({ message: 'Error during check-out' });
    }
};

export const getForUserToday = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const today = getUtcToday();

        const record = await prisma.attendance.findFirst({
            where: { userId, date: today }
        });
        res.json(record || null);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance' });
    }
};
