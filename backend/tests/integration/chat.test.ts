/**
 * Phase 4 — P4-M2: Chat Integration Tests
 *
 * Tests: conversations, messages, groups, membership
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost, authDelete } from '../../helpers/auth.helper';

describe('P4-M2: Real-Time Chat', () => {
  let app: any;
  let academicData: any;
  let user1: any, user2: any, user3: any;
  let token1: string, token2: string, token3: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    // Create 3 test users
    const s1 = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'chat1@despu.edu.in', stu_prn: 'CHAT-001' });
    user1 = s1.user;
    token1 = generateTestToken({ user_id: user1.user_id, email: user1.email, role: 'STUDENT' });

    const s2 = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'chat2@despu.edu.in', stu_prn: 'CHAT-002' });
    user2 = s2.user;
    token2 = generateTestToken({ user_id: user2.user_id, email: user2.email, role: 'STUDENT' });

    const s3 = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'chat3@despu.edu.in', stu_prn: 'CHAT-003' });
    user3 = s3.user;
    token3 = generateTestToken({ user_id: user3.user_id, email: user3.email, role: 'STUDENT' });
  });

  // ─── Direct Conversations ──────────────────────────────────────────

  describe('POST /api/v1/chat/conversations', () => {
    it('should create a 1-to-1 conversation → 201', async () => {
      const res = await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('conv_id');
      expect(res.body.data.type).toBe('DIRECT');
    });

    it('should return existing conversation if 1-to-1 already exists', async () => {
      // Create first
      const res1 = await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });

      // Create again — should return same conversation
      const res2 = await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });

      expect(res2.body.data.conv_id).toBe(res1.body.data.conv_id);
    });
  });

  // ─── Group Conversations ───────────────────────────────────────────

  describe('POST /api/v1/chat/groups', () => {
    it('should create a group chat → 201', async () => {
      const res = await authPost(app, '/api/v1/chat/groups', token1, {
        name: 'Study Group',
        member_ids: [user2.user_id, user3.user_id],
      });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe('GROUP');
      expect(res.body.data.name).toBe('Study Group');
    });

    it('should add creator as member automatically', async () => {
      const res = await authPost(app, '/api/v1/chat/groups', token1, {
        name: 'My Group',
        member_ids: [user2.user_id],
      });

      // Get conversation details to check members
      const convRes = await authGet(app,
        `/api/v1/chat/conversations/${res.body.data.conv_id}`,
        token1,
      );

      expect(convRes.status).toBe(200);
      // Creator should be a member
      const memberIds = convRes.body.data.members?.map((m: any) => m.user_id) || [];
      expect(memberIds).toContain(user1.user_id);
    });
  });

  // ─── List Conversations ────────────────────────────────────────────

  describe('GET /api/v1/chat/conversations', () => {
    it('should list user conversations', async () => {
      // Create a conversation
      await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });

      const res = await authGet(app, '/api/v1/chat/conversations', token1);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/chat/conversations');
      expect(res.status).toBe(401);
    });
  });

  // ─── Conversation Messages ─────────────────────────────────────────

  describe('GET /api/v1/chat/conversations/:id', () => {
    it('should return conversation with paginated messages', async () => {
      const convRes = await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });
      const convId = convRes.body.data.conv_id;

      const res = await authGet(app,
        `/api/v1/chat/conversations/${convId}`,
        token1,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('conv_id');
      expect(res.body.data).toHaveProperty('messages');
    });

    it('should return 403 when non-member tries to access', async () => {
      const convRes = await authPost(app, '/api/v1/chat/conversations', token1, {
        participant_id: user2.user_id,
      });
      const convId = convRes.body.data.conv_id;

      // User3 is not a member
      const res = await authGet(app,
        `/api/v1/chat/conversations/${convId}`,
        token3,
      );

      expect(res.status).toBe(403);
    });
  });

  // ─── Group Members ─────────────────────────────────────────────────

  describe('Group Member Management', () => {
    it('should allow group admin to add members', async () => {
      const groupRes = await authPost(app, '/api/v1/chat/groups', token1, {
        name: 'Expandable Group',
        member_ids: [user2.user_id],
      });
      const convId = groupRes.body.data.conv_id;

      const res = await authPost(app,
        `/api/v1/chat/groups/${convId}/members`,
        token1,
        { user_id: user3.user_id },
      );

      expect(res.status).toBe(200);
    });

    it('should allow group admin to remove members', async () => {
      const groupRes = await authPost(app, '/api/v1/chat/groups', token1, {
        name: 'Shrinkable Group',
        member_ids: [user2.user_id, user3.user_id],
      });
      const convId = groupRes.body.data.conv_id;

      const res = await authDelete(app,
        `/api/v1/chat/groups/${convId}/members/${user3.user_id}`,
        token1,
      );

      expect(res.status).toBe(200);
    });
  });
});
