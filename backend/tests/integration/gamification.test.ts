/**
 * Phase 5 — P5-M1: Gamification & Leaderboard Integration Tests
 *
 * Tests: XP award, badge auto-award, leaderboard
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken, authGet } from '../../helpers/auth.helper';

describe('P5-M1: XP & Badge System', () => {
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

  // ─── Leaderboard ───────────────────────────────────────────────────

  describe('GET /api/v1/leaderboard', () => {
    it('should return top users sorted by XP', async () => {
      const { prisma } = await import('../../../src/lib/prisma');

      // Create users with different XP levels
      const { user: topUser } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'top@despu.edu.in', stu_prn: 'TOP-001' });
      await prisma.user.update({ where: { user_id: topUser.user_id }, data: { xp_total: 500 } });

      const { user: midUser } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'mid@despu.edu.in', stu_prn: 'MID-001' });
      await prisma.user.update({ where: { user_id: midUser.user_id }, data: { xp_total: 200 } });

      const { user: lowUser } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'low@despu.edu.in', stu_prn: 'LOW-001' });
      await prisma.user.update({ where: { user_id: lowUser.user_id }, data: { xp_total: 50 } });

      const token = generateTestToken({ user_id: topUser.user_id, email: topUser.email, role: 'STUDENT' });

      const res = await authGet(app, '/api/v1/leaderboard', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      // First user should have highest XP
      expect(res.body.data[0].xp_total).toBeGreaterThanOrEqual(res.body.data[1].xp_total);
    });

    it('should filter by department', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'dept.lb@despu.edu.in', stu_prn: 'DEPT-LB-001' });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await authGet(app,
        `/api/v1/leaderboard?dept=${academicData.department.dept_id}`,
        token,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ─── My Rank ────────────────────────────────────────────────────────

  describe('GET /api/v1/leaderboard/my-rank', () => {
    it('should return current user rank', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'rank@despu.edu.in', stu_prn: 'RANK-001' });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await authGet(app, '/api/v1/leaderboard/my-rank', token);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('rank');
      expect(res.body.data).toHaveProperty('xp_total');
      expect(typeof res.body.data.rank).toBe('number');
    });
  });

  // ─── XP History ─────────────────────────────────────────────────────

  describe('GET /api/v1/users/:id/xp-history', () => {
    it('should return XP events for a user', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'xp@despu.edu.in', stu_prn: 'XP-001' });

      // Create XP events directly
      const { prisma } = await import('../../../src/lib/prisma');
      await prisma.xpEvent.createMany({
        data: [
          { user_id: user.user_id, points: 10, reason: 'Post created' },
          { user_id: user.user_id, points: 5, reason: 'Reply upvoted' },
          { user_id: user.user_id, points: 15, reason: 'Resource uploaded' },
        ],
      });

      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await authGet(app, `/api/v1/users/${user.user_id}/xp-history`, token);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(3);
    });
  });

  // ─── Badge Auto-Award ──────────────────────────────────────────────

  describe('Badge Auto-Award', () => {
    it('should not award the same badge twice', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'badge@despu.edu.in', stu_prn: 'BADGE-001' });

      const { prisma } = await import('../../../src/lib/prisma');

      // Award badge once
      await prisma.badge.create({
        data: { user_id: user.user_id, type: 'FIRST_POST' },
      });

      // Try to award again — should fail due to unique constraint
      await expect(
        prisma.badge.create({
          data: { user_id: user.user_id, type: 'FIRST_POST' },
        }),
      ).rejects.toThrow();
    });
  });
});
