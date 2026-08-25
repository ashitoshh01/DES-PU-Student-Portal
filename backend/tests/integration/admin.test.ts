/**
 * Phase 6 — P6-M2: Admin & Moderation Integration Tests
 *
 * Tests: reports, moderation queue, user ban/unban, role change, admin user creation
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
  createTestUser,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost, authPatch } from '../../helpers/auth.helper';

describe('P6-M2: Admin & Moderation Tools', () => {
  let app: any;
  let academicData: any;
  let adminToken: string;
  let superAdminToken: string;
  let studentToken: string;
  let studentUserId: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    // Create admin
    const admin = await createTestUser({ email: 'admin@despu.edu.in', role: 'ADMIN', name: 'Admin' });
    adminToken = generateTestToken({ user_id: admin.user_id, email: admin.email, role: 'ADMIN' });

    // Create super admin
    const superAdmin = await createTestUser({ email: 'superadmin@despu.edu.in', role: 'SUPER_ADMIN', name: 'Super Admin' });
    superAdminToken = generateTestToken({ user_id: superAdmin.user_id, email: superAdmin.email, role: 'SUPER_ADMIN' });

    // Create student
    const { user: student } = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'mod.student@despu.edu.in', stu_prn: 'MOD-STU-001' });
    studentUserId = student.user_id;
    studentToken = generateTestToken({ user_id: student.user_id, email: student.email, role: 'STUDENT' });
  });

  // ─── Reports ────────────────────────────────────────────────────────

  describe('POST /api/v1/admin/reports', () => {
    it('should allow any user to report content', async () => {
      const res = await authPost(app, '/api/v1/admin/reports', studentToken, {
        type: 'POST',
        ref_id: 'post-123',
        reason: 'Inappropriate content',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('report_id');
      expect(res.body.data.status).toBe('PENDING');
    });
  });

  describe('GET /api/v1/admin/reports', () => {
    it('should allow admin to view reports', async () => {
      // Create a report
      await authPost(app, '/api/v1/admin/reports', studentToken, {
        type: 'POST',
        ref_id: 'post-123',
        reason: 'Spam content',
      });

      const res = await authGet(app, '/api/v1/admin/reports?status=PENDING', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-admin', async () => {
      const res = await authGet(app, '/api/v1/admin/reports', studentToken);
      expect(res.status).toBe(403);
    });
  });

  // ─── Ban / Unban ────────────────────────────────────────────────────

  describe('PATCH /api/v1/admin/users/:id/ban', () => {
    it('should allow admin to ban user', async () => {
      const res = await authPatch(app,
        `/api/v1/admin/users/${studentUserId}/ban`,
        adminToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.is_banned).toBe(true);
    });

    it('should return 403 for non-admin', async () => {
      const res = await authPatch(app,
        `/api/v1/admin/users/${studentUserId}/ban`,
        studentToken,
      );

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/unban', () => {
    it('should allow admin to unban user', async () => {
      // Ban first
      await authPatch(app, `/api/v1/admin/users/${studentUserId}/ban`, adminToken);

      // Unban
      const res = await authPatch(app,
        `/api/v1/admin/users/${studentUserId}/unban`,
        adminToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data.is_banned).toBe(false);
    });
  });

  // ─── Role Change ────────────────────────────────────────────────────

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should allow SUPER_ADMIN to change user role', async () => {
      const res = await authPatch(app,
        `/api/v1/admin/users/${studentUserId}/role`,
        superAdminToken,
        { role: 'ADMIN' },
      );

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('should return 403 when ADMIN tries to change role (only SUPER_ADMIN can)', async () => {
      const res = await authPatch(app,
        `/api/v1/admin/users/${studentUserId}/role`,
        adminToken,
        { role: 'ADMIN' },
      );

      expect(res.status).toBe(403);
    });
  });

  // ─── Admin User Creation ───────────────────────────────────────────

  describe('POST /api/v1/admin/users', () => {
    it('should allow admin to create user accounts', async () => {
      const res = await authPost(app, '/api/v1/admin/users', adminToken, {
        email: 'newuser@despu.edu.in',
        password: 'SecurePass123!',
        name: 'Admin Created User',
        role: 'STUDENT',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('newuser@despu.edu.in');
    });

    it('should return 403 for non-admin', async () => {
      const res = await authPost(app, '/api/v1/admin/users', studentToken, {
        email: 'hack@despu.edu.in',
        password: 'SecurePass123!',
        name: 'Hacked User',
        role: 'ADMIN',
      });

      expect(res.status).toBe(403);
    });
  });

  // ─── Platform Stats ────────────────────────────────────────────────

  describe('GET /api/v1/admin/stats', () => {
    it('should return platform statistics', async () => {
      const res = await authGet(app, '/api/v1/admin/stats', adminToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('total_users');
      expect(res.body.data).toHaveProperty('total_posts');
    });

    it('should return 403 for non-admin', async () => {
      const res = await authGet(app, '/api/v1/admin/stats', studentToken);
      expect(res.status).toBe(403);
    });
  });

  // ─── Audit Logs ─────────────────────────────────────────────────────

  describe('GET /api/v1/admin/audit-logs', () => {
    it('should return audit logs for SUPER_ADMIN only', async () => {
      const res = await authGet(app, '/api/v1/admin/audit-logs', superAdminToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return 403 for regular ADMIN', async () => {
      const res = await authGet(app, '/api/v1/admin/audit-logs', adminToken);
      expect(res.status).toBe(403);
    });
  });
});
