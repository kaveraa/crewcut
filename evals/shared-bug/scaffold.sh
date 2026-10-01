#!/usr/bin/env bash
set -eu
cat > package.json <<'EOF'
{
  "name": "demo-shop",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs"
}
EOF
cat > price.js <<'EOF'
'use strict';

function formatPrice(amount) {
  if (!Number.isFinite(amount)) return NaN;
  return amount.toFixed(2) + ' EUR';
}

module.exports = { formatPrice };
EOF
cat > cart.js <<'EOF'
'use strict';
const { formatPrice } = require('./price');

function cartTotal(items) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  return formatPrice(total);
}

module.exports = { cartTotal };
EOF
cat > invoice.js <<'EOF'
'use strict';
const { formatPrice } = require('./price');

function invoiceLine(label, amount) {
  return `${label}: ${formatPrice(amount)}`;
}

module.exports = { invoiceLine };
EOF
cat > checkout.js <<'EOF'
'use strict';
const { formatPrice } = require('./price');

// form.amount comes straight from the request body, so it is a string
function checkoutSummary(form) {
  return `You will pay ${formatPrice(form.amount)}`;
}

module.exports = { checkoutSummary };
EOF
