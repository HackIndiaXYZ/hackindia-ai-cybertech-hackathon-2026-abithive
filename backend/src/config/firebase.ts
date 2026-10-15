import admin from 'firebase-admin';
import { env } from './env';
import { logger } from '../utils/logger';

export let firebaseInitialized = false;

if (!admin.apps.length) {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId:   env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      firebaseInitialized = true;
      logger.info('✓ Firebase Admin SDK initialized');
    } catch (err: any) {
      logger.warn('⚠ Firebase Admin SDK init failed — Google login disabled:', err?.message);
    }
  } else {
    // Initialize with minimal config so admin.apps.length > 0, but mark as not ready
    try {
      admin.initializeApp({ projectId: env.FIREBASE_PROJECT_ID || 'certichain-dev' });
    } catch {
      // May already be initialized — ignore
    }
    logger.warn('⚠ Firebase credentials not set — Google OAuth will return 503');
  }
}

export default admin;
