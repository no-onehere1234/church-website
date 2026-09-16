/**
 * firebase.js
 * Shared Firebase initialisation and Firestore event helpers.
 * Loaded as a module via <script type="module">.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDTO6z5GyyM99prRIxdxsMPms6T0fuQc_c',
  authDomain: 'church-774a0.firebaseapp.com',
  databaseURL: 'https://church-774a0-default-rtdb.firebaseio.com',
  projectId: 'church-774a0',
  storageBucket: 'church-774a0.firebasestorage.app',
  messagingSenderId: '738181907559',
  appId: '1:738181907559:web:621a217e047533196d00c2',
  measurementId: 'G-ZB1NMK39GV',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const EVENTS_COL = 'events';

/** Default events seeded when the collection is empty. */
const DEFAULT_EVENTS = [
  {
    title: 'Sunday Worship',
    date: 'Every Sunday • 09:00 AM',
    description:
      'Join us for uplifting worship, prayer, and a message that encourages the heart.',
    order: 0,
  },
  {
    title: 'Prayer Night',
    date: 'Thursday • 6:00 PM',
    description:
      'A time of prayer, reflection, and spiritual encouragement for the whole church.',
    order: 1,
  },
  {
    title: 'Worship Team Rehearsal',
    date: 'Saturday • 3:00 PM',
    description:
      'A time for musicians and vocalists to practice, prepare, and grow together as they lead worship with excellence and unity.',
    order: 2,
  },
];

/**
 * Fetch all events ordered by the `order` field.
 * Seeds defaults if the collection is empty.
 * @returns {Promise<Array<{id: string, title: string, date: string, description: string}>>}
 */
export async function getEvents() {
  const colRef = collection(db, EVENTS_COL);
  const q = query(colRef, orderBy('order', 'asc'));
  let snapshot = await getDocs(q);

  // Seed defaults on first run
  if (snapshot.empty) {
    for (const ev of DEFAULT_EVENTS) {
      await addDoc(colRef, { ...ev, createdAt: serverTimestamp() });
    }
    snapshot = await getDocs(q);
  }

  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Add a new event document.
 * @param {{title: string, date: string, description: string}} data
 */
export async function addEvent(data) {
  const colRef = collection(db, EVENTS_COL);
  const snapshot = await getDocs(colRef);
  const maxOrder = snapshot.docs.reduce(
    (max, d) => Math.max(max, d.data().order ?? 0),
    -1
  );
  return addDoc(colRef, {
    ...data,
    order: maxOrder + 1,
    createdAt: serverTimestamp(),
  });
}

/**
 * Update an existing event document.
 * @param {string} id  Firestore document ID
 * @param {{title: string, date: string, description: string}} data
 */
export async function updateEvent(id, data) {
  return updateDoc(doc(db, EVENTS_COL, id), data);
}

/**
 * Delete an event document.
 * @param {string} id  Firestore document ID
 */
export async function deleteEvent(id) {
  return deleteDoc(doc(db, EVENTS_COL, id));
}
