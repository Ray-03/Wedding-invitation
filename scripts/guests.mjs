/**
 * Single guest tooling script.
 *
 * Import new guests from CSV (append-only) + Excel with invite URL + Chat WA:
 *   npm run guests -- import data/guests.csv
 *
 * Export ALL guests from Firestore (links + Chat WA + RSVP):
 *   npm run guests -- export
 *   Sort: Attending/Declined by wishSubmittedAt → Not yet by inviteType → name
 *
 * CSV columns: name,title,inviteType
 *   inviteType: physical | livestream | both | special
 *
 * RSVP deadline: NEXT_PUBLIC_RSVP_CLOSE_DATE (shared for Chat WA + site).
 */
import fs from 'fs';
import path from 'path';
import { GUESTS_COLLECTION, ROOT, loadProjectEnv } from './lib/env.mjs';
import { getSiteUrl, initAdminFirestore, writeGuestExcel } from './lib/firebase-admin.mjs';
import { buildInviteUrl } from './lib/invite-token.mjs';
import {
  buildInviteMessage,
  formatGuestDisplayName,
  getConfiguredRsvpCloseDate,
  getInviteMessageConfig,
} from './lib/invite-message.mjs';

loadProjectEnv();

function requireInviteSecret() {
  if (!String(process.env.INVITE_HMAC_SECRET || '').trim()) {
    console.error('INVITE_HMAC_SECRET is not set.');
    console.error('Add a long random value to .env, e.g. openssl rand -hex 32');
    process.exit(1);
  }
}

function printUsage() {
  console.log(`Usage:
  npm run guests -- import [csvPath]   Import new guests (default: data/guests.csv)
  npm run guests -- export             Export all guests + Chat WA
  npm run guests -- backfill-titles    Copy guest title into guest_responses for guestbook display
`);
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    const next = content[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell.trim());
      cell = '';
    } else if (ch === '\n') {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = '';
    } else if (ch === '\r') {
      // ignore
    } else {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.length > 0));
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

async function loadExistingGuests(db) {
  const snap = await db.collection(GUESTS_COLLECTION).get();
  /** @type {Map<string, { id: string }>} */
  const byName = new Map();
  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const key = normalizeName(data?.name);
    if (key) byName.set(key, { id: docSnap.id });
  });
  return byName;
}

