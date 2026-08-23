import app from '../server/app';

export default async function handler(req: any, res: any) {
  try {
    // Vercel serverless rewrite compatibility:
    // If Vercel rewrites /api/diagnostics to destination /api, restore the true requested path
    if (req.url === '/api' || req.url === '/' || req.url === '' || req.url?.startsWith('/api?')) {
      const realPath =
        req.headers['x-matched-path'] ||
        req.headers['x-invoke-path'] ||
        req.headers['x-forwarded-url'] ||
        req.headers['x-vercel-matched-path'] ||
        req.originalUrl;

      if (realPath && typeof realPath === 'string' && realPath !== '/api' && realPath !== '/') {
        req.url = realPath;
      }
    }

    return app(req, res);
  } catch (error: any) {
    console.error('Serverless function invocation exception:', error?.name || 'Error', error?.message || error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'FUNCTION_INVOCATION_ERROR',
        message: error?.message || 'An unexpected error occurred in the serverless handler'
      });
    }
  }
}

