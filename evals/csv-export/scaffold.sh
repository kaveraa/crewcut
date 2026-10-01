#!/usr/bin/env bash
set -eu
mkdir -p src/models src/services src/utils tests
cat > package.json <<'EOF'
{
  "name": "demo-crm",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "test": "node --test"
  }
}
EOF
cat > src/config.js <<'EOF'
'use strict';

module.exports = {
  currency: 'EUR',
  locale: 'fr-FR',
  reminderDays: 3,
  pageSize: 25,
};
EOF
cat > src/db.js <<'EOF'
'use strict';

// in-memory store, one Map per collection
const collections = new Map();

function collection(name) {
  if (!collections.has(name)) collections.set(name, new Map());
  return collections.get(name);
}

function reset() {
  collections.clear();
}

module.exports = { collection, reset };
EOF
cat > src/models/customer.js <<'EOF'
'use strict';
const { collection } = require('../db');
const { slugify } = require('../utils/slug');

function createCustomer({ name, country }) {
  const id = slugify(name);
  const customer = { id, name, country, createdAt: new Date().toISOString() };
  collection('customers').set(id, customer);
  return customer;
}

function getCustomer(id) {
  return collection('customers').get(id) || null;
}

module.exports = { createCustomer, getCustomer };
EOF
cat > src/models/contact.js <<'EOF'
'use strict';
const { collection } = require('../db');
const { isEmail } = require('../utils/validate');

function createContact({ customerId, name, email }) {
  if (!isEmail(email)) throw new Error('invalid email');
  const id = `${customerId}:${email.toLowerCase()}`;
  const contact = { id, customerId, name, email: email.toLowerCase() };
  collection('contacts').set(id, contact);
  return contact;
}

function contactsOf(customerId) {
  return [...collection('contacts').values()].filter((c) => c.customerId === customerId);
}

module.exports = { createContact, contactsOf };
EOF
cat > src/models/deal.js <<'EOF'
'use strict';
const { collection } = require('../db');

let seq = 0;

// amountCents is an integer in cents, never a float of euros
function createDeal({ customerId, title, amountCents, stage = 'lead' }) {
  if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error('amountCents must be a non-negative integer');
  seq += 1;
  const deal = { id: `D${seq}`, customerId, title, amountCents, stage, closeDate: null };
  collection('deals').set(deal.id, deal);
  return deal;
}

function allDeals() {
  return [...collection('deals').values()];
}

function getDeal(id) {
  return collection('deals').get(id) || null;
}

module.exports = { createDeal, allDeals, getDeal };
EOF
cat > src/models/task.js <<'EOF'
'use strict';
const { collection } = require('../db');

let seq = 0;

function createTask({ dealId, label, dueDate }) {
  seq += 1;
  const task = { id: `T${seq}`, dealId, label, dueDate, done: false };
  collection('tasks').set(task.id, task);
  return task;
}

function tasksOf(dealId) {
  return [...collection('tasks').values()].filter((t) => t.dealId === dealId);
}

function openTasks() {
  return [...collection('tasks').values()].filter((t) => !t.done);
}

module.exports = { createTask, tasksOf, openTasks };
EOF
cat > src/models/note.js <<'EOF'
'use strict';
const { collection } = require('../db');

let seq = 0;

function addNote(dealId, text) {
  seq += 1;
  const note = { id: `N${seq}`, dealId, text, at: new Date().toISOString() };
  collection('notes').set(note.id, note);
  return note;
}

function notesOf(dealId) {
  return [...collection('notes').values()].filter((n) => n.dealId === dealId);
}

module.exports = { addNote, notesOf };
EOF
cat > src/utils/money.js <<'EOF'
'use strict';
const { currency } = require('../config');

// cents -> "12.34 EUR"
function formatCents(cents) {
  return (cents / 100).toFixed(2) + ' ' + currency;
}

// "12.34" -> 1234
function parseEuros(text) {
  const value = Number(String(text).replace(',', '.'));
  if (!Number.isFinite(value)) throw new Error('invalid amount');
  return Math.round(value * 100);
}

module.exports = { formatCents, parseEuros };
EOF
cat > src/utils/dates.js <<'EOF'
'use strict';

