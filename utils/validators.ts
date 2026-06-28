import { z } from 'zod';

/**
 * Phone number: Indian mobile format (10 digits, optionally prefixed with +91)
 */
export const phoneSchema = z
  .string()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number');

/**
 * Email address
 */
export const emailSchema = z
  .string()
  .email('Enter a valid email address');

/**
 * Exam marks: 0 to max (dynamic based on totalMarks)
 */
export function marksSchema(max: number) {
  return z
    .number()
    .min(0, 'Marks cannot be negative')
    .max(max, `Marks cannot exceed ${max}`);
}

/**
 * Notice body: max 5000 characters
 */
export const noticeBodySchema = z
  .string()
  .min(1, 'Notice body is required')
  .max(5000, 'Notice body cannot exceed 5000 characters');

/**
 * Note content: max 5000 characters (fits in one DynamoDB item)
 */
export const noteContentSchema = z
  .string()
  .min(1, 'Note content is required')
  .max(5000, 'Note content cannot exceed 5000 characters');

/**
 * Note/notice title: max 200 characters
 */
export const titleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title cannot exceed 200 characters');

/**
 * Name field
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters');

/**
 * Roll number
 */
export const rollNoSchema = z
  .string()
  .min(1, 'Roll number is required')
  .max(20, 'Roll number cannot exceed 20 characters');

/**
 * Password: minimum 8 chars, at least one number
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain at least one number');
