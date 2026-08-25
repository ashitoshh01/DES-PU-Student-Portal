/**
 * Phase 6 — P6-M3: Search Integration Tests
 *
 * Tests: full-text search across posts, resources, projects, users
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost } from '../../helpers/auth.helper';

describe('P6-M3: Search Infrastructure', () => {
  let app: any;
  let academicData: any;
  let studentToken: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    const studentData = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'search@despu.edu.in', stu_prn: 'SEARCH-001' });
    studentToken = generateTestToken({
      user_id: studentData.user.user_id,
      email: studentData.user.email,
      role: 'STUDENT',
    });

    // Enroll student
    const { prisma } = await import('../../../src/lib/prisma');
    await prisma.studentSubject.create({
      data: {
        student_id: studentData.student.student_id,
        sub_id: academicData.subject1.sub_id,
        sem_id: academicData.semester.sem_id,
      },
    });

    // Seed searchable content
    await prisma.post.createMany({
      data: [
        {
          author_id: studentData.user.user_id,
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          title: 'Introduction to Machine Learning',
          content: 'This post covers the basics of machine learning algorithms',
          type: 'DISCUSSION',
        },
        {
          author_id: studentData.user.user_id,
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          title: 'Database Normalization Forms',
          content: 'Understanding 1NF, 2NF, 3NF, and BCNF',
          type: 'QUESTION',
        },
        {
          author_id: studentData.user.user_id,
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          title: 'Binary Tree Traversal Methods',
          content: 'Inorder, preorder, and postorder traversal explained',
          type: 'DISCUSSION',
        },
      ],
    });
  });

  // ─── Search ─────────────────────────────────────────────────────────

  describe('GET /api/v1/search', () => {
    it('should return matching results for keyword search', async () => {
      const res = await authGet(app, '/api/v1/search?q=machine+learning', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by type (posts only)', async () => {
      const res = await authGet(app, '/api/v1/search?q=database&type=posts', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return empty array for no matches', async () => {
      const res = await authGet(app, '/api/v1/search?q=xyznonexistent123', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('should return 400 for empty query', async () => {
      const res = await authGet(app, '/api/v1/search?q=', studentToken);

      expect(res.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/search?q=test');
      expect(res.status).toBe(401);
    });
  });

  // ─── Search Suggestions ────────────────────────────────────────────

  describe('GET /api/v1/search/suggest', () => {
    it('should return autocomplete suggestions', async () => {
      const res = await authGet(app, '/api/v1/search/suggest?q=mach', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
