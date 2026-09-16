/**
 * events.js
 * Fetches events from Firestore and renders them into #events-list.
 * Must be loaded as type="module" on events.html.
 */

import { getEvents } from './firebase.js';

const eventsList = document.getElementById('events-list');
if (!eventsList) throw new Error('#events-list not found');

// Show loading skeleton
eventsList.innerHTML = `
  <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--muted);">
    <div style="width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 0.8rem;"></div>
    <p>Loading events…</p>
  </div>`;

(async () => {
  try {
    const events = await getEvents();

    if (events.length === 0) {
      eventsList.innerHTML = `
        <p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:3rem 0;">
          No upcoming events at the moment. Check back soon!
        </p>`;
      return;
    }

    eventsList.innerHTML = events
      .map(
        (ev) => `
        <article class="card feature-card">
          <h3>${escHtml(ev.title)}</h3>
          <p><strong>${escHtml(ev.date)}</strong></p>
          <p>${escHtml(ev.description)}</p>
        </article>`
      )
      .join('');

  } catch (err) {
    console.error('[events.js]', err);
    eventsList.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;color:#c0392b;padding:3rem 0;">
        Could not load events. Please check back later.
      </p>`;
  }
})();

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
