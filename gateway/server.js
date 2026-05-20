const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const CircuitBreaker = require('opossum');
const http = require('http');


// ============================================================
// CÁU HÌNH
// ============================================================
const CONFIG = {
  port: process.env.GATEWAY_PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'medconnect_jwt_secret_key_2024',
  backend: {
    target: process.env.BACKEND_URL || 'http://localhost:5000',
  },
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 phut
      max: 30,                   // 30 request / 15 phut cho auth routes
    },
    protected: {
      windowMs: 15 * 60 * 1000, // 15 phut
      max: 100,                  // 100 request / 15 phut cho protected routes
    },
  },
  circuitBreaker: {
    timeout: 10000,              // 10 giay timeout
    errorThresholdPercentage: 50,
    resetTimeout: 30000,         // 30 giay truoc khi thu lai
    volumeThreshold: 5,
  },
};

const app = express();

// ============================================================
// 1. CORS POLICY
// ============================================================
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}));

// ============================================================
// 2. STRUCTURED LOGGING (Morgan)
// ============================================================
morgan.token('body-size', (req) => {
  return req.headers['content-length'] || '0';
});

app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms - body::body-size', {
  skip: (req) => req.url === '/health',
}));

// ============================================================
// 3. RATE LIMITING - khac nhau cho auth vs protected
// ============================================================
const authRateLimiter = rateLimit({
  windowMs: CONFIG.rateLimit.auth.windowMs,
  max: CONFIG.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Qua nhieu yeu cau xac thuc, vui long thu lai sau 15 phut.',
  },
});

const protectedRateLimiter = rateLimit({
  windowMs: CONFIG.rateLimit.protected.windowMs,
  max: CONFIG.rateLimit.protected.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Qua nhieu yeu cau, vui long thu lai sau.',
  },
});

// ============================================================
// 4. JWT VALIDATION MIDDLEWARE
// ============================================================
const PUBLIC_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
];

function isPublicPath(path) {
  return PUBLIC_PATHS.some((p) => path.startsWith(p));
}

function jwtValidation(req, res, next) {
  // Skip JWT cho public routes
  if (isPublicPath(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Khong tim thay token xac thuc. Vui long dang nhap.',
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, CONFIG.jwtSecret);
    req.user = decoded;
    // Truyen thong tin user xuong backend qua headers
    req.headers['x-user-id'] = decoded.id || decoded.userId || '';
    req.headers['x-user-role'] = decoded.role || '';
    req.headers['x-user-email'] = decoded.email || '';
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token da het han. Vui long dang nhap lai.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token khong hop le.',
    });
  }
}

// ============================================================
// 5. CIRCUIT BREAKER PATTERN
// ============================================================
function makeBackendRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      resolve({ status: res.statusCode });
    });
    req.on('error', reject);
    req.setTimeout(CONFIG.circuitBreaker.timeout, () => {
      req.destroy();
      reject(new Error('Backend timeout'));
    });
  });
}

const breaker = new CircuitBreaker(makeBackendRequest, {
  timeout: CONFIG.circuitBreaker.timeout,
  errorThresholdPercentage: CONFIG.circuitBreaker.errorThresholdPercentage,
  resetTimeout: CONFIG.circuitBreaker.resetTimeout,
  volumeThreshold: CONFIG.circuitBreaker.volumeThreshold,
});

breaker.on('open', () => {
  console.log(`[CIRCUIT BREAKER] OPEN - Backend khong phan hoi, tam ngung chuyen tiep request`);
});
breaker.on('halfOpen', () => {
  console.log(`[CIRCUIT BREAKER] HALF-OPEN - Thu ket noi lai backend...`);
});
breaker.on('close', () => {
  console.log(`[CIRCUIT BREAKER] CLOSED - Backend da hoat dong binh thuong`);
});

function circuitBreakerMiddleware(req, res, next) {
  if (breaker.opened) {
    return res.status(503).json({
      success: false,
      message: 'He thong dang qua tai hoac bao tri. Vui long thu lai sau.',
    });
  }
  next();
}

// Kiem tra backend dinh ky de cap nhat trang thai circuit breaker
setInterval(() => {
  breaker.fire(`${CONFIG.backend.target}/health`).catch(() => {});
}, 15000);

// ============================================================
// 6. HEALTH CHECK ENDPOINT
// ============================================================
app.get('/health', async (req, res) => {
  let backendStatus = 'unknown';
  try {
    const result = await breaker.fire(`${CONFIG.backend.target}/health`);
    backendStatus = result.status === 200 ? 'healthy' : 'unhealthy';
  } catch {
    backendStatus = 'unreachable';
  }

  res.json({
    status: 'Gateway OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    circuitBreaker: breaker.opened ? 'open' : 'closed',
    backend: backendStatus,
  });
});

// ============================================================
// 7. ROUTE: /api/auth/* (public, khong can JWT, rate limit thap)
// ============================================================
app.use('/api/auth',
  authRateLimiter,
  circuitBreakerMiddleware,
  createProxyMiddleware({
    target: CONFIG.backend.target,
    changeOrigin: true,
    pathRewrite: { '^/api/auth': '/api/auth' },
    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.setHeader('x-forwarded-for', req.ip);
        proxyReq.setHeader('x-gateway-source', 'medconnect-gateway');
      },
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.url} - ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Khong the ket noi den backend. Vui long thu lai sau.',
          });
        }
      },
    },
  })
);

// ============================================================
// 8. ROUTE: /api/* (protected, can JWT, rate limit cao hon)
// ============================================================
app.use('/api',
  jwtValidation,
  protectedRateLimiter,
  circuitBreakerMiddleware,
  createProxyMiddleware({
    target: CONFIG.backend.target,
    changeOrigin: true,
    pathRewrite: { '^/api': '/api' },
    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.setHeader('x-forwarded-for', req.ip);
        proxyReq.setHeader('x-gateway-source', 'medconnect-gateway');
        if (req.user) {
          proxyReq.setHeader('x-user-id', req.user.id || req.user.userId || '');
          proxyReq.setHeader('x-user-role', req.user.role || '');
        }
      },
      error: (err, req, res) => {
        console.error(`[PROXY ERROR] ${req.method} ${req.url} - ${err.message}`);
        if (!res.headersSent) {
          res.status(502).json({
            success: false,
            message: 'Khong the ket noi den backend. Vui long thu lai sau.',
          });
        }
      },
    },
  })
);

// ============================================================
// 9. ERROR HANDLING
// ============================================================
// 404 cho cac route khong match
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} khong ton tai.`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: 'Loi he thong. Vui long thu lai sau.',
  });
});

// ============================================================
// KHOI DONG SERVER
// ============================================================
const server = app.listen(CONFIG.port, () => {
  console.log('='.repeat(55));
  console.log('  MedConnect API Gateway');
  console.log(`  Port:    ${CONFIG.port}`);
  console.log(`  Backend: ${CONFIG.backend.target}`);
  console.log('  Features:');
  console.log('    - CORS');
  console.log('    - JWT validation (skip /api/auth/login, /api/auth/register)');
  console.log('    - Route-based rate limiting');
  console.log('    - Circuit breaker pattern');
  console.log('    - Structured logging (morgan)');
  console.log('    - Health check: /health');
  console.log('='.repeat(55));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[GATEWAY] SIGTERM - dang dong server...');
  server.close(() => {
    console.log('[GATEWAY] Server da dong.');
    process.exit(0);
  });
});

module.exports = app;
