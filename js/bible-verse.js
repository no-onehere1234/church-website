/**
 * Daily Bible Verse
 *
 * Picks one verse per day (same verse for all visitors on the same date)
 * using the date as a deterministic seed into a curated list of references.
 * Fetches the verse text from the free bible-api.com — no API key required.
 *
 * Falls back to a built-in verse if the network request fails.
 */

(function () {
  const VERSES = [
    'john 3:16',
    'psalm 23:1',
    'jeremiah 29:11',
    'philippians 4:13',
    'romans 8:28',
    'isaiah 40:31',
    'proverbs 3:5-6',
    'matthew 11:28',
    'psalm 46:1',
    'john 14:6',
    'romans 5:8',
    'ephesians 2:8-9',
    'galatians 5:22-23',
    'psalm 119:105',
    '1 corinthians 13:4-7',
    'hebrews 11:1',
    'james 1:2-3',
    '2 timothy 1:7',
    'matthew 5:14',
    'john 15:5',
    'romans 12:2',
    'psalm 34:8',
    'isaiah 41:10',
    'matthew 28:19-20',
    'colossians 3:23',
    'psalm 27:1',
    '1 peter 5:7',
    'philippians 4:6-7',
    'deuteronomy 31:6',
    'joshua 1:9',
    'lamentations 3:22-23',
  ];

  const FALLBACK = {
    text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    reference: 'Jeremiah 29:11 (NIV)',
  };

  /**
   * Returns today's verse reference using the calendar date as a stable seed.
   * Every visitor on the same day gets the same verse.
   */
  function getTodaysReference() {
    const now = new Date();
    // Build a numeric seed: YYYYMMDD
    const seed =
      now.getFullYear() * 10000 +
      (now.getMonth() + 1) * 100 +
      now.getDate();
    return VERSES[seed % VERSES.length];
  }

  /** Encode a verse reference for use in the bible-api.com URL. */
  function encodeRef(ref) {
    return encodeURIComponent(ref);
  }

  /** Render the verse into the DOM. */
  function showVerse(text, reference) {
    const loading = document.getElementById('verse-loading');
    const verseText = document.getElementById('verse-text');
    const verseRef = document.getElementById('verse-ref');

    if (!verseText || !verseRef) return;

    if (loading) loading.hidden = true;

    // Clean up extra whitespace / newlines that the API sometimes returns
    const cleanText = text.replace(/\s+/g, ' ').trim();

    verseText.textContent = '\u201C' + cleanText + '\u201D';
    verseRef.textContent = '\u2014 ' + reference;

    verseText.hidden = false;
    verseRef.hidden = false;
  }

  /** Show the fallback verse when the network fails. */
  function showFallback() {
    showVerse(FALLBACK.text, FALLBACK.reference);
  }

  /** Fetch today's verse from bible-api.com and render it. */
  async function loadDailyVerse() {
    const container = document.getElementById('verse-container');
    if (!container) return; // Not on a page that has the verse widget

    const ref = getTodaysReference();

    try {
      const response = await fetch(
        'https://bible-api.com/' + encodeRef(ref) + '?translation=kjv',
        { signal: AbortSignal.timeout(8000) }
      );

      if (!response.ok) {
        throw new Error('API responded with ' + response.status);
      }

      const data = await response.json();

      if (!data || !data.text) {
        throw new Error('Unexpected API response shape');
      }

      showVerse(data.text, data.reference);
    } catch (err) {
      // Network error or timeout — show a reliable built-in verse
      console.warn('[bible-verse] Falling back to built-in verse:', err.message);
      showFallback();
    }
  }

  // Kick off when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDailyVerse);
  } else {
    loadDailyVerse();
  }
})();
