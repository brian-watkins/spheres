#!/usr/bin/env bash

set -ex

# Install deps
npm install

# Install playwright browsers
npx playwright install chromium --with-deps --only-shell

# Install Claude
curl -fsSL https://claude.ai/install.sh | bash