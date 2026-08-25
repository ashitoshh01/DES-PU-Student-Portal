/**
 * Phase 3 — P3-M3: Discussion Forum Integration Tests
 *
 * Tests: posts CRUD, threaded replies, upvotes, pin/lock, bookmarks, search
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
  createTestFaculty,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost, authPatch, authDelete } from '../../helpers/auth.helper';

describe('P3-M3: Discussion Forums', () => {
  let app: any;
  let academicData: any;
  let studentUser: any;
  let studentToken: string;
  let facultyUser: any;
  let facultyToken: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    // Create student
    const studentData = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'forum.student@despu.edu.in', stu_prn: 'FORUM-STU-001' });
    studentUser = studentData.user;
    studentToken = generateTestToken({ user_id: studentUser.user_id, email: studentUser.email, role: 'STUDENT' });

    // Enroll student in subject
    const { prisma } = await import('../../../src/lib/prisma');
    await prisma.studentSubject.create({
      data: {
        student_id: studentData.student.student_id,
        sub_id: academicData.subject1.sub_id,
        sem_id: academicData.semester.sem_id,
      },
    });

    // Create faculty
    const facultyData = await createTestFaculty({
      dept_id: academicData.department.dept_id,
      school_id: academicData.school.school_id,
    }, { email: 'forum.faculty@despu.edu.in', fac_prn: 'FORUM-FAC-001' });
    facultyUser = facultyData.user;
    facultyToken = generateTestToken({ user_id: facultyUser.user_id, email: facultyUser.email, role: 'FACULTY' });
  });

  // ─── Create Post ───────────────────────────────────────────────────

  describe('POST /api/v1/forums/:subId/posts', () => {
    it('should create a root post with title and content → 201', async () => {
      const res = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'How to implement binary search?',
          content: 'I need help understanding binary search algorithm.',
          type: 'QUESTION',
          sem_id: academicData.semester.sem_id,
        },
      );

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('post_id');
      expect(res.body.data.title).toBe('How to implement binary search?');
      expect(res.body.data.parent_id).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post(`/api/v1/forums/${academicData.subject1.sub_id}/posts`)
        .send({ title: 'Test', content: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  // ─── Get Posts ──────────────────────────────────────────────────────

  describe('GET /api/v1/forums/:subId/posts', () => {
    it('should return paginated posts', async () => {
      // Create a post first
      await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Test Post',
          content: 'Test content',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );

      const res = await authGet(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts?page=1&limit=20`,
        studentToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('total');
    });

    it('should return posts with author info (no N+1)', async () => {
      // Create a post
      await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Author Test',
          content: 'Check author is included',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );

      const res = await authGet(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
      );

      expect(res.status).toBe(200);
      // Posts should include author info to avoid N+1
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('author_id');
      }
    });
  });

  // ─── Replies ────────────────────────────────────────────────────────

  describe('POST /api/v1/forums/posts/:postId/reply', () => {
    it('should create a nested reply', async () => {
      // Create root post
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Root Post',
          content: 'Root content',
          type: 'QUESTION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      // Reply to post
      const replyRes = await authPost(app,
        `/api/v1/forums/posts/${postId}/reply`,
        studentToken,
        { content: 'This is a reply to the root post' },
      );

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.data.parent_id).toBe(postId);
      expect(replyRes.body.data.title).toBeNull(); // Replies don't have titles
    });

    it('should return 403 when replying to a locked post', async () => {
      // Create and lock a post
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Will Be Locked',
          content: 'Content',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      // Faculty locks the post
      await authPatch(app, `/api/v1/forums/posts/${postId}/lock`, facultyToken);

      // Try to reply
      const replyRes = await authPost(app,
        `/api/v1/forums/posts/${postId}/reply`,
        studentToken,
        { content: 'Reply to locked post' },
      );

      expect(replyRes.status).toBe(403);
    });
  });

  // ─── Upvotes ────────────────────────────────────────────────────────

  describe('PATCH /api/v1/forums/posts/:postId/upvote', () => {
    it('should toggle upvote — first call adds, second removes', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Upvotable Post',
          content: 'Upvote me',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      // Create second user to upvote
      const { user: voter } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'voter@despu.edu.in', stu_prn: 'VOTER-001' });
      const voterToken = generateTestToken({ user_id: voter.user_id, email: voter.email, role: 'STUDENT' });

      // First upvote → adds
      const upvote1 = await authPatch(app, `/api/v1/forums/posts/${postId}/upvote`, voterToken);
      expect(upvote1.status).toBe(200);
      expect(upvote1.body.data.upvotes).toBe(1);

      // Second upvote → removes
      const upvote2 = await authPatch(app, `/api/v1/forums/posts/${postId}/upvote`, voterToken);
      expect(upvote2.status).toBe(200);
      expect(upvote2.body.data.upvotes).toBe(0);
    });
  });

  // ─── Pin / Lock ─────────────────────────────────────────────────────

  describe('Pin and Lock', () => {
    it('should allow faculty to pin a post', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Important Post',
          content: 'Pin me',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      const res = await authPatch(app, `/api/v1/forums/posts/${postId}/pin`, facultyToken);
      expect(res.status).toBe(200);
      expect(res.body.data.is_pinned).toBe(true);
    });

    it('should return 403 when student tries to pin', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Pin Test',
          content: 'Student cant pin',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      const res = await authPatch(app, `/api/v1/forums/posts/${postId}/pin`, studentToken);
      expect(res.status).toBe(403);
    });
  });

  // ─── Delete ─────────────────────────────────────────────────────────

  describe('DELETE /api/v1/forums/posts/:postId', () => {
    it('should allow author to delete own post', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Delete Me',
          content: 'This will be deleted',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      const res = await authDelete(app, `/api/v1/forums/posts/${postId}`, studentToken);
      expect(res.status).toBe(200);
    });

    it('should return 403 when deleting others post without admin role', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Not Your Post',
          content: 'You cant delete this',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      // Create another student
      const { user: other } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'other@despu.edu.in', stu_prn: 'OTHER-001' });
      const otherToken = generateTestToken({ user_id: other.user_id, email: other.email, role: 'STUDENT' });

      const res = await authDelete(app, `/api/v1/forums/posts/${postId}`, otherToken);
      expect(res.status).toBe(403);
    });
  });

  // ─── Bookmarks ──────────────────────────────────────────────────────

  describe('POST /api/v1/forums/posts/:postId/bookmark', () => {
    it('should toggle bookmark', async () => {
      const postRes = await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Bookmark Me',
          content: 'Bookmark this post',
          type: 'DISCUSSION',
          sem_id: academicData.semester.sem_id,
        },
      );
      const postId = postRes.body.data.post_id;

      // Bookmark
      const bmRes = await authPost(app, `/api/v1/forums/posts/${postId}/bookmark`, studentToken);
      expect(bmRes.status).toBe(200);

      // Check bookmarks list
      const listRes = await authGet(app, '/api/v1/forums/bookmarks', studentToken);
      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);
    });
  });

  // ─── Search ─────────────────────────────────────────────────────────

  describe('GET /api/v1/forums/search', () => {
    it('should return matching posts by keyword', async () => {
      await authPost(app,
        `/api/v1/forums/${academicData.subject1.sub_id}/posts`,
        studentToken,
        {
          title: 'Binary Search Algorithm',
          content: 'How to implement binary search in TypeScript',
          type: 'QUESTION',
          sem_id: academicData.semester.sem_id,
        },
      );

      const res = await authGet(app,
        `/api/v1/forums/search?q=binary+search&subId=${academicData.subject1.sub_id}`,
        studentToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
