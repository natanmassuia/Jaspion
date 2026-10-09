import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../server.js';
import { FastifyInstance } from 'fastify';

describe('Health Check API', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health should return UP with database details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/health'
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('UP');
    expect(body.service).toBe('jaspion-backend');
    expect(body.database.status).toBe('CONNECTED');
    expect(body.database.sqliteVersion).toBeDefined();
  });
});
