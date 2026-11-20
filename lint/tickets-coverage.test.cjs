'use strict';

// Tests for the PR-description deferral check (CONVENTIONS P1). The repo-side
// coverage checks (registry, artifacts, docs) run on the real tree in CI via
// `npm run tickets:check`; this pins the parser on synthetic descriptions.

const test = require( 'node:test' );
const assert = require( 'node:assert' );
const coverage = require( '../bin/tickets-coverage.js' );

const TICKETS = {
	'0027': { 'meta': { 'id': '0027', 'status': 'open' }, 'src': 'benchmarks' },
	'0001': { 'meta': { 'id': '0001', 'status': 'resolved' }, 'src': 'ld rules' }
};

function errs( body ) {
	return coverage.prBody( body, TICKETS );
}

test( 'a description with no deferrals passes', function t() {
	assert.deepStrictEqual( errs( '## Summary\n\n- Fix dgetrf pivoting.\n- Add tests.\n\n## Checks\n\n- unit: pass\n' ), [] );
});

test( 'each item under a deferral heading needs a ticket', function t() {
	const e = errs( '## Not in this PR\n- About 606 benchmarks use scaffold bodies.\n- Random inputs.\n' );
	assert.strictEqual( e.length, 2 );
	assert.match( e[ 0 ], /line 2: deferred work without a ticket/ );
});

test( 'items that cite an existing ticket pass', function t() {
	assert.deepStrictEqual( errs( '## Follow-ups\n- Benchmarks are stale (ticket 0027).\n- See tickets/0027-module-benchmarks.md\n' ), [] );
});

test( 'a deferral heading that cites a ticket covers its items', function t() {
	assert.deepStrictEqual( errs( 'Known gaps (ticket 0027):\n- one\n- two\n' ), [] );
});

test( 'a citation of a missing ticket fails', function t() {
	const e = errs( '## Not in this PR\n- Something (ticket 0999).\n' );
	assert.strictEqual( e.length, 1 );
	assert.match( e[ 0 ], /ticket 0999, which does not exist/ );
});

test( 'a deferral sentence in a paragraph needs a ticket', function t() {
	assert.strictEqual( errs( 'Fixes the pivot bug. The row-major case is a follow-up.\n' ).length, 1 );
	assert.deepStrictEqual( errs( 'Fixes the pivot bug. The row-major case is a follow-up (ticket 0027).\n' ), [] );
});

test( 'a deferring list item ending in a colon scopes its children', function t() {
	const body = [
		'## Notes',
		'- **Ledger:** unchanged.',
		'- **Not covered yet (remaining Step 4):**',
		'  - mixed strides;',
		'  - calls into routines without a spec.',
		'- **Commits:** two.'
	].join( '\n' );
	const e = errs( body );
	assert.deepStrictEqual( e.map( function m( x ) {
		return Number( x.match( /line (\d+)/ )[ 1 ] );
	}), [ 3, 4, 5 ] );
});

test( 'the scope of a deferral heading ends at the next heading or paragraph', function t() {
	assert.strictEqual( errs( '## Out of scope\n- a\n\n## Checks\n- unit: pass\n' ).length, 1 );
	assert.strictEqual( errs( '## Out of scope\n- a\n\nThat is all.\n- b\n' ).length, 1 );
});

test( 'a citation of a resolved ticket is accepted in a PR (the PR may resolve it)', function t() {
	assert.deepStrictEqual( errs( '## Follow-ups\n- LD rules (ticket 0001).\n' ), [] );
});
