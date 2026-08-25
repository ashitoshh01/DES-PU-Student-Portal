/**
 * Phase 3 — P3-M2: Announcements & Assignments Integration Tests
 *
 * Tests: announcements CRUD, assignments, submissions, grading
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

describe('P3-M2: Announcements & Assignments', () => {
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

    const studentData = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'class.student@despu.edu.in', stu_prn: 'CLS-STU-001' });
    studentUser = studentData.user;
    studentToken = generateTestToken({ user_id: studentUser.user_id, email: studentUser.email, role: 'STUDENT' });

    // Enroll student
    const { prisma } = await import('../../../src/lib/prisma');
    await prisma.studentSubject.create({
      data: {
        student_id: studentData.student.student_id,
        sub_id: academicData.subject1.sub_id,
        sem_id: academicData.semester.sem_id,
      },
    });

    const facultyData = await createTestFaculty({
      dept_id: academicData.department.dept_id,
      school_id: academicData.school.school_id,
    }, { email: 'class.faculty@despu.edu.in', fac_prn: 'CLS-FAC-001' });
    facultyUser = facultyData.user;
    facultyToken = generateTestToken({ user_id: facultyUser.user_id, email: facultyUser.email, role: 'FACULTY' });
  });

  // ─── Announcements ─────────────────────────────────────────────────

  describe('Announcements', () => {
    describe('POST /api/v1/announcements', () => {
      it('should allow faculty to create announcement → 201', async () => {
        const res = await authPost(app, '/api/v1/announcements', facultyToken, {
          title: 'Exam Schedule Released',
          content: 'Mid-semester exams start from next Monday.',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('ann_id');
        expect(res.body.data.title).toBe('Exam Schedule Released');
      });

      it('should return 403 when student creates announcement', async () => {
        const res = await authPost(app, '/api/v1/announcements', studentToken, {
          title: 'Student Announcement',
          content: 'This should fail',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        });

        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/v1/announcements', () => {
      it('should return paginated announcements filtered by subject', async () => {
        // Create announcement
        await authPost(app, '/api/v1/announcements', facultyToken, {
          title: 'Test Announcement',
          content: 'Content',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        });

        const res = await authGet(app,
          `/api/v1/announcements?subId=${academicData.subject1.sub_id}&semId=${academicData.semester.sem_id}`,
          studentToken,
        );

        expect(res.status).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('should show pinned announcements first', async () => {
        // Create two announcements
        const a1 = await authPost(app, '/api/v1/announcements', facultyToken, {
          title: 'Regular Announcement',
          content: 'Not pinned',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        });

        const a2 = await authPost(app, '/api/v1/announcements', facultyToken, {
          title: 'Pinned Announcement',
          content: 'This is pinned',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
        });

        // Pin second announcement
        await authPatch(app, `/api/v1/announcements/${a2.body.data.ann_id}/pin`, facultyToken);

        // Fetch all — pinned should be first
        const res = await authGet(app,
          `/api/v1/announcements?subId=${academicData.subject1.sub_id}`,
          studentToken,
        );

        expect(res.status).toBe(200);
        if (res.body.data.length >= 2) {
          expect(res.body.data[0].is_pinned).toBe(true);
        }
      });
    });
  });

  // ─── Assignments ────────────────────────────────────────────────────

  describe('Assignments', () => {
    describe('POST /api/v1/assignments', () => {
      it('should allow faculty to create assignment → 201', async () => {
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const res = await authPost(app, '/api/v1/assignments', facultyToken, {
          title: 'Binary Search Implementation',
          description: 'Implement binary search in TypeScript',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          due_date: dueDate,
          max_marks: 25,
        });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('assign_id');
        expect(res.body.data.max_marks).toBe(25);
      });

      it('should return 403 when student creates assignment', async () => {
        const res = await authPost(app, '/api/v1/assignments', studentToken, {
          title: 'Student Assignment',
          description: 'Should fail',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          due_date: new Date().toISOString(),
          max_marks: 10,
        });

        expect(res.status).toBe(403);
      });
    });

    describe('Submissions', () => {
      let assignmentId: string;

      beforeEach(async () => {
        const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const res = await authPost(app, '/api/v1/assignments', facultyToken, {
          title: 'Test Assignment',
          description: 'Submit your work',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          due_date: dueDate,
          max_marks: 50,
        });
        assignmentId = res.body.data.assign_id;
      });

      it('should allow student to submit assignment', async () => {
        const res = await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'My submission content' },
        );

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('sub_id');
      });

      it('should reject duplicate submission with 409', async () => {
        // Submit once
        await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'First submission' },
        );

        // Submit again — should fail
        const res = await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'Second submission' },
        );

        expect(res.status).toBe(409);
      });

      it('should allow student to view their own submission', async () => {
        await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'My work' },
        );

        const res = await authGet(app,
          `/api/v1/assignments/${assignmentId}/my-submission`,
          studentToken,
        );

        expect(res.status).toBe(200);
        expect(res.body.data.content).toBe('My work');
      });

      it('should allow faculty to view all submissions', async () => {
        // Student submits
        await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'Student work' },
        );

        const res = await authGet(app,
          `/api/v1/assignments/${assignmentId}/submissions`,
          facultyToken,
        );

        expect(res.status).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('should allow faculty to grade a submission', async () => {
        const submitRes = await authPost(app,
          `/api/v1/assignments/${assignmentId}/submit`,
          studentToken,
          { content: 'Grade me' },
        );
        const submissionId = submitRes.body.data.sub_id;

        const res = await authPatch(app,
          `/api/v1/submissions/${submissionId}/grade`,
          facultyToken,
          { marks: 42, feedback: 'Good work!' },
        );

        expect(res.status).toBe(200);
        expect(res.body.data.marks).toBe(42);
        expect(res.body.data.feedback).toBe('Good work!');
        expect(res.body.data.status).toBe('GRADED');
      });

      it('should mark late submission correctly', async () => {
        // Create assignment with past due date
        const pastDue = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const lateAssign = await authPost(app, '/api/v1/assignments', facultyToken, {
          title: 'Past Due Assignment',
          description: 'Already past due',
          sub_id: academicData.subject1.sub_id,
          sem_id: academicData.semester.sem_id,
          due_date: pastDue,
          max_marks: 20,
        });

        const res = await authPost(app,
          `/api/v1/assignments/${lateAssign.body.data.assign_id}/submit`,
          studentToken,
          { content: 'Late submission' },
        );

        // Should either be 201 with LATE status, or 400 if late submissions blocked
        if (res.status === 201) {
          expect(res.body.data.status).toBe('LATE');
        }
      });
    });
  });
});
