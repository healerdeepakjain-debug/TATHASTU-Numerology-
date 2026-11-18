import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  setDoc,
  getDocFromServer,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

export { doc, setDoc };

// Suppress internal @firebase/firestore 10s WebChannel timeout console.error noise in iframe/proxy environments
try {
  setLogLevel('silent');
} catch {
  // Ignore if setLogLevel is unavailable
}

const app = initializeApp(firebaseConfig);

function initResilientFirestore() {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = initResilientFirestore();
export const auth = getAuth(app);
export const storage = getStorage(
  app,
  firebaseConfig.storageBucket ? `gs://${firebaseConfig.storageBucket}` : undefined
);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: boolean | string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  const isOfflineOrTransient =
    errMsg.toLowerCase().includes('offline') ||
    errMsg.toLowerCase().includes('unavailable') ||
    errMsg.toLowerCase().includes('could not reach cloud firestore');
  if (!isOfflineOrTransient) {
    console.warn('Firestore Error: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

export async function signInWithGooglePopup() {
  return signInWithPopup(auth, googleProvider);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = typeof reader.result === 'string' ? reader.result : '';
      const base64 = res.includes(',') ? res.split(',')[1] : res;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Uploads a generated PDF Blob to Firebase Storage (`/tathastu_reports/{profileId}/{fileName}`)
 * and/or the server-side signed PDF endpoint (`/api/reports/upload-signed`), returning a
 * publicly readable Signed Token URL (`?alt=media&token=...` or `?token=...`) that never
 * triggers 403 Forbidden errors on external Android or iOS mobile browsers.
 */
export async function uploadReportPdfAndGetSignedUrl(
  profileId: string,
  fileName: string,
  pdfBlob: Blob,
  originUrl?: string
): Promise<string | null> {
  const safeProfileId = (profileId || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFileName = (fileName || 'Tathastu_Report.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_');

  // 1. Fast server-side signed PDF endpoint (`/api/reports/upload-signed`) with 2.5s timeout
  try {
    const pdfBase64 = await blobToBase64(pdfBlob);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/reports/upload-signed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profileId: safeProfileId,
        fileName: safeFileName,
        pdfBase64,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = (await res.json()) as { signedPath?: string };
      if (data.signedPath) {
        const baseOrigin =
          originUrl ||
          (typeof window !== 'undefined' && window.location?.origin
            ? window.location.origin
            : '');
        return `${baseOrigin.replace(/\/+$/, '')}${data.signedPath}`;
      }
    }
  } catch {
    // Fallback if server endpoint is unreachable
  }

  // 2. Optional Firebase Storage upload with strict 2.5s race timeout
  if (auth.currentUser && firebaseConfig.storageBucket) {
    try {
      const uploadTask = (async () => {
        const reportRef = ref(storage, `tathastu_reports/${safeProfileId}/${safeFileName}`);
        await uploadBytes(reportRef, pdfBlob, {
          contentType: 'application/pdf',
          contentDisposition: `attachment; filename="${safeFileName}"`,
          cacheControl: 'public, max-age=31536000',
          customMetadata: {
            profileId: safeProfileId,
            publicRead: 'true',
          },
        });
        return await getDownloadURL(reportRef);
      })();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const firebaseSignedTokenUrl = await Promise.race([uploadTask, timeoutPromise]);
      if (firebaseSignedTokenUrl) {
        return firebaseSignedTokenUrl;
      }
    } catch {
      // Ignore storage error
    }
  }

  return null;
}

/**
 * Triggers a cross-platform PDF download on Android, iOS, and Desktop browsers
 * using an explicit `application/pdf` Blob object URL and signed-URL fallback.
 */
export function triggerCrossPlatformPdfBlobDownload(
  pdfBlob: Blob,
  fileName: string,
  signedUrl?: string | null
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const safeFileName = (fileName || 'Tathastu_Divine_Light_Report.pdf').endsWith('.pdf')
    ? fileName
    : `${fileName}.pdf`;

  try {
    const typedBlob =
      pdfBlob.type === 'application/pdf'
        ? pdfBlob
        : new Blob([pdfBlob], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(typedBlob);
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = safeFileName;
    anchor.rel = 'noopener noreferrer';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  } catch {
    if (signedUrl) {
      const anchor = document.createElement('a');
      anchor.href = signedUrl;
      anchor.download = safeFileName;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    }
  }
}

// Validate connection to Firestore on boot without emitting false-positive console.error on offline/iframe networks
async function testConnection() {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info('Firestore client is operating in offline/hybrid cache mode.');
    }
  }
}
void testConnection();

