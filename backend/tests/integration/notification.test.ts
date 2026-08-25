/**
 * Phase 4 — P4-M4: Notification Integration Tests
 *
 * Tests: notification list, unread count, mark read, mark all read
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPatch } from '../../helpers/auth.helper';

describe('P4-M4: Notification System', () => {
  let app: any;
  let academicData: any;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    const { user } = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'notif.user@despu.edu.in', stu_prn: 'NOTIF-001' });
    userId = user.user_id;
    userToken = generateTestToken({ user_id: userId, email: user.email, role: 'STUDENT' });

    // Seed some notifications directly
    const { prisma } = await import('../../../src/lib/prisma');
    await prisma.notification.createMany({
      data: [
        {
          user_id: userId,
          type: 'REPLY',
          data: { actor_id: 'someone', message: 'Replied to your post' },
          is_read: false,
        },
        {
          user_id: userId,
          type: 'UPVOTE',
          data: { actor_id: 'someone', message: 'Upvoted your post' },
          is_read: false,
        },
        {
          user_id: userId,
          type: 'ANNOUNCEMENT',
          data: { message: 'New announcement posted' },
          is_read: true,
        },
      ],
    });
  });

  // ─── List Notifications ────────────────────────────────────────────

  describe('GET /api/v1/notifications', () => {
    it('should return paginated notifications (newest first)', async () => {
      const res = await authGet(app, '/api/v1/notifications?page=1', userToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter unread only', async () => {
      const res = await authGet(app, '/api/v1/notifications?unread=true', userToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2); // 2 unread
      res.body.data.forEach((n: any) => {
        expect(n.is_read).toBe(false);
      });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });
  });

  // ─── Unread Count ──────────────────────────────────────────────────

  describe('GET /api/v1/notifications/unread-count', () => {
    it('should return correct unread count', async () => {
      const res = await authGet(app, '/api/v1/notifications/unread-count', userToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('count', 2);
    });
  });

  // ─── Mark Read ──────────────────────────────────────────────────────

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('should mark single notification as read', async () => {
      // Get notifications to find an ID
      const listRes = await authGet(app, '/api/v1/notifications?unread=true', userToken);
      const notifId = listRes.body.data[0].notif_id;

      const res = await authPatch(app, `/api/v1/notifications/${notifId}/read`, userToken);
      expect(res.status).toBe(200);

      // Verify unread count decreased
      const countRes = await authGet(app, '/api/v1/notifications/unread-count', userToken);
      expect(countRes.body.data.count).toBe(1);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await authPatch(app, '/api/v1/notifications/read-all', userToken);
      expect(res.status).toBe(200);

      // Verify all are read
      const countRes = await authGet(app, '/api/v1/notifications/unread-count', userToken);
      expect(countRes.body.data.count).toBe(0);
    });
  });
});
