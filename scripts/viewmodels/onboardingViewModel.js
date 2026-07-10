import { createUserProfile } from '../../models/UserProfile.js';
import { createAccount } from '../services/supabaseService.js';

/** Validate email format */
export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Please enter a valid email';
  return null;
}

/** Validate password strength */
export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

/** Validate password match */
export function validatePasswordMatch(password, confirm) {
  if (password !== confirm) return 'Passwords do not match';
  return null;
}

/** Validate birthday - 13+ */
export function validateBirthday(birthday) {
  if (!birthday) return 'Birthday is required';
  const bd = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - bd.getFullYear();
  const m = today.getMonth() - bd.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
  if (age < 13) return 'You must be 13 or older';
  return null;
}

/** Validate step 1 */
export function validateStep1(data = {}) {
  const errors = {};
  if (!data.name || !data.name.trim()) errors.name = 'Full name is required';
  const bErr = validateBirthday(data.birthday);
  if (bErr) errors.birthday = bErr;
  const eErr = validateEmail(data.email);
  if (eErr) errors.email = eErr;
  const pErr = validatePassword(data.password);
  if (pErr) errors.password = pErr;
  const mErr = validatePasswordMatch(data.password, data.confirmPassword);
  if (mErr) errors.confirmPassword = mErr;
  if (!data.salary) errors.salary = 'Salary is required';
  if (!data.monthlySpending) errors.monthlySpending = 'Monthly spending is required';
  return { isValid: Object.keys(errors).length === 0, errors };
}

/** Validate step 2 */
export function validateStep2(data = {}) {
  const errors = {};
  if (!data.goals) errors.goals = 'Please select a goal option';
  if (!data.financialKnowledge) errors.financialKnowledge = 'Please select a knowledge level';
  return { isValid: Object.keys(errors).length === 0, errors };
}

/**
 * Complete onboarding by creating account and saving profile
 * @param {Object} step1Data
 * @param {Object} step2Data
 */
export async function completeOnboarding(step1Data, step2Data) {
  // Validate
  const v1 = validateStep1(step1Data);
  const v2 = validateStep2(step2Data);
  if (!v1.isValid || !v2.isValid) {
    return { success: false, message: 'Validation failed', errors: { ...v1.errors, ...v2.errors } };
  }

  try {
    const profile = createUserProfile({
      name: step1Data.name,
      birthday: step1Data.birthday,
      email: step1Data.email,
      occupation: step1Data.occupation || '',
      salary: Number(step1Data.salary) || 0,
      monthlySpending: Number(step1Data.monthlySpending) || 0,
      goals: step2Data.goals,
      financialKnowledge: step2Data.financialKnowledge
    });

    const user = await createAccount(step1Data.email, step1Data.password, profile);
    return { success: true, uid: user.id };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to complete onboarding' };
  }
}
