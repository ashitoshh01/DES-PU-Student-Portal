/**
 * Phase 2 — P2-M2: Auth Middleware Tests
 *
 * Unit tests for: domainCheck, authenticate (JWT), rbac
 */
import { describe, it, expect, vi } from 'vitest';
import {
  generateTestToken,
  generateExpiredToken,
  generateTamperedToken,
} from '../../helpers/auth.helper';

describe('P2-M2: Auth Middleware Stack', () => {
  // ─── Domain Check Middleware ────────────────────────────────────────

  describe('domainCheck middleware', () => {
    it('should pass for valid @despu.edu.in email', async () => {
      const { domainCheck } = await import('../../../src/middleware/domainCheck.middleware');

      const req = { body: { email: 'student@despu.edu.in' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      domainCheck(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should block non-DES email with 403', async () => {
      const { domainCheck } = await import('../../../src/middleware/domainCheck.middleware');

      const req = { body: { email: 'student@gmail.com' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      domainCheck(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('@despu.edu.in'),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should block empty email with 403', async () => {
      const { domainCheck } = await import('../../../src/middleware/domainCheck.middleware');

      const req = { body: {} } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      domainCheck(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should block emails with @despu.edu.in as substring (e.g. fake@despu.edu.in.evil.com)', async () => {
      const { domainCheck } = await import('../../../src/middleware/domainCheck.middleware');

      const req = { body: { email: 'fake@despu.edu.in.evil.com' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      domainCheck(req, res, next);

      // Should fail because .endsWith('@despu.edu.in') won't match
      // But .endsWith('@despu.edu.in.evil.com') — this tests the implementation
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── JWT Authenticate Middleware ────────────────────────────────────

  describe('authenticate middleware', () => {
    it('should attach user to req when valid JWT cookie is present', async () => {
      const { authenticate } = await import('../../../src/middleware/auth.middleware');

      const token = generateTestToken({
        user_id: 'user-123',
        email: 'test@despu.edu.in',
        role: 'STUDENT',
      });

      const req = {
        cookies: { token },
      } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.user_id).toBe('user-123');
      expect(req.user.email).toBe('test@despu.edu.in');
      expect(req.user.role).toBe('STUDENT');
    });

    it('should return 401 when no cookie is present', async () => {
      const { authenticate } = await import('../../../src/middleware/auth.middleware');

      const req = { cookies: {} } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for expired JWT', async () => {
      const { authenticate } = await import('../../../src/middleware/auth.middleware');

      const token = generateExpiredToken({
        user_id: 'user-123',
        email: 'test@despu.edu.in',
        role: 'STUDENT',
      });

      // Wait a moment for the token to actually expire
      await new Promise((resolve) => setTimeout(resolve, 100));

      const req = { cookies: { token } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for tampered JWT', async () => {
      const { authenticate } = await import('../../../src/middleware/auth.middleware');

      const token = generateTamperedToken({
        user_id: 'user-123',
        email: 'test@despu.edu.in',
        role: 'STUDENT',
      });

      const req = { cookies: { token } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ─── RBAC Middleware ────────────────────────────────────────────────

  describe('rbac middleware', () => {
    it('should pass when user role is in allowed list', async () => {
      const { rbac } = await import('../../../src/middleware/rbac.middleware');

      const middleware = rbac(['ADMIN', 'FACULTY']);
      const req = { user: { role: 'ADMIN' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user role is not in allowed list', async () => {
      const { rbac } = await import('../../../src/middleware/rbac.middleware');

      const middleware = rbac(['FACULTY']);
      const req = { user: { role: 'STUDENT' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should always pass for SUPER_ADMIN regardless of allowed list', async () => {
      const { rbac } = await import('../../../src/middleware/rbac.middleware');

      const middleware = rbac(['FACULTY']); // SUPER_ADMIN not in list
      const req = { user: { role: 'SUPER_ADMIN' } } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      middleware(req, res, next);

      // SUPER_ADMIN should have implicit access to everything
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when req.user is not set', async () => {
      const { rbac } = await import('../../../src/middleware/rbac.middleware');

      const middleware = rbac(['ADMIN']);
      const req = {} as any; // no user property
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
