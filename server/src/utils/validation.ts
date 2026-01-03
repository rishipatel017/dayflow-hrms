/**
 * Validation utility functions for Indian employee data
 */

/**
 * Validate Indian phone number (10 digits starting with 6-9)
 */
export const validateIndianPhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate PAN (Permanent Account Number)
 * Format: ABCDE1234F (5 letters, 4 digits, 1 letter)
 */
export const validatePAN = (pan: string): boolean => {
    if (!pan) return true; // Optional field
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan.toUpperCase());
};

/**
 * Validate UAN (Universal Account Number)
 * Format: 12 digits
 */
export const validateUAN = (uan: string): boolean => {
    if (!uan) return true; // Optional field
    const uanRegex = /^\d{12}$/;
    return uanRegex.test(uan);
};

/**
 * Validate IFSC Code
 * Format: ABCD0123456 (4 letters, 0, 6 alphanumeric)
 */
export const validateIFSC = (ifsc: string): boolean => {
    if (!ifsc) return true; // Optional field
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
};

/**
 * Validate Bank Account Number
 * Format: 9-18 digits
 */
export const validateBankAccount = (accountNo: string): boolean => {
    if (!accountNo) return true; // Optional field
    const accountRegex = /^\d{9,18}$/;
    return accountRegex.test(accountNo);
};

/**
 * Validate Email
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate all employee data
 */
export const validateEmployeeData = (userData: any, profileData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!userData.firstName || !userData.firstName.trim()) {
        errors.push('First name is required');
    }
    if (!userData.lastName || !userData.lastName.trim()) {
        errors.push('Last name is required');
    }
    if (!userData.email || !validateEmail(userData.email)) {
        errors.push('Valid email is required');
    }

    // Phone validation
    if (profileData.phone && !validateIndianPhone(profileData.phone)) {
        errors.push('Invalid Indian phone number. Must be 10 digits starting with 6-9');
    }

    // PAN validation
    if (profileData.pan && !validatePAN(profileData.pan)) {
        errors.push('Invalid PAN format. Expected format: ABCDE1234F');
    }

    // UAN validation
    if (profileData.uan && !validateUAN(profileData.uan)) {
        errors.push('Invalid UAN format. Must be 12 digits');
    }

    // IFSC validation
    if (profileData.ifsc && !validateIFSC(profileData.ifsc)) {
        errors.push('Invalid IFSC code format. Expected format: ABCD0123456');
    }

    // Bank Account validation
    if (profileData.bankAccountNo && !validateBankAccount(profileData.bankAccountNo)) {
        errors.push('Invalid bank account number. Must be 9-18 digits');
    }

    // If bank account is provided, IFSC is required
    if (profileData.bankAccountNo && !profileData.ifsc) {
        errors.push('IFSC code is required when bank account number is provided');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};
