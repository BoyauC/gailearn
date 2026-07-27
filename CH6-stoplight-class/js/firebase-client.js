import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app-check.js';
import { firebaseConfig, stoplightFirebaseOptions } from './firebase-config.js';

const missingConfig = Object.values(firebaseConfig).some((value) =>
  typeof value !== 'string' || value.startsWith('REPLACE_WITH_')
);

let services;
let authPromise;
let persistencePromise;

const isStudentClient = /\/student\.html$/i.test(globalThis.location && globalThis.location.pathname || '');

function initializeServices() {
  if (missingConfig) {
    throw new Error('FIREBASE_NOT_CONFIGURED');
  }
  if (services) return services;

  // Use a separate Firebase app so teacher and student tabs do not share an anonymous identity.
  const app = isStudentClient
    ? initializeApp(firebaseConfig, 'stoplight-student')
    : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const functions = getFunctions(app, stoplightFirebaseOptions.functionsRegion);

  if (stoplightFirebaseOptions.useEmulators) {
    connectAuthEmulator(auth, `http://${stoplightFirebaseOptions.emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, stoplightFirebaseOptions.emulatorHost, 8080);
    connectFunctionsEmulator(functions, stoplightFirebaseOptions.emulatorHost, 5001);
  } else if (
    stoplightFirebaseOptions.recaptchaEnterpriseSiteKey &&
    !stoplightFirebaseOptions.recaptchaEnterpriseSiteKey.startsWith('REPLACE_WITH_')
  ) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(stoplightFirebaseOptions.recaptchaEnterpriseSiteKey),
      isTokenAutoRefreshEnabled: true
    });
  }

  services = { app, auth, db, functions };
  return services;
}

export async function ensureAnonymousAuth() {
  if (authPromise) return authPromise;
  authPromise = (async () => {
    const { auth } = initializeServices();
    if (isStudentClient) {
      persistencePromise ||= setPersistence(auth, browserSessionPersistence);
      await persistencePromise;
    }
    if (auth.currentUser) return auth.currentUser;

    await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
    });
    if (auth.currentUser) return auth.currentUser;
    return (await signInAnonymously(auth)).user;
  })();
  try {
    return await authPromise;
  } catch (error) {
    authPromise = undefined;
    throw error;
  }
}

export async function callFunction(name, data = {}) {
  await ensureAnonymousAuth();
  const callable = httpsCallable(initializeServices().functions, name, { timeout: 30000 });
  const response = await callable(data);
  return response.data;
}

export async function getFirebaseServices() {
  await ensureAnonymousAuth();
  return initializeServices();
}

export function isFirebaseConfigured() {
  return !missingConfig;
}

export { collection, doc, getDoc, onSnapshot, orderBy, query, where };
