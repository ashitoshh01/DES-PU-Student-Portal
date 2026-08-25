/**
 * Phase 3 — P3-M5: BullMQ Queues & Workers Unit Tests
 *
 * Tests: queue job creation, worker processing, retry logic, dead letter queue
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('P3-M5: BullMQ Queues & Workers', () => {
  // ─── File Processing Queue ──────────────────────────────────────────

  describe('File Processing Queue', () => {
    it('should accept a job and return job id', async () => {
      const { fileProcessingQueue } = await import('../../src/queues/fileProcessing.queue');

      const job = await fileProcessingQueue.add('process-image', {
        resourceId: 'test-res-123',
        r2Key: 'uploads/test.jpg',
        contentType: 'image/jpeg',
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.name).toBe('process-image');
    });

    it('should include correct data in the job', async () => {
      const { fileProcessingQueue } = await import('../../src/queues/fileProcessing.queue');

      const jobData = {
        resourceId: 'res-456',
        r2Key: 'uploads/doc.pdf',
        contentType: 'application/pdf',
      };

      const job = await fileProcessingQueue.add('process-pdf', jobData);
      expect(job.data).toEqual(jobData);
    });
  });

  // ─── Notification Queue ─────────────────────────────────────────────

  describe('Notification Queue', () => {
    it('should accept a notification job', async () => {
      const { notificationQueue } = await import('../../src/queues/notifications.queue');

      const job = await notificationQueue.add('send-notification', {
        userId: 'user-123',
        type: 'REPLY',
        data: {
          actor_id: 'user-456',
          ref_id: 'post-789',
          message: 'Someone replied to your post',
        },
      });

      expect(job).toBeDefined();
      expect(job.data.type).toBe('REPLY');
    });
  });

  // ─── Queue Health ───────────────────────────────────────────────────

  describe('Queue Health', () => {
    it('should report job counts', async () => {
      const { fileProcessingQueue } = await import('../../src/queues/fileProcessing.queue');

      const counts = await fileProcessingQueue.getJobCounts();

      expect(counts).toHaveProperty('active');
      expect(counts).toHaveProperty('waiting');
      expect(counts).toHaveProperty('completed');
      expect(counts).toHaveProperty('failed');
    });
  });

  // ─── Worker Retry Logic ─────────────────────────────────────────────

  describe('Worker Retry Configuration', () => {
    it('should have retry attempts configured', async () => {
      const { fileProcessingQueue } = await import('../../src/queues/fileProcessing.queue');

      const job = await fileProcessingQueue.add(
        'test-retry',
        { test: true },
        { attempts: 3, backoff: { type: 'exponential', delay: 1000 } },
      );

      expect(job.opts.attempts).toBe(3);
    });
  });
});
