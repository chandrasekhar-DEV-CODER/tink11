/**
 * Account Generation Utilities
 * Automatically generates usernames and secure passwords for new accounts
 */

/**
 * Generates a secure random password
 * Format: 8 characters with uppercase, lowercase, numbers, and special chars
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#$%&*';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Generates a unique username based on role and existing usernames
 * Format: {role}{number} (e.g., student001, parent001, driver001)
 */
export function generateUsername(role: 'student' | 'parent' | 'driver', existingUsernames: string[]): string {
  let counter = 1;
  let username = '';
  
  do {
    const paddedNumber = counter.toString().padStart(3, '0');
    username = `${role}${paddedNumber}`;
    counter++;
  } while (existingUsernames.includes(username));
  
  return username;
}

/**
 * Generates a username based on full name
 * Format: firstname.lastname (e.g., john.doe)
 * Falls back to numbered format if name-based username exists
 */
export function generateUsernameFromName(
  fullName: string, 
  role: 'student' | 'parent' | 'driver',
  existingUsernames: string[]
): string {
  const nameParts = fullName.toLowerCase().trim().split(' ');
  
  if (nameParts.length >= 2) {
    const firstName = nameParts[0].replace(/[^a-z]/g, '');
    const lastName = nameParts[nameParts.length - 1].replace(/[^a-z]/g, '');
    
    let baseUsername = `${firstName}.${lastName}`;
    
    if (!existingUsernames.includes(baseUsername)) {
      return baseUsername;
    }
    
    let counter = 1;
    let username = '';
    do {
      username = `${baseUsername}${counter}`;
      counter++;
    } while (existingUsernames.includes(username));
    
    return username;
  }
  
  return generateUsername(role, existingUsernames);
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true, message: 'Password is strong' };
}

/**
 * Formats account credentials for display
 */
export function formatCredentials(username: string, password: string): string {
  return `Username: ${username}\nPassword: ${password}`;
}

/**
 * Generates a student ID
 * Format: STU-YYYY-NNNN (e.g., STU-2025-0001)
 */
export function generateStudentId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  let counter = 1;
  let studentId = '';
  
  do {
    const paddedNumber = counter.toString().padStart(4, '0');
    studentId = `STU-${year}-${paddedNumber}`;
    counter++;
  } while (existingIds.includes(studentId));
  
  return studentId;
}

/**
 * Generates a driver license number (mock)
 * Format: DL-XXXXXX (e.g., DL-A12345)
 */
export function generateLicenseNumber(existingLicenses: string[]): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let licenseNumber = '';
  
  do {
    licenseNumber = 'DL-';
    licenseNumber += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < 5; i++) {
      licenseNumber += numbers[Math.floor(Math.random() * numbers.length)];
    }
  } while (existingLicenses.includes(licenseNumber));
  
  return licenseNumber;
}
