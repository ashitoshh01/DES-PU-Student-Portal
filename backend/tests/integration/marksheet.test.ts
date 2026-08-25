/**
 * Phase 5 — P5-M3: Marksheet Integration Tests
 *
 * Tests: marksheet CRUD, SGPA/CGPA calculation, access control
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
  createTestFaculty,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost } from '../../helpers/auth.helper';

describe('P5-M3: Marksheet Module', () => {
  let app: any;
  let academicData: any;
  let studentUser: any;
  let studentData: any;
  let studentToken: string;
  let facultyToken: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    studentData = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'marks.student@despu.edu.in', stu_prn: 'MARKS-STU-001' });
    studentUser = studentData.user;
    studentToken = generateTestToken({ user_id: studentUser.user_id, email: studentUser.email, role: 'STUDENT' });

    const { user: faculty } = await createTestFaculty({
      dept_id: academicData.department.dept_id,
      school_id: academicData.school.school_id,
    }, { email: 'marks.faculty@despu.edu.in', fac_prn: 'MARKS-FAC-001' });
    facultyToken = generateTestToken({ user_id: faculty.user_id, email: faculty.email, role: 'FACULTY' });
  });

  // ─── Create Marksheet ──────────────────────────────────────────────

  describe('POST /api/v1/marksheets', () => {
    it('should allow faculty to create marksheet → 201', async () => {
      const res = await authPost(app, '/api/v1/marksheets', facultyToken, {
        student_id: studentData.student.student_id,
        sem_id: academicData.semester.sem_id,
        results: [
          {
            sub_id: academicData.subject1.sub_id,
            marks_obtained: 85,
            grade: 'A',
            grade_point: 9.0,
            course_credit: 4,
            credit_point: 36.0,
          },
          {
            sub_id: academicData.subject2.sub_id,
            marks_obtained: 78,
            grade: 'B+',
            grade_point: 8.0,
            course_credit: 4,
            credit_point: 32.0,
          },
        ],
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('marksheet_id');
      expect(res.body.data.results).toHaveLength(2);
    });

    it('should return 403 when student tries to create marksheet', async () => {
      const res = await authPost(app, '/api/v1/marksheets', studentToken, {
        student_id: studentData.student.student_id,
        sem_id: academicData.semester.sem_id,
        results: [],
      });

      expect(res.status).toBe(403);
    });

    it('should reject duplicate marksheet for same student+semester → 409', async () => {
      const payload = {
        student_id: studentData.student.student_id,
        sem_id: academicData.semester.sem_id,
        results: [
          {
            sub_id: academicData.subject1.sub_id,
            marks_obtained: 85,
            grade: 'A',
            grade_point: 9.0,
            course_credit: 4,
            credit_point: 36.0,
          },
        ],
      };

      await authPost(app, '/api/v1/marksheets', facultyToken, payload);
      const res = await authPost(app, '/api/v1/marksheets', facultyToken, payload);

      expect(res.status).toBe(409);
    });
  });

  // ─── View Marksheets ───────────────────────────────────────────────

  describe('GET /api/v1/marksheets/my', () => {
    it('should return student own marksheets with SGPA', async () => {
      // Create marksheet
      await authPost(app, '/api/v1/marksheets', facultyToken, {
        student_id: studentData.student.student_id,
        sem_id: academicData.semester.sem_id,
        results: [
          {
            sub_id: academicData.subject1.sub_id,
            marks_obtained: 85,
            grade: 'A',
            grade_point: 9.0,
            course_credit: 4,
            credit_point: 36.0,
          },
          {
            sub_id: academicData.subject2.sub_id,
            marks_obtained: 78,
            grade: 'B+',
            grade_point: 8.0,
            course_credit: 4,
            credit_point: 32.0,
          },
        ],
      });

      const res = await authGet(app, '/api/v1/marksheets/my', studentToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);

      // SGPA = sum(credit_point) / sum(course_credit) = (36 + 32) / (4 + 4) = 8.5
      const marksheet = res.body.data[0];
      expect(marksheet).toHaveProperty('sgpa');
      expect(marksheet.sgpa).toBeCloseTo(8.5, 1);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/v1/marksheets/my');
      expect(res.status).toBe(401);
    });
  });

  // ─── Faculty View ──────────────────────────────────────────────────

  describe('GET /api/v1/marksheets/student/:studentId', () => {
    it('should allow faculty to view student marksheets', async () => {
      await authPost(app, '/api/v1/marksheets', facultyToken, {
        student_id: studentData.student.student_id,
        sem_id: academicData.semester.sem_id,
        results: [
          {
            sub_id: academicData.subject1.sub_id,
            marks_obtained: 90,
            grade: 'A+',
            grade_point: 10.0,
            course_credit: 4,
            credit_point: 40.0,
          },
        ],
      });

      const res = await authGet(app,
        `/api/v1/marksheets/student/${studentData.student.student_id}`,
        facultyToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should return 403 when student tries to view another student marks', async () => {
      const { student: otherStudent, user: otherUser } = await createTestStudent({
        dept_id: academicData.department.dept_id,
        div_id: academicData.division.div_id,
        school_id: academicData.school.school_id,
      }, { email: 'other.student@despu.edu.in', stu_prn: 'OTHER-MARKS-001' });

      const res = await authGet(app,
        `/api/v1/marksheets/student/${otherStudent.student_id}`,
        studentToken,
      );

      expect(res.status).toBe(403);
    });
  });
});
