/**
 * Phase 1 — P1-M5: Health Check & Server Bootstrap Integration Tests
 *
 * Tests: /health endpoint, 404 handling, CORS headers, security headers
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('P1-M5: Express App Bootstrap & Health Check', () => {
  // Lazy-load app to avoid import errors before P1-M5 is implemented
  async function getApp() {
    const { default: app } = await import('../../src/app');
    return app;
  }

  // ─── Health Check ───────────────────────────────────────────────────

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });

    it('should include a timestamp', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      expect(res.body).toHaveProperty('timestamp');
      // Timestamp should be a valid ISO date string
      expect(new Date(res.body.timestamp).getTime()).not.toBeNaN();
    });

    it('should include uptime in seconds', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── 404 Handling ───────────────────────────────────────────────────

  describe('Unknown Routes', () => {
    it('should return 404 for unknown routes', async () => {
      const app = await getApp();
      const res = await request(app).get('/api/v1/nonexistent-route');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should return JSON error for unknown POST routes', async () => {
      const app = await getApp();
      const res = await request(app)
        .post('/api/v1/nonexistent')
        .send({ data: 'test' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  // ─── Malformed Body ─────────────────────────────────────────────────

  describe('Malformed Request Body', () => {
    it('should return 400 for malformed JSON', async () => {
      const app = await getApp();
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(res.status).toBe(400);
    });
  });

  // ─── Security Headers (Helmet) ─────────────────────────────────────

  describe('Security Headers', () => {
    it('should include X-Content-Type-Options header', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      // Helmet sets this to SAMEORIGIN by default
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should not expose X-Powered-By header', async () => {
      const app = await getApp();
      const res = await request(app).get('/health');

      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // ─── CORS ───────────────────────────────────────────────────────────

  describe('CORS Headers', () => {
    it('should include Access-Control-Allow-Origin for allowed origin', async () => {
      const app = await getApp();
      const res = await request(app)
        .get('/health')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');

      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should allow credentials', async () => {
      const app = await getApp();
      const res = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', process.env.CORS_ORIGIN || 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});
