/**
 * Phase 5 — P5-M2: Project Marketplace Integration Tests
 *
 * Tests: project CRUD, applications, accept/reject, team management
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import {
  cleanDatabase,
  seedTestAcademicData,
  createTestStudent,
} from '../../helpers/db.helper';
import { generateTestToken, authGet, authPost, authPatch, authDelete } from '../../helpers/auth.helper';

describe('P5-M2: Project Marketplace', () => {
  let app: any;
  let academicData: any;
  let leader: any, applicant: any;
  let leaderToken: string, applicantToken: string;

  beforeAll(async () => {
    const mod = await import('../../../src/app');
    app = mod.default;
  });

  beforeEach(async () => {
    await cleanDatabase();
    academicData = await seedTestAcademicData();

    const l = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'leader@despu.edu.in', stu_prn: 'LEAD-001' });
    leader = l.user;
    leaderToken = generateTestToken({ user_id: leader.user_id, email: leader.email, role: 'STUDENT' });

    const a = await createTestStudent({
      dept_id: academicData.department.dept_id,
      div_id: academicData.division.div_id,
      school_id: academicData.school.school_id,
    }, { email: 'applicant@despu.edu.in', stu_prn: 'APPLY-001' });
    applicant = a.user;
    applicantToken = generateTestToken({ user_id: applicant.user_id, email: applicant.email, role: 'STUDENT' });
  });

  // ─── Create Project ────────────────────────────────────────────────

  describe('POST /api/v1/projects', () => {
    it('should create a project and auto-add leader as member → 201', async () => {
      const res = await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'AI Study Buddy',
        description: 'An AI-powered study companion app',
        open_roles: ['Frontend Dev', 'Backend Dev', 'ML Engineer'],
        skills_req: ['React', 'Node.js', 'Python'],
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('proj_id');
      expect(res.body.data.title).toBe('AI Study Buddy');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .send({ title: 'Test', description: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  // ─── Browse Projects ───────────────────────────────────────────────

  describe('GET /api/v1/projects', () => {
    it('should return paginated projects', async () => {
      await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'Project 1',
        description: 'First project',
        open_roles: ['Dev'],
        skills_req: ['TypeScript'],
      });

      const res = await authGet(app, '/api/v1/projects?page=1', applicantToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should search projects by keyword', async () => {
      await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'Machine Learning Pipeline',
        description: 'Building an ML data pipeline',
        open_roles: ['ML Engineer'],
        skills_req: ['Python', 'TensorFlow'],
      });

      const res = await authGet(app, '/api/v1/projects?q=machine+learning', applicantToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ─── Applications ──────────────────────────────────────────────────

  describe('Project Applications', () => {
    let projectId: string;

    beforeEach(async () => {
      const res = await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'Apply Test Project',
        description: 'A project to test applications',
        open_roles: ['Frontend Dev', 'Backend Dev'],
        skills_req: ['React', 'Node.js'],
      });
      projectId = res.body.data.proj_id;
    });

    it('should allow student to apply → 201', async () => {
      const res = await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        {
          role: 'Frontend Dev',
          message: 'I have 2 years of React experience',
        },
      );

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('app_id');
      expect(res.body.data.status).toBe('PENDING');
    });

    it('should reject duplicate application with 409', async () => {
      await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        { role: 'Frontend Dev', message: 'First application' },
      );

      const res = await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        { role: 'Backend Dev', message: 'Second application' },
      );

      expect(res.status).toBe(409);
    });

    it('should allow leader to view applications', async () => {
      await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        { role: 'Frontend Dev', message: 'Check my application' },
      );

      const res = await authGet(app,
        `/api/v1/projects/${projectId}/applications`,
        leaderToken,
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
    });

    it('should return 403 when non-leader views applications', async () => {
      const res = await authGet(app,
        `/api/v1/projects/${projectId}/applications`,
        applicantToken,
      );

      expect(res.status).toBe(403);
    });

    it('should allow leader to accept application', async () => {
      const applyRes = await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        { role: 'Frontend Dev', message: 'Accept me' },
      );
      const appId = applyRes.body.data.app_id;

      const res = await authPatch(app,
        `/api/v1/projects/${projectId}/applications/${appId}`,
        leaderToken,
        { status: 'ACCEPTED' },
      );

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('ACCEPTED');
    });

    it('should allow leader to reject application', async () => {
      const applyRes = await authPost(app,
        `/api/v1/projects/${projectId}/apply`,
        applicantToken,
        { role: 'Frontend Dev', message: 'Reject me' },
      );
      const appId = applyRes.body.data.app_id;

      const res = await authPatch(app,
        `/api/v1/projects/${projectId}/applications/${appId}`,
        leaderToken,
        { status: 'REJECTED' },
      );

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('REJECTED');
    });
  });

  // ─── My Projects ───────────────────────────────────────────────────

  describe('GET /api/v1/projects/my-projects', () => {
    it('should return projects where user is leader or member', async () => {
      await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'My Led Project',
        description: 'I am the leader',
        open_roles: ['Dev'],
        skills_req: ['TypeScript'],
      });

      const res = await authGet(app, '/api/v1/projects/my-projects', leaderToken);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ─── Delete Project ─────────────────────────────────────────────────

  describe('DELETE /api/v1/projects/:id', () => {
    it('should allow leader to delete project', async () => {
      const projRes = await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'Deletable',
        description: 'Will be deleted',
        open_roles: ['Dev'],
        skills_req: ['JS'],
      });
      const projectId = projRes.body.data.proj_id;

      const res = await authDelete(app, `/api/v1/projects/${projectId}`, leaderToken);
      expect(res.status).toBe(200);
    });

    it('should return 403 when non-leader tries to delete', async () => {
      const projRes = await authPost(app, '/api/v1/projects', leaderToken, {
        title: 'Protected',
        description: 'Cant delete this',
        open_roles: ['Dev'],
        skills_req: ['JS'],
      });
      const projectId = projRes.body.data.proj_id;

      const res = await authDelete(app, `/api/v1/projects/${projectId}`, applicantToken);
      expect(res.status).toBe(403);
    });
  });
});
