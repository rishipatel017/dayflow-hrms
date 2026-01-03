/**
 * Frontend validation utility functions for Indian employee data
 */

/**
 * Validate Indian phone number (10 digits starting with 6-9)
 */
export const validateIndianPhone = (phone: string): boolean => {
    if (!phone) return true; // Optional
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
 * Get validation error message for a field
 */
export const getValidationError = (field: string, value: string): string | null => {
    switch (field) {
        case 'phone':
            return !validateIndianPhone(value) ? 'Must be 10 digits starting with 6-9' : null;
        case 'pan':
            return !validatePAN(value) ? 'Format: ABCDE1234F (5 letters, 4 digits, 1 letter)' : null;
        case 'uan':
            return !validateUAN(value) ? 'Must be exactly 12 digits' : null;
        case 'ifsc':
            return !validateIFSC(value) ? 'Format: ABCD0123456 (4 letters, 0, 6 alphanumeric)' : null;
        case 'bankAccountNo':
            return !validateBankAccount(value) ? 'Must be 9-18 digits' : null;
        default:
            return null;
    }
};
