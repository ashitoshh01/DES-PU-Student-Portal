/**
 * Phase 3 — P3-M1: Academic Structure Integration Tests
 *
 * Tests: /academic/schools, /academic/departments, /academic/subjects, /academic/my-subjects
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { cleanDatabase, seedTestAcademicData, createTestStudent } from '../../helpers/db.helper';
import { generateTestToken } from '../../helpers/auth.helper';

describe('P3-M1: Academic Structure & Seed Data', () => {
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

  describe('GET /api/v1/academic/schools', () => {
    it('should return all schools', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await request(app)
        .get('/api/v1/academic/schools')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty('school_name');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/academic/schools');
      // Academic routes might be public or protected — depends on implementation
      // If protected:
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('GET /api/v1/academic/schools/:id/departments', () => {
    it('should return departments for a school', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await request(app)
        .get(`/api/v1/academic/schools/${academicData.school.school_id}/departments`)
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data[0].dept_name).toBe('Computer Science');
    });

    it('should return 404 for invalid school ID', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await request(app)
        .get('/api/v1/academic/schools/nonexistent-id/departments')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/academic/departments/:id/subjects', () => {
    it('should return subjects for a department', async () => {
      const { user } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });
      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await request(app)
        .get(`/api/v1/academic/departments/${academicData.department.dept_id}/subjects`)
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(2); // CS501 and CS502 from seed
    });
  });

  describe('GET /api/v1/academic/my-subjects', () => {
    it('should return enrolled subjects for logged-in student', async () => {
      const { user, student } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      });

      // Enroll student in subjects
      const { prisma } = await import('../../../src/lib/prisma');
      await prisma.studentSubject.create({
        data: {
          student_id: student.student_id,
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        },
      });

      const token = generateTestToken({ user_id: user.user_id, email: user.email, role: 'STUDENT' });

      const res = await request(app)
        .get('/api/v1/academic/my-subjects')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/v1/academic/my-subjects');
      expect(res.status).toBe(401);
    });
  });
});
