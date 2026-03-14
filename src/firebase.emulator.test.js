import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const shouldRun = process.env.REACT_APP_USE_EMULATOR === 'true';

const testOrSkip = shouldRun ? test : test.skip;

testOrSkip('firebase emulator auth + firestore integration', async () => {
  const config = {
    apiKey: 'demo',
    authDomain: 'demo.firebaseapp.com',
    projectId: 'demo-project'
  };

  const app = initializeApp(config, `emulator-${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);

  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);

  const email = `test-${Date.now()}@example.com`;
  const password = 'password123';

  await createUserWithEmailAndPassword(auth, email, password);
  await signOut(auth);
  await signInWithEmailAndPassword(auth, email, password);

  const docRef = await addDoc(collection(db, 'members'), {
    orgId: 'demo-org',
    name: 'Emulator User',
    email
  });

  const snap = await getDocs(query(
    collection(db, 'members'),
    where('orgId', '==', 'demo-org')
  ));

  const ids = snap.docs.map(doc => doc.id);
  expect(ids).toContain(docRef.id);
});
