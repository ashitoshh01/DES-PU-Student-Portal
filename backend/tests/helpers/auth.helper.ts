/**
 * Auth Test Helpers
 *
 * Reusable utilities for integration tests that need authenticated users.
 * Creates test users, generates JWT tokens, and provides login helpers.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Will be a valid import once P1-M5 creates the Express app export
// import app from '../../src/app';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

// ─── Test User Fixtures ───────────────────────────────────────────────

export const TEST_STUDENT = {
  email: 'test.student@despu.edu.in',
  password: 'TestPassword123!',
  name: 'Test Student',
  role: 'STUDENT' as const,
  stu_prn: 'TEST-STU-001',
  dept_id: '', // Set during test setup from seeded data
  div_id: '',
  school_id: '',
};

export const TEST_FACULTY = {
  email: 'test.faculty@despu.edu.in',
  password: 'TestPassword123!',
  name: 'Test Faculty',
  role: 'FACULTY' as const,
  fac_prn: 'TEST-FAC-001',
  dept_id: '',
  school_id: '',
};

export const TEST_ADMIN = {
  email: 'test.admin@despu.edu.in',
  password: 'TestPassword123!',
  name: 'Test Admin',
  role: 'ADMIN' as const,
  adm_prn: 'TEST-ADM-001',
};

export const TEST_SUPER_ADMIN = {
  email: 'test.superadmin@despu.edu.in',
  password: 'TestPassword123!',
  name: 'Test Super Admin',
  role: 'SUPER_ADMIN' as const,
  sup_adm_prn: 'TEST-SADM-001',
};

// ─── JWT Generation ───────────────────────────────────────────────────

export interface JwtPayload {
  user_id: string;
  email: string;
  role: string;
}

/**
 * Generate a valid JWT token for testing.
 * Use this when you need an authenticated request without going through /auth/login.
 */
export function generateTestToken(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Generate an expired JWT token for testing 401 scenarios.
 */
export function generateExpiredToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '0s' });
}

/**
 * Generate a JWT with a wrong secret (tampered token).
 */
export function generateTamperedToken(payload: JwtPayload): string {
  return jwt.sign(payload, 'wrong-secret-key', { expiresIn: '7d' });
}

// ─── Supertest Helpers ────────────────────────────────────────────────

/**
 * Register a test user and return the response.
 * The response will contain a Set-Cookie header with the JWT.
 */
export async function registerUser(app: any, userData: Record<string, any>) {
  return request(app)
    .post('/api/v1/auth/register')
    .send(userData);
}

/**
 * Login a test user and return the response.
 */
export async function loginUser(app: any, email: string, password: string) {
  return request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
}

/**
 * Make an authenticated GET request using a JWT cookie.
 */
export function authGet(app: any, url: string, token: string) {
  return request(app)
    .get(url)
    .set('Cookie', [`token=${token}`]);
}

/**
 * Make an authenticated POST request using a JWT cookie.
 */
export function authPost(app: any, url: string, token: string, body: Record<string, any> = {}) {
  return request(app)
    .post(url)
    .set('Cookie', [`token=${token}`])
    .send(body);
}

/**
 * Make an authenticated PATCH request using a JWT cookie.
 */
export function authPatch(app: any, url: string, token: string, body: Record<string, any> = {}) {
  return request(app)
    .patch(url)
    .set('Cookie', [`token=${token}`])
    .send(body);
}

/**
 * Make an authenticated DELETE request using a JWT cookie.
 */
export function authDelete(app: any, url: string, token: string) {
  return request(app)
    .delete(url)
    .set('Cookie', [`token=${token}`]);
}

/**
 * Extract the JWT cookie value from a supertest response.
 */
export function extractTokenFromResponse(res: request.Response): string | null {
  const cookies = res.headers['set-cookie'];
  if (!cookies) return null;
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const tokenCookie = cookieArray.find((c: string) => c.startsWith('token='));
  if (!tokenCookie) return null;
  const match = tokenCookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}
