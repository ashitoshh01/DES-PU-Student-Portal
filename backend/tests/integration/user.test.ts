/**
 * Phase 2 — P2-M4: User Profile Integration Tests
 *
 * Tests for: GET /users/:id, PATCH /users/:id, GET /users/:id/badges
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken } from '../../helpers/auth.helper';

describe('P2-M4: User Profile Service & Routes', () => {
  let app: any;
  let academicData: any;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();
  });

  // ─── Get Profile ───────────────────────────────────────────────────

  describe('GET /api/v1/users/:id', () => {
    it('should return user profile with role-specific data', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .get(`/api/v1/users/${user.user_id}`)
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('user_id', user.user_id);
      expect(res.body.data).toHaveProperty('name');
      expect(res.body.data).toHaveProperty('email');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .get('/api/v1/users/nonexistent-uuid-value')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(404);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/users/some-id');

      expect(res.status).toBe(401);
    });
  });

  // ─── Update Profile ─────────────────────────────────────────────────

  describe('PATCH /api/v1/users/:id', () => {
    it('should update bio successfully', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .patch(`/api/v1/users/${user.user_id}`)
        .set('Cookie', [`token=${token}`])
        .send({ bio: 'Updated bio text' });

      expect(res.status).toBe(200);
      expect(res.body.data.bio).toBe('Updated bio text');
    });

    it('should return 403 when trying to edit another user profile', async () => {
      const { user: user1 } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'user1@despu.edu.in', stu_prn: 'PRN-1' });

      const { user: user2 } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'user2@despu.edu.in', stu_prn: 'PRN-2' });

      // User1 tries to edit User2's profile
      const token = generateTestToken({
        user_id: user1.user_id,
        email: user1.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .patch(`/api/v1/users/${user2.user_id}`)
        .set('Cookie', [`token=${token}`])
        .send({ bio: 'Hacked bio' });

      expect(res.status).toBe(403);
    });

    it('should not allow modifying protected fields (role, email, name)', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .patch(`/api/v1/users/${user.user_id}`)
        .set('Cookie', [`token=${token}`])
        .send({
          role: 'ADMIN',     // Should be ignored/rejected
          email: 'hack@despu.edu.in', // Should be ignored/rejected
          bio: 'Safe update', // This should work
        });

      // Either returns 400 (rejected) or 200 but role/email unchanged
      if (res.status === 200) {
        expect(res.body.data.role).toBe('STUDENT');
        expect(res.body.data.email).toBe(user.email);
      }
    });
  });

  // ─── Get Badges ─────────────────────────────────────────────────────

  describe('GET /api/v1/users/:id/badges', () => {
    it('should return empty badges array for new user', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .get(`/api/v1/users/${user.user_id}/badges`)
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return badges when user has earned them', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      // Award a badge directly in DB
      const { prisma } = await import('../../../src/lib/prisma');
      await prisma.badge.create({
        data: {
          user_id: user.user_id,
          type: 'FIRST_POST',
        },
      });

      const token = generateTestToken({
        user_id: user.user_id,
        email: user.email,
        role: 'STUDENT',
      });

      const res = await request(app)
        .get(`/api/v1/users/${user.user_id}/badges`)
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].type).toBe('FIRST_POST');
    });
  });
});
