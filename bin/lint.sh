#!/bin/bash
# Run ESLint (flat config, local binary) on blahpack module sources.
#
# Uses the pinned local eslint and eslint.config.cjs, which loads every
# project rule from lint/plugin.cjs. With no path arguments it lints all of
# lib/ in a single ESLint run (one process; ~5s for the whole corpus).
#
# Usage:
#   bin/lint.sh                                     # lint all modules
#   bin/lint.sh lib/blas/base/daxpy/lib/base.js    # lint specific files
#   bin/lint.sh lib/blas/base/daxpy/lib/           # lint a directory
#   bin/lint.sh --fix lib/blas/base/daxpy/lib/     # auto-fix

BLAHPACK_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$BLAHPACK_DIR" || exit 2

export ESLINT_USE_FLAT_CONFIG=true
ESLINT="$BLAHPACK_DIR/node_modules/.bin/eslint"
if [ ! -x "$ESLINT" ]; then
	echo "eslint not found at $ESLINT — run 'npm ci' first." >&2
	exit 2
fi

HAS_PATH=false
for arg in "$@"; do
	if [ "${arg:0:1}" != "-" ]; then
		HAS_PATH=true
	fi
done

if [ "$HAS_PATH" = true ]; then
	exec "$ESLINT" "$@"
fi
exec "$ESLINT" "$@" lib/
