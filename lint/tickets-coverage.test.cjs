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

// Code comments (CONVENTIONS P1, ticket 0055)

test( 'a comment admitting a known problem needs a ticket', function t() {
	const errs = coverage.codeCommentProblems( 'f.js', 'x = 1; // TODO: set correct size\n', TICKETS );
	assert.strictEqual( errs.length, 1 );
	assert.match( errs[ 0 ], /^f\.js:1: comment admitting a known problem without a ticket/ );
});

test( 'a citation on a later line of the same comment block counts', function t() {
	const src = '\t// The kb >= 2 path still differs from the reference (ticket\n\t// 0027), so AB is checked loosely.\n';
	assert.deepStrictEqual( coverage.codeCommentProblems( 'f.js', src, TICKETS ), [] );
});

test( 'a citation in a different comment block does not count', function t() {
	const src = '// known issue here\nx = 1;\n// see ticket 0027\n';
	assert.strictEqual( coverage.codeCommentProblems( 'f.js', src, TICKETS ).length, 1 );
});

test( 'a comment citing a resolved ticket fails (the problem is gone, so update the comment)', function t() {
	const errs = coverage.codeCommentProblems( 'f.js', '/* FIXME: ticket 0001 */\n', TICKETS );
	assert.strictEqual( errs.length, 1 );
	assert.match( errs[ 0 ], /resolved/ );
});

test( 'block comments and JSDoc lines are scanned', function t() {
	const src = '/**\n* Does a thing.\n*\n* @param {string} x - `a` (not implemented)\n*/\n';
	assert.strictEqual( coverage.codeCommentProblems( 'f.js', src, TICKETS ).length, 1 );
});

test( 'ordinary explanatory comments and strings containing // pass', function t() {
	const src = '// Solve the transposed system (Fortran GO TO 20).\nconst u = \'https://known issue.example\';\n';
	assert.deepStrictEqual( coverage.codeCommentProblems( 'f.js', src, TICKETS ), [] );
});
