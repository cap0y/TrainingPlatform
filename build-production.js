import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building production server without Vite dependencies...');

try {
  await build({
    entryPoints: [join(__dirname, 'server/simple-server.ts')],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/production-server.js',
    external: [
      // Keep database packages external
      '@neondatabase/serverless',
      'drizzle-orm',
      'pg',
      // Keep other runtime dependencies external
      'bcrypt',
      'express-session',
      'passport',
      'passport-local',
      'passport-google-oauth20',
      'passport-kakao',
      'multer',
      'ws'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minify: false, // Keep readable for debugging
    sourcemap: false
  });

  console.log('✓ Production server built successfully');
  console.log('✓ No Vite dependencies included');
  console.log('✓ Ready for deployment');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}