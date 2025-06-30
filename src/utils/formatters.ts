/**
 * Format account number for display
 * @param accountNumber Account number to format
 * @returns Formatted account number with separators
 */
export const formatAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return '';
  
  // Đảm bảo accountNumber là chuỗi
  const accNum = String(accountNumber);
  
  // Định dạng số tài khoản thành các nhóm 4 chữ số
  // Ví dụ: 100000000001 -> 1000 0000 0001
  if (accNum.length === 12) {
    return `${accNum.substring(0, 4)} ${accNum.substring(4, 8)} ${accNum.substring(8, 12)}`;
  }
  
  return accNum;
};

/**
 * Mask account number for privacy
 * @param accountNumber Account number to mask
 * @returns Masked account number
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber) return '';
  
  // Đảm bảo accountNumber là chuỗi
  const accNum = String(accountNumber);
  
  // Nếu là số tài khoản 12 chữ số, chỉ hiển thị 4 số cuối
  if (accNum.length === 12) {
    return `•••• •••• ${accNum.substring(8, 12)}`;
  }
  
  // Trường hợp khác, hiển thị 1/3 cuối
  const visiblePart = Math.floor(accNum.length / 3);
  const hiddenPart = accNum.length - visiblePart;
  
  return `${'•'.repeat(hiddenPart)}${accNum.substring(hiddenPart)}`;
};

/**
 * Format currency for display
 * @param amount Amount to format
 * @param currency Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date for display
 * @param date Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatBankAccount = (name: string, bank: string): string => {
  return `${name}@${bank}`;
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  // Check if account number is exactly 12 digits
  return /^\d{12}$/.test(accountNumber);
};

export const generateAccountNumber = (bankCode: string): string => {
  // Generate a 12-digit account number
  // First 3 digits: bank code (100=Bank A, 200=Bank B, 300=Bank C)
  // Next 9 digits: sequential or random number
  const bankCodes: Record<string, string> = {
    'Bank A': '100',
    'Bank B': '200', 
    'Bank C': '300'
  };
  
  const prefix = bankCodes[bankCode] || '999';
  const suffix = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  
  return prefix + suffix;
};