/**
 * Phase 2 — P2-M1: Zod Validator Unit Tests
 *
 * Tests: registration schema, login schema, profile update schema, common validators
 */
import { describe, it, expect } from 'vitest';

describe('P2-M1: Validation Layer (Zod Schemas)', () => {
  // ─── Auth Validators ───────────────────────────────────────────────

  describe('Registration Schema', () => {
    it('should pass valid registration data', async () => {
      const { registerSchema } = await import('../../../src/validators/auth.validator');

      const result = registerSchema.safeParse({
        email: 'student@despu.edu.in',
        password: 'SecurePass123!',
        name: 'Test Student',
        role: 'STUDENT',
      });

      expect(result.success).toBe(true);
    });

    it('should fail with non-DES email', async () => {
      const { registerSchema } = await import('../../../src/validators/auth.validator');

      const result = registerSchema.safeParse({
        email: 'student@gmail.com',
        password: 'SecurePass123!',
        name: 'Test Student',
        role: 'STUDENT',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find((i) => i.path.includes('email'));
        expect(emailError).toBeDefined();
      }
    });

    it('should fail with weak password (too short)', async () => {
      const { registerSchema } = await import('../../../src/validators/auth.validator');

      const result = registerSchema.safeParse({
        email: 'student@despu.edu.in',
        password: '123',
        name: 'Test',
        role: 'STUDENT',
      });

      expect(result.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const { registerSchema } = await import('../../../src/validators/auth.validator');

      const result = registerSchema.safeParse({
        email: 'student@despu.edu.in',
        // missing password, name
      });

      expect(result.success).toBe(false);
    });

    it('should strip unknown/extra fields', async () => {
      const { registerSchema } = await import('../../../src/validators/auth.validator');

      const result = registerSchema.safeParse({
        email: 'student@despu.edu.in',
        password: 'SecurePass123!',
        name: 'Test',
        role: 'STUDENT',
        isAdmin: true, // Extra field — should be stripped
        hack: 'injection', // Extra field
      });

      if (result.success) {
        expect(result.data).not.toHaveProperty('isAdmin');
        expect(result.data).not.toHaveProperty('hack');
      }
    });
  });

  describe('Login Schema', () => {
    it('should pass valid login data', async () => {
      const { loginSchema } = await import('../../../src/validators/auth.validator');

      const result = loginSchema.safeParse({
        email: 'student@despu.edu.in',
        password: 'SecurePass123!',
      });

      expect(result.success).toBe(true);
    });

    it('should fail with missing password', async () => {
      const { loginSchema } = await import('../../../src/validators/auth.validator');

      const result = loginSchema.safeParse({
        email: 'student@despu.edu.in',
      });

      expect(result.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const { loginSchema } = await import('../../../src/validators/auth.validator');

      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePass123!',
      });

      expect(result.success).toBe(false);
    });
  });

  // ─── Common Validators ─────────────────────────────────────────────

  describe('Common Schemas', () => {
    it('should validate UUID param', async () => {
      const { uuidParamSchema } = await import('../../../src/validators/common.validator');

      const valid = uuidParamSchema.safeParse({ id: '550e8400-e29b-41d4-a716-446655440000' });
      expect(valid.success).toBe(true);

      const invalid = uuidParamSchema.safeParse({ id: 'not-a-uuid' });
      expect(invalid.success).toBe(false);
    });

    it('should validate pagination query params', async () => {
      const { paginationSchema } = await import('../../../src/validators/common.validator');

      const result = paginationSchema.safeParse({ page: '1', limit: '20' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should default pagination values when missing', async () => {
      const { paginationSchema } = await import('../../../src/validators/common.validator');

      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBeGreaterThan(0);
      }
    });
  });
});