function addDays(iso, days) {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isPast(iso, today = new Date().toISOString().slice(0, 10)) {
  return iso < today;
}

module.exports = { addDays, isPast };
EOF
cat > src/utils/slug.js <<'EOF'
'use strict';

function slugify(text) {
  return String(text)
    .normalize('NFD')
    .replace(/[^\x00-\x7f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

module.exports = { slugify };
EOF
cat > src/utils/csv.js <<'EOF'
'use strict';

function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function toCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) lines.push(headers.map((h) => escapeCell(row[h])).join(','));
  return lines.join('\n') + '\n';
}

module.exports = { toCsv, escapeCell };
EOF
cat > src/utils/validate.js <<'EOF'
'use strict';

function isEmail(text) {
  return typeof text === 'string' && text.includes('@') && !text.startsWith('@') && !text.endsWith('@');
}

function isStage(stage) {
  return ['lead', 'qualified', 'proposal', 'won', 'lost'].includes(stage);
}

module.exports = { isEmail, isStage };
EOF
cat > src/services/pipeline.js <<'EOF'
'use strict';
const { getDeal } = require('../models/deal');
const { isStage } = require('../utils/validate');

const ORDER = ['lead', 'qualified', 'proposal', 'won', 'lost'];

function moveDeal(id, stage) {
  if (!isStage(stage)) throw new Error('unknown stage');
  const deal = getDeal(id);
  if (!deal) throw new Error('unknown deal');
  if (ORDER.indexOf(stage) < ORDER.indexOf(deal.stage) && stage !== 'lost') throw new Error('cannot move back');
  deal.stage = stage;
  if (stage === 'won' || stage === 'lost') deal.closeDate = new Date().toISOString().slice(0, 10);
  return deal;
}

module.exports = { moveDeal, ORDER };
EOF
cat > src/services/stats.js <<'EOF'
'use strict';
const { allDeals } = require('../models/deal');

function pipelineValue() {
  return allDeals()
    .filter((d) => d.stage !== 'won' && d.stage !== 'lost')
    .reduce((sum, d) => sum + d.amountCents, 0);
}

function winRate() {
  const closed = allDeals().filter((d) => d.stage === 'won' || d.stage === 'lost');
  if (closed.length === 0) return 0;
  return closed.filter((d) => d.stage === 'won').length / closed.length;
}

module.exports = { pipelineValue, winRate };
EOF
cat > src/services/reminders.js <<'EOF'
'use strict';
const { openTasks } = require('../models/task');
const { isPast } = require('../utils/dates');

function overdueTasks(today) {
  return openTasks().filter((t) => isPast(t.dueDate, today));
}

module.exports = { overdueTasks };
EOF
cat > src/services/search.js <<'EOF'
'use strict';
const { allDeals } = require('../models/deal');

function searchDeals(query) {
  const needle = String(query).toLowerCase();
  return allDeals().filter((d) => d.title.toLowerCase().includes(needle));
}

module.exports = { searchDeals };
EOF
cat > src/services/importer.js <<'EOF'
'use strict';
const { createDeal } = require('../models/deal');
const { parseEuros } = require('../utils/money');

// rows come from a CSV typed by hand: amounts are euros as text, "1200" or "1200,50"
function importDeals(rows) {
  return rows.map((row) => createDeal({
    customerId: row.customer,
    title: row.title,
    amountCents: parseEuros(row.amount),
    stage: row.stage || 'lead',
  }));
}

module.exports = { importDeals };
EOF
cat > src/services/export.js <<'EOF'
'use strict';
const { allDeals } = require('../models/deal');
const { getCustomer } = require('../models/customer');
const { toCsv } = require('../utils/csv');

const HEADERS = ['id', 'customer', 'title', 'amount', 'stage', 'closeDate'];

// the CSV goes to the accounting team, who read amounts in euros
function exportDeals() {
  const rows = allDeals().map((deal) => ({
    id: deal.id,
    customer: (getCustomer(deal.customerId) || { name: deal.customerId }).name,
    title: deal.title,
    amount: deal.amountCents,
    stage: deal.stage,
    closeDate: deal.closeDate || '',
  }));
  return toCsv(HEADERS, rows);
}

module.exports = { exportDeals, HEADERS };
EOF
cat > src/services/customers.js <<'EOF'
'use strict';
const { createCustomer, getCustomer } = require('../models/customer');
const { createContact, contactsOf } = require('../models/contact');

function onboard({ name, country, contact }) {
  const customer = createCustomer({ name, country });
  if (contact) createContact({ customerId: customer.id, ...contact });
  return customer;
}

function customerCard(id) {
  const customer = getCustomer(id);
  if (!customer) return null;
  return { ...customer, contacts: contactsOf(id) };
}

module.exports = { onboard, customerCard };
EOF
cat > src/index.js <<'EOF'
'use strict';

module.exports = {
  ...require('./services/customers'),
  ...require('./services/pipeline'),
  ...require('./services/stats'),
  ...require('./services/reminders'),
  ...require('./services/search'),
  ...require('./services/importer'),
  ...require('./services/export'),
};
EOF
cat > tests/money.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatCents, parseEuros } = require('../src/utils/money');

test('formatCents prints euros with two decimals', () => {
  assert.equal(formatCents(123456), '1234.56 EUR');
});

test('parseEuros accepts a comma and rounds to the cent', () => {
  assert.equal(parseEuros('1200,50'), 120050);
  assert.equal(parseEuros('0.005'), 1);
});
EOF
cat > tests/csv.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { toCsv } = require('../src/utils/csv');

test('toCsv quotes cells that need it', () => {
  assert.equal(toCsv(['a', 'b'], [{ a: 'x,y', b: 'say "hi"' }]), 'a,b\n"x,y","say ""hi"""\n');
});
EOF
cat > tests/pipeline.test.js <<'EOF'
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { reset } = require('../src/db');
const { createDeal } = require('../src/models/deal');
const { moveDeal } = require('../src/services/pipeline');

beforeEach(reset);

test('a deal moves forward and gets a close date when won', () => {
  const deal = createDeal({ customerId: 'acme', title: 'Site', amountCents: 500000 });
  moveDeal(deal.id, 'proposal');
  assert.equal(moveDeal(deal.id, 'won').closeDate.length, 10);
});

test('a deal cannot move back', () => {
  const deal = createDeal({ customerId: 'acme', title: 'Site', amountCents: 500000, stage: 'proposal' });
  assert.throws(() => moveDeal(deal.id, 'lead'), /cannot move back/);
});
EOF
cat > tests/export.test.js <<'EOF'
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { reset } = require('../src/db');
const { createCustomer } = require('../src/models/customer');
const { createDeal } = require('../src/models/deal');
const { exportDeals, HEADERS } = require('../src/services/export');

beforeEach(reset);

test('the export has one header line and one line per deal', () => {
  createCustomer({ name: 'Acme', country: 'FR' });
  createDeal({ customerId: 'acme', title: 'Site', amountCents: 125000 });
  createDeal({ customerId: 'acme', title: 'App', amountCents: 99900 });
  const lines = exportDeals().trim().split('\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[0], HEADERS.join(','));
  assert.match(lines[1], /^D\d+,Acme,Site,/);
});
EOF
cat > tests/importer.test.js <<'EOF'
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { reset } = require('../src/db');
const { importDeals } = require('../src/services/importer');

beforeEach(reset);

test('imported amounts are stored in cents', () => {
  const [deal] = importDeals([{ customer: 'acme', title: 'Site', amount: '1250' }]);
  assert.equal(deal.amountCents, 125000);
});
EOF
cat > tests/stats.test.js <<'EOF'
'use strict';
const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { reset } = require('../src/db');
const { createDeal } = require('../src/models/deal');
const { pipelineValue, winRate } = require('../src/services/stats');

beforeEach(reset);

test('pipelineValue sums open deals only', () => {
  createDeal({ customerId: 'a', title: 'x', amountCents: 100 });
  createDeal({ customerId: 'a', title: 'y', amountCents: 200, stage: 'won' });
  assert.equal(pipelineValue(), 100);
  assert.equal(winRate(), 1);
});
EOF
