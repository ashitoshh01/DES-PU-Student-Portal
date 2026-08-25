/**
 * Phase 3 — P3-M4: Resource & File Upload Integration Tests
 *
 * Tests: upload to R2, presigned download URLs, resource CRUD, topper notes
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import path from 'path';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
  createTestFaculty,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPatch, authDelete } from '../../helpers/auth.helper';

describe('P3-M4: File Storage (Cloudflare R2) & Resources', () => {
  let app: any;
  let academicData: any;
  let studentToken: string;
  let facultyToken: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    const { user: student } = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'res.student@despu.edu.in', stu_prn: 'RES-STU-001' });
    studentToken = generateTestToken({ user_id: student.user_id, email: student.email, role: 'STUDENT' });

    const { user: faculty } = await createTestFaculty({
      dept_id: academicData.department.dept_id,
      school_id: academicData.school.school_id,
    }, { email: 'res.faculty@despu.edu.in', fac_prn: 'RES-FAC-001' });
    facultyToken = generateTestToken({ user_id: faculty.user_id, email: faculty.email, role: 'FACULTY' });
  });

  // ─── Upload ─────────────────────────────────────────────────────────

  describe('POST /api/v1/resources/upload', () => {
    it('should upload a file and create resource record → 201', async () => {
      const res = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'DSA Notes Chapter 1')
        .attach('file', Buffer.from('fake pdf content'), {
          filename: 'dsa-notes.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('res_id');
      expect(res.body.data.title).toBe('DSA Notes Chapter 1');
      expect(res.body.data).toHaveProperty('r2_key');
    });

    it('should reject upload exceeding 50MB → 413', async () => {
      // Create a buffer > 50MB (we simulate with a smaller size check)
      const largeBuffer = Buffer.alloc(51 * 1024 * 1024); // 51MB

      const res = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Too Large')
        .attach('file', largeBuffer, {
          filename: 'large.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(413);
    });

    it('should reject disallowed file types → 400', async () => {
      const res = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Malicious File')
        .attach('file', Buffer.from('malicious content'), {
          filename: 'malware.exe',
          contentType: 'application/x-msdownload',
        });

      expect(res.status).toBe(400);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/resources/upload')
        .field('sub_id', academicData.subject1.sub_id)
        .field('title', 'Unauthorized')
        .attach('file', Buffer.from('test'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(401);
    });
  });

  // ─── List Resources ─────────────────────────────────────────────────

  describe('GET /api/v1/resources', () => {
    it('should return resources filtered by subject', async () => {
      // Upload a resource first
      await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Test Resource')
        .attach('file', Buffer.from('content'), {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      const res = await authGet(app,
        `/api/v1/resources?subId=${academicData.subject1.sub_id}&semId=${academicData.semester.sem_id}`,
        studentToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter topper notes only', async () => {
      const res = await authGet(app,
        `/api/v1/resources?subId=${academicData.subject1.sub_id}&topper=true`,
        studentToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      // All returned should be topper notes (or empty)
      res.body.data.forEach((r: any) => {
        expect(r.is_topper_note).toBe(true);
      });
    });
  });

  // ─── Download ───────────────────────────────────────────────────────

  describe('GET /api/v1/resources/:id/download', () => {
    it('should return a presigned URL', async () => {
      // Upload first
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Downloadable')
        .attach('file', Buffer.from('downloadable content'), {
          filename: 'download.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      const res = await authGet(app,
        `/api/v1/resources/${resourceId}/download`,
        studentToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('url');
      expect(res.body.data.url).toContain('http');
    });

    it('should increment download_count', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Count Downloads')
        .attach('file', Buffer.from('content'), {
          filename: 'count.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      // Download twice
      await authGet(app, `/api/v1/resources/${resourceId}/download`, studentToken);
      await authGet(app, `/api/v1/resources/${resourceId}/download`, studentToken);

      // Check count
      const res = await authGet(app, `/api/v1/resources/${resourceId}`, studentToken);
      expect(res.body.data.download_count).toBeGreaterThanOrEqual(2);
    });
  });

  // ─── Topper Note ────────────────────────────────────────────────────

  describe('PATCH /api/v1/resources/:id/topper', () => {
    it('should allow faculty to mark as topper note', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Topper Note Candidate')
        .attach('file', Buffer.from('excellent notes'), {
          filename: 'topper.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      const res = await authPatch(app,
        `/api/v1/resources/${resourceId}/topper`,
        facultyToken,
        { is_topper_note: true },
      );

      expect(res.status).toBe(200);
      expect(res.body.data.is_topper_note).toBe(true);
    });

    it('should return 403 when student tries to mark topper note', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Not a Topper')
        .attach('file', Buffer.from('notes'), {
          filename: 'regular.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      const res = await authPatch(app,
        `/api/v1/resources/${resourceId}/topper`,
        studentToken,
        { is_topper_note: true },
      );

      expect(res.status).toBe(403);
    });
  });

  // ─── Delete ─────────────────────────────────────────────────────────

  describe('DELETE /api/v1/resources/:id', () => {
    it('should allow owner to delete resource', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Delete Me')
        .attach('file', Buffer.from('delete this'), {
          filename: 'delete.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      const res = await authDelete(app, `/api/v1/resources/${resourceId}`, studentToken);
      expect(res.status).toBe(200);
    });

    it('should return 403 when non-owner/non-admin tries to delete', async () => {
      const uploadRes = await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'Protected Resource')
        .attach('file', Buffer.from('protected'), {
          filename: 'protected.pdf',
          contentType: 'application/pdf',
        });
      const resourceId = uploadRes.body.data.res_id;

      const { user: otherUser } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'other.res@despu.edu.in', stu_prn: 'OTHER-RES-001' });
      const otherToken = generateTestToken({ user_id: otherUser.user_id, email: otherUser.email, role: 'STUDENT' });

      const res = await authDelete(app, `/api/v1/resources/${resourceId}`, otherToken);
      expect(res.status).toBe(403);
    });
  });

  // ─── My Uploads ─────────────────────────────────────────────────────

  describe('GET /api/v1/resources/my-uploads', () => {
    it('should return only current user uploads', async () => {
      await request(app)
        .post('/api/v1/resources/upload')
        .set('Cookie', [`token=${studentToken}`])
        .field('sub_id', academicData.subject1.sub_id)
        .field('sem_id', academicData.semester.sem_id)
        .field('title', 'My Upload')
        .attach('file', Buffer.from('my content'), {
          filename: 'mine.pdf',
          contentType: 'application/pdf',
        });

      const res = await authGet(app, '/api/v1/resources/my-uploads', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
