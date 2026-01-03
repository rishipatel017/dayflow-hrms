import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { sendVerificationEmail } from '../utils/mailService';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { employeeId: email }
                ]
            }
        });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            // For now, allow plain text as well if bcrypt fails (for migration from mock data)
            if (password !== user.passwordHash) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        const { passwordHash, ...userWithoutPassword } = user;

        if (!(user as any).isEmailVerified) {
            res.status(403).json({ message: 'Account not verified. Please check your email to activate your account.' });
            return;
        }

        // Fetch company information from Admin user
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { companyName: true, profilePictureUrl: true }
        });

        res.json({
            token,
            user: userWithoutPassword,
            company: {
                name: admin?.companyName || 'Dayflow',
                logo: admin?.profilePictureUrl || null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, firstName, lastName, email, password, phone } = req.body;

        // Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6-9]\d{9}$/;

        if (!emailRegex.test(email)) {
            res.status(400).json({ message: 'Invalid email format' });
            return;
        }

        if (!phoneRegex.test(phone)) {
            res.status(400).json({ message: 'Invalid Indian phone number. Must be 10 digits starting with 6-9.' });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const joiningDate = new Date();

        // Logo handling
        let profilePictureUrl = null;
        if (req.file) {
            profilePictureUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        // Generate employee ID logic (simplified for now)
        const year = joiningDate.getFullYear();
        const f2 = firstName.substring(0, 2).toUpperCase();
        const l2 = lastName.substring(0, 2).toUpperCase();
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

        const verificationToken = Math.random().toString(36).substring(2, 15);

        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: hashedPassword,
                firstName,
                lastName,
                employeeId,
                joiningDate,
                profilePictureUrl,
                role: 'ADMIN',
                verificationToken,
                companyName: companyName,
                profile: {
                    create: {
                        address: '',
                        phone,
                        jobPosition: 'Admin',
                        department: 'Management',
                        bankAccountNo: '',
                        ifsc: '',
                        pan: '',
                        uan: ''
                    }
                },
                salary: {
                    create: {
                        totalWage: 0,
                        yearlyWage: 0,
                        basic: 0,
                        hra: 0,
                        standardAllowance: 0,
                        pfEmployee: 0,
                        pfEmployer: 0,
                        profTax: 0
                    }
                }
            } as any
        });

        // Send Verification Email via SMTP
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (err) {
            console.error('Failed to send verification email:', err);
            // We still return 201 because the user is created and they can potentially 
            // request a resend later (if we implement it) or admin can verify manually
        }

        res.status(201).json({
            message: 'Registration successful. Verification email sent.',
            user
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: { verificationToken: token } as any
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired verification token' });
            return;
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isEmailVerified: true,
                verificationToken: null
            } as any
        });

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
