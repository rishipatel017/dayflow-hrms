import { Request, Response } from 'express';
import prisma from '../prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';
import { generateRandomPassword } from '../utils/passwordGenerator';
import { sendWelcomeEmail } from '../utils/mailService';
import crypto from 'crypto';
import { validateEmployeeData } from '../utils/validation';

// Utility function to remove sensitive fields from user objects
const sanitizeUser = (user: any) => {
    const { passwordHash, verificationToken, emailVerificationExpiry, ...safeUser } = user;
    return safeUser;
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: { profile: true },
        });

        const safeUsers = users.map(user => sanitizeUser(user));

        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true, salary: true }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(sanitizeUser(user));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { userData, profileData } = req.body;

        // Validate employee data
        const validation = validateEmployeeData(userData, profileData);
        if (!validation.valid) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validation.errors
            });
            return;
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        // Generate random password
        const randomPassword = generateRandomPassword(12);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const joiningDate = new Date(userData.joiningDate || new Date());

        // Generate employee ID logic
        const year = joiningDate.getFullYear();
        const f2 = userData.firstName.substring(0, 2).toUpperCase();
        const l2 = userData.lastName.substring(0, 2).toUpperCase();
        const count = await prisma.user.count({
            where: {
                joiningDate: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`)
                }
            }
        });
        const serial = (count + 1).toString().padStart(4, '0');
        const employeeId = `OI${f2}${l2}${year}${serial}`;

        const user = await prisma.user.create({
            data: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                employeeId,
                passwordHash: hashedPassword,
                joiningDate,
                role: userData.role || 'EMPLOYEE',
                isEmailVerified: false,
                verificationToken: verificationToken,
                emailVerificationExpiry: tokenExpiry,
                profile: {
                    create: {
                        address: profileData.address || '',
                        phone: profileData.phone || '',
                        jobPosition: profileData.jobPosition || 'Employee',
                        department: profileData.department || 'General',
                        bankAccountNo: profileData.bankAccountNo || '',
                        ifsc: profileData.ifsc || '',
                        pan: profileData.pan || '',
                        uan: profileData.uan || '',
                        maritalStatus: profileData.maritalStatus,
                        nationality: profileData.nationality,
                        personalEmail: profileData.personalEmail,
                        gender: profileData.gender
                    }
                },
                salary: {
                    create: {
                        totalWage: userData.totalWage || 0,
                        yearlyWage: (userData.totalWage || 0) * 12,
                        basic: (userData.totalWage || 0) * 0.5,
                        hra: (userData.totalWage || 0) * 0.25,
                        standardAllowance: 0,
                        pfEmployee: (userData.totalWage || 0) * 0.06,
                        pfEmployer: 1800,
                        profTax: 200
                    }
                }
            },
            include: { profile: true }
        });

        // Send welcome email with credentials and verification link
        try {
            await sendWelcomeEmail(
                userData.email,
                userData.firstName,
                employeeId,
                randomPassword,
                verificationToken
            );
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Continue even if email fails - user is already created
        }

        const { passwordHash: _, ...safeUser } = user;
        res.status(201).json({
            ...safeUser,
            message: 'Employee created successfully. Welcome email sent with login credentials.'
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { profileData, userData } = req.body;

        // Authorization check
        if (req.user?.role !== 'ADMIN' && req.user?.userId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // Sanitize profileData: Remove read-only or ID fields that Prisma doesn't like in upsert
        const { id: _, userId: __, createdAt: ___, updatedAt: ____, ...sanitizedProfileData } = profileData;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                firstName: userData?.firstName,
                lastName: userData?.lastName,
                profile: {
                    upsert: {
                        create: sanitizedProfileData,
                        update: sanitizedProfileData
                    }
                }
            },
            include: { profile: true }
        });

        const { passwordHash, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { oldPassword, newPassword } = req.body;

        // Authorization check
        if (req.user?.userId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch && oldPassword !== user.passwordHash) {
            return res.status(400).json({ message: 'Invalid old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id },
            data: { passwordHash: hashedPassword }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

export const uploadDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // User ID
        const { name, type } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const url = `http://localhost:5000/uploads/${req.file.filename}`;

        const profile = await prisma.employeeProfile.findUnique({ where: { userId: id } }) as any;
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const currentDocs = profile.documents || [];
        const updatedDocs = [...currentDocs, { name, url, type, uploadedAt: new Date() }];

        await prisma.employeeProfile.update({
            where: { userId: id },
            data: { documents: updatedDocs } as any
        });

        res.json({ name, url, type });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ message: 'Error uploading document' });
    }
};

export const deleteDocument = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params; // User ID
        const { url } = req.body; // URL of the document to delete

        const profile = await prisma.employeeProfile.findUnique({ where: { userId: id } }) as any;
        if (!profile) return res.status(404).json({ message: 'Profile not found' });

        const currentDocs = profile.documents || [];
        const updatedDocs = currentDocs.filter((doc: any) => doc.url !== url);

        await prisma.employeeProfile.update({
            where: { userId: id },
            data: { documents: updatedDocs } as any
        });

        // Delete physical file
        try {
            const filename = url.split('/').pop();
            if (filename) {
                const filePath = path.join(__dirname, '../../uploads', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (unlinkError) {
            console.error('File unlink error:', unlinkError);
            // We don't fail the request if unlinking fails (e.g. file missing)
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Document deletion error:', error);
        res.status(500).json({ message: 'Error deleting document' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // Security: only admins can delete users
        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        const user = await prisma.user.findUnique({
            where: { id },
            include: { profile: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Cleanup physical files (Profile Pic)
        if (user.profilePictureUrl) {
            try {
                const filename = user.profilePictureUrl.split('/').pop();
                if (filename && !user.profilePictureUrl.includes('pravatar.cc')) {
                    const filePath = path.join(__dirname, '../../uploads', filename);
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error('Error deleting profile pic:', err);
            }
        }

        // 2. Cleanup Documents
        const profile = user.profile as any;
        if (profile && profile.documents) {
            const docs = profile.documents || [];
            docs.forEach((doc: any) => {
                try {
                    const filename = doc.url.split('/').pop();
                    if (filename) {
                        const filePath = path.join(__dirname, '../../uploads', filename);
                        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error('Error deleting document file:', err);
                }
            });
        }

        // 3. Delete from DB (Prisma cascade handles attendance, leaves, salary, profile)
        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
