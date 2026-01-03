import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import prisma from '../prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images and documents (PDF/DOC) are allowed!'));
    }
});

export const uploadProfilePicture = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { userId } = req.body; // In a real app, verify this matches req.user.userId or is admin

        // Check authorization: Admin can change any, user only their own
        if (req.user?.role !== 'ADMIN' && req.user?.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const user = await prisma.user.update({
            where: { id: userId },
            data: { profilePictureUrl: imageUrl }
        });

        res.json({ imageUrl, userId: user.id });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
};
