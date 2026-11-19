import Fastify, { FastifyInstance, FastifyError } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { defaultCache } from './cache/cacheService.js';
import { registerRoutingRoutes } from './routes/routingRoutes.js';
import { registerContextRoutes } from './routes/contextRoutes.js';
import { registerImageryRoutes } from './routes/imageryRoutes.js';
import { registerGeocodeRoutes } from './routes/geocodeRoutes.js';
import { registerActRoutes } from './routes/actRoutes.js';
import { registerProtectRoutes } from './routes/protectRoutes.js';
import { registerNavigatorRoutes } from './routes/navigatorRoutes.js';
import { registerExportRoutes } from './routes/exportRoutes.js';
import { getDashboardHtml } from './dashboard/dashboardHtml.js';

export interface ServerOptions {
  logger?: boolean;
  rateLimitMax?: number;
  enableRateLimit?: boolean;
}

export async function buildServer(options: ServerOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: options.logger ?? false,
    // Restrict proxy trust to loopback by default to prevent X-Forwarded-For IP spoofing
    trustProxy: process.env.TRUST_PROXY ? (process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY) : '127.0.0.1',
    // Hardened request body limit (1MB max payload to protect against memory exhaustion DoS)
    bodyLimit: 1048576,
  });

  // Global error handler: never leak internal stack traces or file paths to clients (OWASP API3:2023)
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        ok: false,
        error: error.message || 'Client error',
        code: error.code || 'BAD_REQUEST',
      });
    }

    // Server-side internal error masking
    if (options.logger) {
      request.log.error(error);
    }
    return reply.status(500).send({
      ok: false,
      error: 'An unexpected internal gateway error occurred. Please retry shortly.',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  // Security Headers (MIME-sniffing, clickjacking, HSTS protection)
  await app.register(helmet, {
    contentSecurityPolicy: false, // API gateway serves JSON, not HTML
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // Enable Cross-Origin Resource Sharing with safe allowlist controls
  const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
  const configuredOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim())
    : null;

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (native mobile apps, curl, background workers) with no origin header
      if (!origin) return cb(null, true);

      if (configuredOrigins && configuredOrigins.length > 0) {
        if (configuredOrigins.includes(origin)) return cb(null, true);
        return cb(new Error('CORS origin not allowed'), false);
      }

      // Default safe local origins
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return cb(null, true);
      }

      // Permissive dev mode
      if (process.env.NODE_ENV !== 'production') {
        return cb(null, true);
      }

      return cb(new Error('CORS origin not allowed by policy'), false);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
  });

  // Fair-use rate limiting shield (default 100 req / minute per IP)
  if (options.enableRateLimit !== false) {
    await app.register(rateLimit, {
      max: options.rateLimitMax ?? 100,
      timeWindow: '1 minute',
    });
  }

  // Web Application & Interactive Dashboard with Content Security Policy
  const serveDashboard = async (_request: any, reply: any) => {
    reply.header(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://unpkg.com; " +
      "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; " +
      "connect-src 'self'; " +
      "frame-ancestors 'none';"
    );
    return reply.type('text/html; charset=utf-8').send(getDashboardHtml());
  };
  app.get('/', serveDashboard);
  app.get('/dashboard', serveDashboard);

  // Health & Monitoring Endpoint with memory & runtime telemetry
  app.get('/health', async () => {
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      service: 'ResQ Geospatial Gateway',
      version: '1.0.0',
      uptime: Math.round(process.uptime()),
      cacheEntries: defaultCache.size(),
      memory: {
        heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
      },
      timestamp: new Date().toISOString(),
    };
  });

  // Register Core Subsystems
  await registerRoutingRoutes(app);
  await registerContextRoutes(app);
  await registerImageryRoutes(app);
  await registerGeocodeRoutes(app);
  await registerActRoutes(app);
  await registerProtectRoutes(app);
  await registerNavigatorRoutes(app);
  await registerExportRoutes(app);

  return app;
}
