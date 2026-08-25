/**
 * Database Test Helpers
 *
 * Provides utilities to clean up the database between tests,
 * seed test-specific data, and ensure test isolation.
 */

// Will work once P1-M2 is implemented
// import { prisma } from '../../src/lib/prisma';

/**
 * Clean all user-generated data from the database.
 * Preserves seeded academic structure (schools, departments, subjects).
 * Use in beforeEach() for test isolation.
 *
 * Deletion order respects foreign key constraints (children first).
 */
export async function cleanDatabase() {
  const { prisma } = await import('../../src/lib/prisma');

  await prisma.$transaction([
    // Phase 6 — Reports & Audit
    // prisma.auditLog.deleteMany(),
    // prisma.report.deleteMany(),

    // Phase 5 — Gamification & Projects
    prisma.projectApplication.deleteMany(),
    prisma.projectMember.deleteMany(),
    prisma.project.deleteMany(),
    prisma.badge.deleteMany(),
    prisma.xpEvent.deleteMany(),
    prisma.marksheetResult.deleteMany(),
    prisma.marksheet.deleteMany(),

    // Phase 4 — Chat & Notifications
    prisma.notification.deleteMany(),
    prisma.messageReadReceipt.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationMember.deleteMany(),
    prisma.conversation.deleteMany(),

    // Phase 3 — Classroom
    prisma.postBookmark.deleteMany(),
    prisma.postUpvote.deleteMany(),
    prisma.post.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.submission.deleteMany(),
    prisma.assignment.deleteMany(),
    prisma.announcement.deleteMany(),

    // Phase 2 — Identity
    prisma.facultySubject.deleteMany(),
    prisma.studentSubject.deleteMany(),
    prisma.student.deleteMany(),
    prisma.faculty.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.superAdmin.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

/**
 * Clean all data INCLUDING academic structure.
 * Use only when you need to re-seed everything from scratch.
 */
export async function cleanDatabaseFull() {
  await cleanDatabase();

  const { prisma } = await import('../../src/lib/prisma');

  await prisma.$transaction([
    prisma.subject.deleteMany(),
    prisma.division.deleteMany(),
    prisma.semester.deleteMany(),
    prisma.department.deleteMany(),
    prisma.school.deleteMany(),
  ]);
}

/**
 * Seed minimal academic structure needed for most tests.
 * Creates 1 school, 1 department, 1 semester, 1 division, 2 subjects.
 */
export async function seedTestAcademicData() {
  const { prisma } = await import('../../src/lib/prisma');

  const school = await prisma.school.create({
    data: {
      school_name: 'Test School of Technology',
    },
  });

  const department = await prisma.department.create({
    data: {
      dept_name: 'Computer Science',
      school_id: school.school_id,
    },
  });

  const semester = await prisma.semester.create({
    data: {
      sem_number: 5,
      academic_year: '2026-2027',
      is_current: true,
    },
  });

  const division = await prisma.division.create({
    data: {
      div_name: 'A',
      dept_id: department.dept_id,
      sem_id: semester.sem_id,
    },
  });

  const subject1 = await prisma.subject.create({
    data: {
      sub_code: 'CS501',
      sub_name: 'Data Structures & Algorithms',
      sub_credits: 4,
      sub_total_marks: 100,
      dept_id: department.dept_id,
    },
  });

  const subject2 = await prisma.subject.create({
    data: {
      sub_code: 'CS502',
      sub_name: 'Database Management Systems',
      sub_credits: 4,
      sub_total_marks: 100,
      dept_id: department.dept_id,
    },
  });

  return { school, department, semester, division, subject1, subject2 };
}

/**
 * Create a test user directly in the database (bypasses auth service).
 * Useful when you need a user but don't want to test registration.
 */
export async function createTestUser(overrides: Record<string, any> = {}) {
  const { prisma } = await import('../../src/lib/prisma');
  const argon2 = await import('argon2');

  const defaults = {
    name: 'Test User',
    email: `test-${Date.now()}@despu.edu.in`,
    password: await argon2.hash('TestPassword123!'),
    role: 'STUDENT' as const,
  };

  return prisma.user.create({
    data: { ...defaults, ...overrides },
  });
}

/**
 * Create a test student user with full profile (User + Student record).
 */
export async function createTestStudent(
  academicData: { dept_id: string; div_id: string; school_id: string },
  overrides: Record<string, any> = {},
) {
  const { prisma } = await import('../../src/lib/prisma');
  const argon2 = await import('argon2');

  const user = await prisma.user.create({
    data: {
      name: overrides.name || 'Test Student',
      email: overrides.email || `student-${Date.now()}@despu.edu.in`,
      password: await argon2.hash(overrides.password || 'TestPassword123!'),
      role: 'STUDENT',
    },
  });

  const student = await prisma.student.create({
    data: {
      user_id: user.user_id,
      dept_id: academicData.dept_id,
      div_id: academicData.div_id,
      school_id: academicData.school_id,
      stu_prn: overrides.stu_prn || `PRN-${Date.now()}`,
    },
  });

  return { user, student };
}

/**
 * Create a test faculty user with full profile (User + Faculty record).
 */
export async function createTestFaculty(
  academicData: { dept_id: string; school_id: string },
  overrides: Record<string, any> = {},
) {
  const { prisma } = await import('../../src/lib/prisma');
  const argon2 = await import('argon2');

  const user = await prisma.user.create({
    data: {
      name: overrides.name || 'Test Faculty',
      email: overrides.email || `faculty-${Date.now()}@despu.edu.in`,
      password: await argon2.hash(overrides.password || 'TestPassword123!'),
      role: 'FACULTY',
    },
  });

  const faculty = await prisma.faculty.create({
    data: {
      user_id: user.user_id,
      dept_id: academicData.dept_id,
      school_id: academicData.school_id,
      fac_prn: overrides.fac_prn || `FAC-${Date.now()}`,
    },
  });

  return { user, faculty };
}
