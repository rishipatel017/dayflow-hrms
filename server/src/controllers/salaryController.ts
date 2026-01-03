import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getSalaryByUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const salary = await prisma.salaryStructure.findUnique({
            where: { userId }
        });
        if (!salary) return res.status(404).json({ message: 'Salary structure not found' });
        res.json(salary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching salary' });
    }
};

export const updateSalary = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const salaryData = req.body;

        const salary = await prisma.salaryStructure.upsert({
            where: { userId },
            update: salaryData,
            create: { ...salaryData, userId }
        });
        res.json(salary);
    } catch (error) {
        res.status(500).json({ message: 'Error updating salary' });
    }
};