async function importGuests(csvArg) {
  requireInviteSecret();
  const csvPath = path.isAbsolute(csvArg) ? csvArg : path.join(ROOT, csvArg);
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`);
    process.exit(1);
  }

  const { admin, db, databaseId } = initAdminFirestore();
  const siteUrl = getSiteUrl();
  const messageConfig = getInviteMessageConfig();
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const [header, ...dataRows] = rows;
  const col = Object.fromEntries(header.map((h, i) => [h.trim().toLowerCase(), i]));

  if (col.name == null) {
    console.error('CSV must include a "name" column');
    process.exit(1);
  }

  const existingByName = await loadExistingGuests(db);
  const aoa = [
    ['No', 'Name', 'Title', 'Invite Type', 'Guest ID', 'Invite URL', 'Chat WA'],
  ];

  console.log(`Importing into "${databaseId}"...`);
  console.log(`Existing guests: ${existingByName.size}`);
  console.log(`CSV rows: ${dataRows.length}\n`);

  let created = 0;
  let updated = 0;
  let skippedCsvDupes = 0;
  let no = 0;
  const seenInCsv = new Set();

  for (const cells of dataRows) {
    const name = cells[col.name]?.trim();
    if (!name) continue;

    const key = normalizeName(name);
    if (seenInCsv.has(key)) {
      skippedCsvDupes += 1;
      process.stdout.write(`⚠ skip duplicate in CSV: ${name}\n`);
      continue;
    }
    seenInCsv.add(key);

    const title = col.title != null ? cells[col.title]?.trim() || '' : '';
    const inviteRaw =
      (col.invitetype != null ? cells[col.invitetype] : 'livestream') || 'livestream';
    const inviteNorm = String(inviteRaw).trim().toLowerCase();
    const inviteType =
      inviteNorm === 'physical'
        ? 'physical'
        : inviteNorm === 'both'
          ? 'both'
          : inviteNorm === 'special'
            ? 'special'
            : 'livestream';

    const existing = existingByName.get(key);
    if (existing) {
      const rsvpCloseDate = getConfiguredRsvpCloseDate();
      await db.collection(GUESTS_COLLECTION).doc(existing.id).update({
        title: title || null,
        inviteType,
        showStory: inviteType !== 'physical',
        rsvpCloseDate,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      updated += 1;

      const inviteUrl = buildInviteUrl(siteUrl, existing.id);
      const { message } = buildInviteMessage({
        guestName: formatGuestDisplayName(name, title),
        inviteType,
        inviteUrl,
        config: messageConfig,
      });

      no += 1;
      aoa.push([no, name, title, inviteType, existing.id, inviteUrl, message]);
      process.stdout.write(`↻ ${no}. ${name}\n`);
      continue;
    }

    const rsvpCloseDate = getConfiguredRsvpCloseDate();
    const ref = await db.collection(GUESTS_COLLECTION).add({
      name,
      title: title || null,
      inviteType,
      showStory: inviteType !== 'physical',
      rsvpCloseDate,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    existingByName.set(key, { id: ref.id });
    const inviteUrl = buildInviteUrl(siteUrl, ref.id);
    const { message } = buildInviteMessage({
      guestName: formatGuestDisplayName(name, title),
      inviteType,
      inviteUrl,
      config: messageConfig,
    });

    no += 1;
    created += 1;
    aoa.push([no, name, title, inviteType, ref.id, inviteUrl, message]);
    process.stdout.write(`✓ ${no}. ${name}\n`);
  }

  if (created === 0 && updated === 0) {
    console.log('\nNo guests created or updated.');
    console.log(`Skipped — duplicate in CSV: ${skippedCsvDupes}`);
    return;
  }

  const outPath = writeGuestExcel(
    aoa,
    [
      { wch: 5 },
      { wch: 28 },
      { wch: 14 },
      { wch: 12 },
      { wch: 28 },
      { wch: 55 },
      { wch: 80 },
    ],
    'Guest Invites',
    'guests-links'
  );

  console.log(`\nSaved Excel: ${outPath}`);
  console.log(
    `Created: ${created} | Updated: ${updated} | Skipped CSV dupes: ${skippedCsvDupes}`
  );
}

async function exportGuests() {
  requireInviteSecret();
  const { db, databaseId } = initAdminFirestore();
  const siteUrl = getSiteUrl();
  const messageConfig = getInviteMessageConfig();

  console.log(`Exporting guests from "${databaseId}"`);
  console.log(`Invite base URL: ${siteUrl}\n`);

  const snap = await db.collection(GUESTS_COLLECTION).get();
  /** @type {Array<{
   *   name: string,
   *   title: string,
   *   inviteType: string,
   *   id: string,
   *   inviteUrl: string,
   *   rsvp: string,
   *   attendingCount: number | '',
   *   wish: string,
   *   message: string,
   *   hasRsvp: boolean,
   *   rsvpAtMs: number,
   *   rsvpAtLabel: string,
   * }>} */
  const guests = [];

  /** @param {unknown} value */
  function toMillis(value) {
    if (!value) return 0;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value.toDate === 'function') return value.toDate().getTime();
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return 0;
  }

  /** @param {number} ms */
  function formatRsvpAt(ms) {
    if (!ms) return '';
    return new Date(ms).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }

  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) return;

    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const inviteType =
      data.inviteType === 'physical'
        ? 'physical'
        : data.inviteType === 'both'
          ? 'both'
          : data.inviteType === 'special'
            ? 'special'
            : 'livestream';
    const inviteUrl = buildInviteUrl(siteUrl, docSnap.id);
    const rsvp = typeof data.rsvpStatus === 'string' ? data.rsvpStatus.trim() : '';
    const attendingCount =
      typeof data.attendingCount === 'number' ? data.attendingCount : '';
    const wish = typeof data.wish === 'string' ? data.wish : '';
    const rsvpAtMs =
      toMillis(data.wishSubmittedAt) || toMillis(data.updatedAt) || 0;

    const { message } = buildInviteMessage({
      guestName: formatGuestDisplayName(name, title),
      inviteType,
      inviteUrl,
      config: messageConfig,
    });

    guests.push({
      name,
      title,
      inviteType,
      id: docSnap.id,
      inviteUrl,
      rsvp,
      attendingCount,
      wish,
      message,
      hasRsvp: Boolean(rsvp),
      rsvpAtMs,
      rsvpAtLabel: formatRsvpAt(rsvpAtMs),
    });
  });

  if (guests.length === 0) {
    console.log('No guests found in Firestore.');
    return;
  }

  const inviteTypeOrder = { physical: 0, livestream: 1, both: 2, special: 3 };

  /** @param {string} rsvp */
  function rsvpGroup(rsvp) {
    if (rsvp === 'Attending') return 0;
    if (rsvp === 'Declined') return 1;
    return 2; // not yet
  }

  guests.sort((a, b) => {
    // 1) Attending → Declined → Not yet RSVP
    const groupDiff = rsvpGroup(a.rsvp) - rsvpGroup(b.rsvp);
    if (groupDiff !== 0) return groupDiff;

    const group = rsvpGroup(a.rsvp);
    // 2) For Attending / Declined: sort by RSVP time (earliest first)
    if (group === 0 || group === 1) {
      if (a.rsvpAtMs !== b.rsvpAtMs) {
        // Missing timestamp goes last within the group
        if (!a.rsvpAtMs) return 1;
        if (!b.rsvpAtMs) return -1;
        return a.rsvpAtMs - b.rsvpAtMs;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    }

    // 3) Not yet RSVP: invite type → name
    const typeDiff =
      (inviteTypeOrder[a.inviteType] ?? 99) - (inviteTypeOrder[b.inviteType] ?? 99);
    if (typeDiff !== 0) return typeDiff;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const aoa = [
    [
      'No',
      'Name',
      'Title',
      'Invite Type',
      'Guest ID',
      'Invite URL',
      'RSVP',
      'RSVP At',
      'Attending Count',
      'Wish',
      'Chat WA',
    ],
  ];

  const SECTION_LABELS = {
    0: '— Accepting (Attending) —',
    1: '— Declined —',
    2: '— Not yet RSVP —',
  };

  let no = 0;
  let accepting = 0;
  let declined = 0;
  let pending = 0;
  let lastGroup = -1;

  for (const g of guests) {
    const group = rsvpGroup(g.rsvp);
    if (group !== lastGroup) {
      aoa.push(['', SECTION_LABELS[group], '', '', '', '', '', '', '', '', '']);
      lastGroup = group;
    }

    no += 1;
    if (group === 0) accepting += 1;
    else if (group === 1) declined += 1;
    else pending += 1;

    aoa.push([
      no,
      g.name,
      g.title,
      g.inviteType,
      g.id,
      g.inviteUrl,
      g.rsvp,
      g.rsvpAtLabel,
      g.attendingCount,
      g.wish,
      g.message,
    ]);
  }

  const outPath = writeGuestExcel(
    aoa,
    [
      { wch: 5 },
      { wch: 28 },
      { wch: 14 },
      { wch: 12 },
      { wch: 28 },
      { wch: 55 },
      { wch: 12 },
      { wch: 20 },
      { wch: 16 },
      { wch: 40 },
      { wch: 80 },
    ],
    'Guest Invites',
    'guests-links'
  );

  console.log(`Saved Excel: ${outPath}`);
  console.log(
    `Total: ${guests.length} | Attending: ${accepting} | Declined: ${declined} | Not yet: ${pending}`
  );
  console.log(
    'Sort: Attending/Declined by RSVP time → Not yet by inviteType → name'
  );
}

async function backfillResponseTitles() {
  const { db, databaseId } = initAdminFirestore();
  const RESPONSES = 'guest_responses';

  console.log(`Backfilling titles into "${RESPONSES}" (${databaseId})...\n`);

  const [guestsSnap, responsesSnap] = await Promise.all([
    db.collection(GUESTS_COLLECTION).get(),
    db.collection(RESPONSES).get(),
  ]);

  /** @type {Map<string, string>} */
  const titleByGuestId = new Map();
  guestsSnap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    if (title) titleByGuestId.set(docSnap.id, title);
  });

  let updated = 0;
  let skipped = 0;
  let missingGuestTitle = 0;

  for (const docSnap of responsesSnap.docs) {
    const data = docSnap.data() || {};
    const existing =
      typeof data.title === 'string' ? data.title.trim() : '';
    const fromGuest = titleByGuestId.get(docSnap.id) || '';

    if (!fromGuest) {
      missingGuestTitle += 1;
      skipped += 1;
      continue;
    }

    if (existing === fromGuest) {
      skipped += 1;
      continue;
    }

    await docSnap.ref.update({ title: fromGuest });
    updated += 1;
    process.stdout.write(`✓ ${docSnap.id} → ${fromGuest}\n`);
  }

  console.log(
    `\nUpdated: ${updated} | Skipped: ${skipped} (no guest title: ${missingGuestTitle})`
  );
}

async function main() {
  const [, , command, ...rest] = process.argv;
  const cmd = (command || '').toLowerCase();

  if (cmd === 'import') {
    await importGuests(rest[0] || 'data/guests.csv');
    return;
  }

  if (cmd === 'export') {
    await exportGuests();
    return;
  }

  if (cmd === 'backfill-titles') {
    await backfillResponseTitles();
    return;
  }

  // Backward-friendly: treat a .csv path as import
  if (command && /\.csv$/i.test(command)) {
    await importGuests(command);
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
