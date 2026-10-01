#!/usr/bin/env bash
set -eu
mkdir -p src tests
cat > package.json <<'EOF'
{
  "name": "demo-store",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "scripts": {
    "test": "node --test"
  }
}
EOF
cat > src/countries.js <<'EOF'
'use strict';

// ISO 3166-1 alpha-2 codes of the EU member states
const EU_MEMBERS = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
]);

// countries we serve from the European warehouse, EU or not
const EUROPEAN = new Set([...EU_MEMBERS, 'CH', 'NO', 'GB', 'IS', 'LI']);

function isEuMember(code) {
  return EU_MEMBERS.has(code);
}

function isEuropean(code) {
  return EUROPEAN.has(code);
}

module.exports = { isEuMember, isEuropean };
EOF
cat > src/vat.js <<'EOF'
'use strict';
const { isEuropean } = require('./countries');

const EU_RATE = 0.2;

function vatRate(country) {
  return isEuropean(country) ? EU_RATE : 0;
}

function vatAmount(net, country) {
  return Math.round(net * vatRate(country));
}

module.exports = { vatRate, vatAmount, EU_RATE };
EOF
cat > src/shipping.js <<'EOF'
'use strict';
const { isEuropean } = require('./countries');

const EUROPE_FLAT = 700;
const WORLD_FLAT = 2500;
const FREE_FROM = 10000;

function shippingCost(net, country) {
  if (net >= FREE_FROM) return 0;
  return isEuropean(country) ? EUROPE_FLAT : WORLD_FLAT;
}

module.exports = { shippingCost, EUROPE_FLAT, WORLD_FLAT, FREE_FROM };
EOF
cat > src/money.js <<'EOF'
'use strict';

// amounts are integers in cents
function formatCents(cents) {
  return (cents / 100).toFixed(2) + ' EUR';
}

module.exports = { formatCents };
EOF
cat > src/discount.js <<'EOF'
'use strict';

const CODES = { WELCOME10: 0.1, SUMMER20: 0.2 };

function discountAmount(net, code) {
  const rate = CODES[code] || 0;
  return Math.round(net * rate);
}

module.exports = { discountAmount };
EOF
cat > src/order.js <<'EOF'
'use strict';
const { vatAmount } = require('./vat');
const { shippingCost } = require('./shipping');
const { discountAmount } = require('./discount');

function subtotal(lines) {
  return lines.reduce((sum, line) => sum + line.unitCents * line.qty, 0);
}

function orderTotal(order) {
  const net = subtotal(order.lines) - discountAmount(subtotal(order.lines), order.code);
  const vat = vatAmount(net, order.country);
  const shipping = shippingCost(net, order.country);
  return { net, vat, shipping, total: net + vat + shipping };
}

module.exports = { subtotal, orderTotal };
EOF
cat > src/invoice.js <<'EOF'
'use strict';
const { orderTotal } = require('./order');
const { formatCents } = require('./money');

function renderInvoice(order) {
  const t = orderTotal(order);
  return [
    `Net: ${formatCents(t.net)}`,
    `VAT: ${formatCents(t.vat)}`,
    `Shipping: ${formatCents(t.shipping)}`,
    `Total: ${formatCents(t.total)}`,
  ].join('\n');
}

module.exports = { renderInvoice };
EOF
cat > tests/vat.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { vatRate, vatAmount } = require('../src/vat');

test('a French order carries the EU rate', () => {
  assert.equal(vatRate('FR'), 0.2);
});

test('a US order carries no VAT', () => {
  assert.equal(vatRate('US'), 0);
});

test('vatAmount rounds to the cent', () => {
  assert.equal(vatAmount(1001, 'DE'), 200);
});
EOF
cat > tests/shipping.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { shippingCost, EUROPE_FLAT, WORLD_FLAT } = require('../src/shipping');

test('Switzerland ships at the European flat rate', () => {
  assert.equal(shippingCost(500, 'CH'), EUROPE_FLAT);
});

test('Japan ships at the world flat rate', () => {
  assert.equal(shippingCost(500, 'JP'), WORLD_FLAT);
});

test('large orders ship free', () => {
  assert.equal(shippingCost(10000, 'JP'), 0);
});
EOF
cat > tests/order.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { orderTotal } = require('../src/order');

const lines = [{ unitCents: 2500, qty: 2 }, { unitCents: 1000, qty: 1 }];

test('a German order adds VAT and European shipping', () => {
  assert.deepEqual(orderTotal({ lines, country: 'DE' }), { net: 6000, vat: 1200, shipping: 700, total: 7900 });
});

test('a discount code applies before VAT', () => {
  assert.deepEqual(orderTotal({ lines, country: 'DE', code: 'WELCOME10' }), { net: 5400, vat: 1080, shipping: 700, total: 7180 });
});
EOF
cat > tests/money.test.js <<'EOF'
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatCents } = require('../src/money');

test('formatCents prints two decimals and the currency', () => {
  assert.equal(formatCents(1234), '12.34 EUR');
});
EOF
