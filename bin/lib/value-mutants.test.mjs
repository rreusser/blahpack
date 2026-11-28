/**
* Tests of bin/value-mutants.mjs (ticket 0093): its operators, the stability
* of its keys, the diff scope, and that it catches the bug that motivated it.
*
* zlahef's upper row max searched `izamax( k - imax - 1, … )` where the
* reference covers K-IMAX rows (ticket 0108). It was fully covered, and the
* tests before PR #58 passed with it. The self-test below runs the tool's
* mutant at that site against zhetrf's tests as they were before PR #58
* (test/harness/fixtures/value-mutants/zhetrf-pre58/test.ndarray.js, the only
* zhetrf test file the PR changed) and as they are now:
*
* - fixed code, old tests: `k - imax` -> `( k - imax ) - 1` (the old bug)
*   survives, so the tool would have flagged the line;
* - fixed code, current tests: the same mutant is killed;
* - old code, old tests: `k - imax - 1` -> `k - imax` (the fix) survives;
*   the tool points at the buggy line of the old code.
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT } from './corpus.mjs';
import { enumerate, runMutants, changedLines } from '../value-mutants.mjs';

const FIX = path.join( ROOT, 'test', 'harness', 'fixtures', 'value-mutants', 'zhetrf-pre58' );
const ZLAHEF = path.join( ROOT, 'lib', 'lapack', 'zlahef', 'lib', 'base.js' );
const TESTS = path.join( ROOT, 'lib', 'lapack', 'zhetrf', 'test' );
const CURRENT = [ 'test.js', 'test.ndarray.js', 'test.validate.js', 'test.zhetrf.js' ].map( ( f ) => path.join( TESTS, f ) );
const OLD = [ path.join( TESTS, 'test.js' ), path.join( FIX, 'test.ndarray.js' ), path.join( TESTS, 'test.validate.js' ), path.join( TESTS, 'test.zhetrf.js' ) ];
const SITE = /jmax = imax \+ 1 \+ izamax\( k - imax/;

// A file path inside a (nonexistent) module, so imports resolve to real callees.
const FAKE = path.join( ROOT, 'lib', 'blas', 'dfake', 'lib', 'base.js' );
const SNIPPET = [
	'import dscal from \'../../dscal/lib/base.js\';',
	'function dfake( N, x, strideX, offsetX ) {',
	'\tlet i;',
	'\tif ( N <= 0 ) {',
	'\t\treturn x;',
	'\t}',
	'\tfor ( i = 0; i < N - 1; i++ ) {',
	'\t\tx[ offsetX + ( ( i + 1 ) * strideX ) ] = 2.0;',
	'\t}',
	'\tif ( N > 2 ) {',
	'\t\tdscal( N - 1, 0.5, x, strideX, offsetX );',
	'\t}',
	'\treturn x;',
	'}',
	'export default dfake;',
	''
].join( '\n' );

function siteMutant( src, op, before ) {
	const lines = src.split( '\n' );
	const line = lines.findIndex( ( l ) => SITE.test( l ) ) + 1;
	const ms = enumerate( src, ZLAHEF ).filter( ( m ) => m.line === line && m.op === op && m.before === before );
	assert.equal( ms.length, 1, op + ' mutants at line ' + line );
	return ms[ 0 ];
}

test( 'enumerate: each operator, at the sites it targets', () => {
	const ms = enumerate( SNIPPET, FAKE );
	const got = ms.map( ( m ) => m.line + ' ' + m.op + ' `' + m.before + '` -> `' + m.after + '`' );
	assert.deepEqual( got, [
		'4 boundary `<=` -> `<`',
		'7 boundary `<` -> `<=`',
		'7 minus-one-dropped `N - 1` -> `N`',
		'8 plus-one-dropped `i + 1` -> `i`',
		'10 boundary `>` -> `>=`',
		'11 delete-stmt `dscal( N - 1, 0.5, x, strideX, offsetX );` -> `;`',
		'11 count-short `N - 1` -> `( N - 1 ) - 1`',
		'11 minus-one-dropped `N - 1` -> `N`'
	] );
	ms.forEach( ( m ) => assert.notEqual( m.src, SNIPPET ) );
});

test( 'enumerate: a complex module\'s imaginary-part subscript `v[ i + 1 ]` is not mutated; other `+ 1` terms are', () => {
	const src = 'function zfake( N, v, o ) {\n\tv[ o + 1 ] = v[ ( o + 1 ) * 2 ];\n}\nexport default zfake;\n';
	const ms = enumerate( src, path.join( ROOT, 'lib', 'blas', 'zfake', 'lib', 'base.js' ) );
	assert.deepEqual( ms.map( ( m ) => m.before ), [ 'o + 1' ] );
	assert.match( ms[ 0 ].after, /^o$/ );
	assert.equal( ms[ 0 ].src.indexOf( 'v[ o ] =' ), -1 );
});

test( 'enumerate: keys survive line moves and comments, and change with the code they are about', () => {
	const keys = ( s ) => enumerate( s, FAKE ).map( ( m ) => m.key );
	const moved = SNIPPET.replace( '\tlet i;\n', '\tlet i;\n\n\t// A comment that moves everything down.\n\n' );
	assert.deepEqual( keys( moved ), keys( SNIPPET ) );
	const edited = SNIPPET.replace( 'dscal( N - 1,', 'dscal( N - 2,' );
	const a = new Set( keys( SNIPPET ) );
	const changed = keys( edited ).filter( ( k ) => !a.has( k ) );
	// The call's delete-stmt and count-short mutants get new keys (its
	// minus-one-dropped is gone); the loop's and the conditions' keep theirs.
	assert.equal( changed.length, 2 );
	assert.equal( new Set( keys( SNIPPET ) ).size, keys( SNIPPET ).length );
});

test( 'self-test (ticket 0108): the old zlahef row-max bug survives the pre-PR #58 tests and is killed by the current ones', async () => {
	const src = fs.readFileSync( ZLAHEF, 'utf8' );
	const m = siteMutant( src, 'count-short', 'k - imax' );

	const old = await runMutants( { 'file': ZLAHEF, 'tests': OLD, 'mutants': [ m ], 'concurrency': 1 } );
	assert.ok( old, 'the pre-PR #58 tests pass on the fixed code' );
	assert.equal( old.results[ 0 ].killed, false, 'the old tests cannot see the off-by-one' );

	const cur = await runMutants( { 'file': ZLAHEF, 'tests': CURRENT, 'mutants': [ m ], 'concurrency': 1 } );
	assert.equal( cur.results[ 0 ].killed, true, 'the upper_66_* reference tests kill it' );
	assert.equal( cur.results[ 0 ].outcome, 'fail' );
	assert.equal( cur.results[ 0 ].by, 'test.ndarray.js' );
});

test( 'self-test (ticket 0108): on the old zlahef the tool flags the buggy line; the current tests reject that code', async () => {
	const oldSrc = fs.readFileSync( path.join( FIX, 'zlahef-base.js' ), 'utf8' );
	const m = siteMutant( oldSrc, 'minus-one-dropped', 'k - imax - 1' );
	// The fixture is the current file but for its 5-line header and that one line.
	assert.equal( m.src.split( '\n' ).slice( 5 ).join( '\n' ), fs.readFileSync( ZLAHEF, 'utf8' ) );

	const old = await runMutants( { 'file': ZLAHEF, 'baseSrc': oldSrc, 'tests': OLD, 'mutants': [ m ], 'concurrency': 1 } );
	assert.ok( old, 'the pre-PR #58 tests pass on the old code' );
	assert.equal( old.results[ 0 ].killed, false, 'SURVIVED at the buggy line' );

	const cur = await runMutants( { 'file': ZLAHEF, 'baseSrc': oldSrc, 'tests': CURRENT, 'mutants': [ m ], 'concurrency': 1 } );
	assert.equal( cur, null, 'the current tests fail on the old code' );
});

test( 'runMutants: a mutant that hangs is killed by the timeout and reported as such', async () => {
	const file = path.join( ROOT, 'lib', 'blas', 'ddot', 'lib', 'base.js' );
	const src = fs.readFileSync( file, 'utf8' );
	const hang = { 'key': 'k', 'line': 1, 'op': 'test', 'before': '', 'after': '', 'context': '', 'src': src.replace( 'dtemp = 0.0;', 'dtemp = 0.0; for ( ;; ) {}' ) };
	assert.notEqual( hang.src, src );
	const tests = [ path.join( ROOT, 'lib', 'blas', 'ddot', 'test', 'test.ndarray.js' ) ];
	const t0 = Date.now();
	const r = await runMutants( { 'file': file, 'tests': tests, 'mutants': [ hang ], 'concurrency': 1, 'timeoutMs': 2000 } );
	assert.equal( r.results[ 0 ].outcome, 'timeout' );
	assert.equal( r.results[ 0 ].killed, true );
	assert.ok( Date.now() - t0 < 20000 );
});

test( 'changedLines follows a rename: a moved file reports only the lines edited, not all of it (ticket 0125)', () => {
	const dir = fs.mkdtempSync( path.join( os.tmpdir(), 'value-mutants-rename-' ) );
	const sh = ( ...args ) => {
		const r = spawnSync( 'git', args, { 'cwd': dir, 'encoding': 'utf8' } );
		assert.equal( r.status, 0, r.stderr );
		return r.stdout.trim();
	};
	try {
		sh( 'init', '-q' );
		sh( 'config', 'user.email', 'test@example.com' );
		sh( 'config', 'user.name', 'test' );
		const body = Array.from( { 'length': 20 }, ( _, i ) => `const v${i} = ${i};` );
		fs.mkdirSync( path.join( dir, 'lib', 'blas', 'base', 'ddot', 'lib' ), { 'recursive': true } );
		fs.writeFileSync( path.join( dir, 'lib', 'blas', 'base', 'ddot', 'lib', 'base.js' ), body.join( '\n' ) + '\n' );
		sh( 'add', '-A' );
		sh( 'commit', '-qm', 'old layout' );
		const mb = sh( 'rev-parse', 'HEAD' );
		fs.mkdirSync( path.join( dir, 'lib', 'blas', 'ddot' ), { 'recursive': true } );
		sh( 'mv', 'lib/blas/base/ddot/lib', 'lib/blas/ddot/lib' );
		body[ 2 ] = 'const v2 = 42;';
		fs.writeFileSync( path.join( dir, 'lib', 'blas', 'ddot', 'lib', 'base.js' ), body.join( '\n' ) + '\n' );
		fs.writeFileSync( path.join( dir, 'new.js' ), 'const a = 1;\n' );
		sh( 'add', '-A' );
		sh( 'commit', '-qm', 'flatten' );
		assert.deepEqual( changedLines( mb, 'lib/blas/ddot/lib/base.js', dir ), [ [ 3, 3 ] ] );
		assert.equal( changedLines( mb, 'new.js', dir ), null, 'a file new since mb is entirely changed' );
	} finally {
		fs.rmSync( dir, { 'recursive': true, 'force': true } );
	}
});
