import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { env } from './config/env.js';
import { sqliteClient } from './database/connection.js';
import { clientesRoutes } from './modules/clientes/clientes.controller.js';
import { unidadesRoutes } from './modules/unidades/unidades.controller.js';
import { cemRoutes } from './modules/checklist-cem/cem.controller.js';

export async function createServer() {
  const app = Fastify({
    logger: env.NODE_ENV === 'development' ? {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss Z' }
      }
    } : true
  });

  // Security Plugins
  await app.register(helmet, {
    contentSecurityPolicy: false // Allows SPA frontend during development
  });

  await app.register(cors, {
    origin: [env.FRONTEND_URL, 'http://localhost:6172', 'http://127.0.0.1:6172'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  await app.register(cookie, {
    secret: env.COOKIE_SECRET
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // Centralized Error Handler
  app.setErrorHandler((error: any, request, reply) => {
    app.log.error(error);
    const statusCode = error.statusCode || 500;
    reply.status(statusCode).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_SERVER_ERROR',
        message: statusCode === 500 ? 'Ocorreu um erro interno no servidor' : error.message
      }
    });
  });

  // Health Check Endpoint
  app.get('/api/health', async (request, reply) => {
    try {
      const result = await sqliteClient.execute("SELECT datetime('now') as currentTime, sqlite_version() as sqliteVersion;");
      const row = result.rows[0];
      return {
        status: 'UP',
        service: 'jaspion-backend',
        version: '1.0.0',
        uptime: process.uptime(),
        database: {
          status: 'CONNECTED',
          engine: 'SQLite 3 (LibSQL Client)',
          sqliteVersion: row?.sqliteVersion,
          dbTime: row?.currentTime
        },
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      reply.status(503).send({
        status: 'DOWN',
        database: {
          status: 'DISCONNECTED',
          error: err.message
        }
      });
    }
  });

  // Register Application Modules
  await app.register(clientesRoutes);
  await app.register(unidadesRoutes);
  await app.register(cemRoutes);

  return app;
}

async function start() {
  const app = await createServer();
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚀 Jaspion Backend rodando na porta ${env.PORT} (${env.NODE_ENV})`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
