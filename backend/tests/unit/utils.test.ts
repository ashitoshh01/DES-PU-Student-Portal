/**
 * Phase 1 — P1-M4: Utility Layer Tests
 *
 * Tests for: paginate(), ApiError, asyncHandler, formatResponse, env()
 */
import { describe, it, expect } from 'vitest';

// These imports will resolve once P1-M4 is implemented
// import { paginate, formatResponse } from '../../src/utils';
// import { ApiError } from '../../src/utils/ApiError';
// import { asyncHandler } from '../../src/utils/asyncHandler';
// import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '../../src/utils/constants';

describe('P1-M4: Utility Layer', () => {
  // ─── paginate() ─────────────────────────────────────────────────────

  describe('paginate()', () => {
    it('should return correct skip and take for page 1', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(1, 20);
      expect(result).toEqual({ skip: 0, take: 20 });
    });

    it('should return correct skip and take for page 3', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(3, 10);
      expect(result).toEqual({ skip: 20, take: 10 });
    });

    it('should clamp limit to MAX_PAGE_SIZE (50)', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(1, 100);
      expect(result.take).toBeLessThanOrEqual(50);
    });

    it('should default to page 1 when page is 0 or negative', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(0, 20);
      expect(result.skip).toBe(0);
    });

    it('should default to page 1 when page is negative', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(-1, 20);
      expect(result.skip).toBe(0);
    });

    it('should use default limit when limit is 0 or negative', async () => {
      const { paginate } = await import('../../src/utils');
      const result = paginate(1, 0);
      expect(result.take).toBeGreaterThan(0);
    });
  });

  // ─── ApiError ───────────────────────────────────────────────────────

  describe('ApiError', () => {
    it('should create error with status code and message', async () => {
      const { ApiError } = await import('../../src/utils/ApiError');
      const error = new ApiError(404, 'Not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error).toBeInstanceOf(Error);
    });

    it('should include optional error code', async () => {
      const { ApiError } = await import('../../src/utils/ApiError');
      const error = new ApiError(409, 'Email already exists', 'EMAIL_EXISTS');
      expect(error.code).toBe('EMAIL_EXISTS');
    });

    it('should be an operational error by default', async () => {
      const { ApiError } = await import('../../src/utils/ApiError');
      const error = new ApiError(400, 'Bad request');
      expect(error.isOperational).toBe(true);
    });

    it('should have a proper stack trace', async () => {
      const { ApiError } = await import('../../src/utils/ApiError');
      const error = new ApiError(500, 'Server error');
      expect(error.stack).toBeDefined();
    });
  });

  // ─── formatResponse() ──────────────────────────────────────────────

  describe('formatResponse()', () => {
    it('should wrap data in { data } envelope', async () => {
      const { formatResponse } = await import('../../src/utils');
      const result = formatResponse({ id: '123', name: 'Test' });
      expect(result).toEqual({ data: { id: '123', name: 'Test' } });
    });

    it('should include meta when provided', async () => {
      const { formatResponse } = await import('../../src/utils');
      const meta = { page: 1, limit: 20, total: 100, totalPages: 5 };
      const result = formatResponse([{ id: '1' }], meta);
      expect(result).toEqual({
        data: [{ id: '1' }],
        meta: { page: 1, limit: 20, total: 100, totalPages: 5 },
      });
    });

    it('should not include meta when not provided', async () => {
      const { formatResponse } = await import('../../src/utils');
      const result = formatResponse({ id: '1' });
      expect(result).not.toHaveProperty('meta');
    });
  });

  // ─── asyncHandler() ────────────────────────────────────────────────

  describe('asyncHandler()', () => {
    it('should call the wrapped function with req, res, next', async () => {
      const { asyncHandler } = await import('../../src/utils/asyncHandler');

      let wasCalled = false;
      const handler = asyncHandler(async (req: any, res: any, next: any) => {
        wasCalled = true;
      });

      const mockReq = {} as any;
      const mockRes = {} as any;
      const mockNext = () => {};

      await handler(mockReq, mockRes, mockNext);
      expect(wasCalled).toBe(true);
    });

    it('should catch thrown errors and pass them to next()', async () => {
      const { asyncHandler } = await import('../../src/utils/asyncHandler');

      const testError = new Error('Test error');
      const handler = asyncHandler(async () => {
        throw testError;
      });

      let capturedError: any = null;
      const mockNext = (err: any) => {
        capturedError = err;
      };

      await handler({} as any, {} as any, mockNext);
      expect(capturedError).toBe(testError);
    });

    it('should catch rejected promises and pass them to next()', async () => {
      const { asyncHandler } = await import('../../src/utils/asyncHandler');

      const handler = asyncHandler(async () => {
        return Promise.reject(new Error('Promise rejected'));
      });

      let capturedError: any = null;
      const mockNext = (err: any) => {
        capturedError = err;
      };

      await handler({} as any, {} as any, mockNext);
      expect(capturedError).toBeInstanceOf(Error);
      expect(capturedError.message).toBe('Promise rejected');
    });
  });
});
