/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3Pftl4jmWI1qUvQKGETN8XGBs-HEJUPE",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "website-spmb-f4f70.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "website-spmb-f4f70",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "website-spmb-f4f70.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "906089429621",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:906089429621:web:8b89397ad6ade0c84f963c",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-sditinsancendiki-27ab258d-4cf9-4dde-a9f5-662f868ac7f2"
};

// Inisialisasi Singleton: Mencegah duplikasi Firebase App ("Firebase App named '[DEFAULT]' already exists")
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Layanan Firebase utama terikat ke project website-spmb-f4f70 dan database yang diprovisi
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Enumerasi dan format penanganan error Firestore standar
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('[Firebase Error]', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseConnectionTestResult {
  success: boolean;
  projectId: string;
  authDomain: string;
  storageBucket: string;
  firestoreStatus: 'connected' | 'offline' | 'error';
  authStatus: 'ready' | 'error';
  storageStatus: 'ready' | 'error';
  details: string;
  timestamp: string;
}

/**
 * Memeriksa konektivitas dan kesiapan Firebase Project website-spmb-f4f70
 */
export async function testFirebaseConnection(): Promise<FirebaseConnectionTestResult> {
  const result: FirebaseConnectionTestResult = {
    success: true,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket,
    firestoreStatus: 'connected',
    authStatus: 'ready',
    storageStatus: 'ready',
    details: 'Terhubung ke Firebase Project website-spmb-f4f70.',
    timestamp: new Date().toISOString()
  };

  // 1. Cek Kesiapan Auth
  try {
    if (!auth || auth.app.name !== app.name) {
      result.authStatus = 'error';
      result.success = false;
    }
  } catch (err) {
    result.authStatus = 'error';
    result.success = false;
  }

  // 2. Cek Kesiapan Cloud Storage
  try {
    if (!storage || !storage.app) {
      result.storageStatus = 'error';
      result.success = false;
    }
  } catch (err) {
    result.storageStatus = 'error';
    result.success = false;
  }

  // 3. Cek Jangkauan Cloud Firestore
  try {
    // getDocFromServer memastikan request menjangkau server Firestore cloud, bukan hanya cache offline
    await getDocFromServer(doc(db, 'system_health', 'connection_test'));
    result.firestoreStatus = 'connected';
    result.details = 'Koneksi ke project ' + firebaseConfig.projectId + ' aktif dan merespons dengan normal.';
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    if (errMsg.includes('the client is offline') || errMsg.includes('unavailable') || errMsg.includes('failed to fetch')) {
      result.firestoreStatus = 'offline';
      result.success = false;
      result.details = 'Koneksi internet atau status Firestore offline: ' + errMsg;
    } else {
      // Jika respons permission-denied atau not-found dari server, ini membuktikan server Firestore project berhasil dihubungi
      result.firestoreStatus = 'connected';
      result.details = 'Server Firestore ' + firebaseConfig.projectId + ' aktif merespons (Rules Firestore beroperasi).';
    }
  }

  return result;
}
