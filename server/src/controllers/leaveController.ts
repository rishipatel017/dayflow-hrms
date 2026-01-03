import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getAllLeaves = async (req: Request, res: Response) => {
    try {
        const leaves = await prisma.leaveRequest.findMany({
            include: { user: true }
        });
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaves' });
    }
};

export const createLeaveRequest = async (req: Request, res: Response) => {
    try {
        const { userId, type, startDate, endDate, reason } = req.body;
        const attachmentUrl = req.file ? `http://localhost:5000/uploads/${req.file.filename}` : null;

        const leave = await prisma.leaveRequest.create({
            data: {
                userId,
                type,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                reason,
                attachmentUrl
            }
        });
        res.status(201).json(leave);
    } catch (error) {
        console.error('Create leave error:', error);
        res.status(500).json({ message: 'Error creating leave request' });
    }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { approverId, status, approverRemarks } = req.body;

        // Security: Fetch leave request to check ownership
        const leaveRequest = await prisma.leaveRequest.findUnique({
            where: { id }
        });

        if (!leaveRequest) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (leaveRequest.userId === approverId) {
            return res.status(400).json({ message: 'You cannot approve or reject your own leave request' });
        }

        const leave = await prisma.leaveRequest.update({
            where: { id },
            data: {
                status,
                approverId,
                approvalDate: new Date(),
                approverRemarks
            } as any
        });
        res.json(leave);
    } catch (error) {
        console.error('Update leave status error:', error);
        res.status(500).json({ message: 'Error updating leave status' });
    }
};
