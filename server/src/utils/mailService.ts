import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true', // false for Mailpit
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    } : undefined
});

export const sendVerificationEmail = async (to: string, token: string) => {
    const verificationLink = `http://localhost:5173/#/verify-email?token=${token}`;

    const mailOptions = {
        from: `"Dayflow Support" <${process.env.FROM_EMAIL || 'no-reply@dayflow.com'}>`,
        to,
        subject: 'Verify Your Dayflow Account',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 16px;">
                <h2 style="color: #0f172a;">Welcome to Dayflow!</h2>
                <p style="color: #64748b;">Thank you for registering. Please activate your enterprise account by clicking the button below:</p>
                <div style="margin: 32px 0;">
                    <a href="${verificationLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #94a3b8; font-size: 12px;">${verificationLink}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Dayflow Secure Authentication • Enterprise HRMS</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const sendWelcomeEmail = async (
    to: string,
    firstName: string,
    employeeId: string,
    password: string,
    verificationToken: string
) => {
    const verificationLink = `http://localhost:5173/#/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: `"Dayflow HR Team" <${process.env.FROM_EMAIL || 'hr@dayflow.com'}>`,
        to,
        subject: 'Welcome to Dayflow - Your Account Details',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px;">
                <h2 style="color: #0f172a;">Welcome to Dayflow, ${firstName}!</h2>
                <p style="color: #64748b;">Your employee account has been created by the HR team. Below are your login credentials:</p>
                
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 24px 0;">
                    <p style="margin: 8px 0;"><strong style="color: #0f172a;">Employee ID:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; color: #0f172a;">${employeeId}</code></p>
                    <p style="margin: 8px 0;"><strong style="color: #0f172a;">Temporary Password:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px; color: #0f172a;">${password}</code></p>
                </div>

                <p style="color: #ef4444; font-size: 14px; margin: 16px 0;">⚠️ <strong>Important:</strong> Please change your password immediately after your first login.</p>

                <p style="color: #64748b; margin: 24px 0;">Before you can log in, you must verify your email address by clicking the button below:</p>
                
                <div style="margin: 32px 0; text-align: center;">
                    <a href="${verificationLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email & Activate Account</a>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #94a3b8; font-size: 12px; word-break: break-all;">${verificationLink}</p>
                
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Dayflow HR Team • Enterprise HRMS</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};
