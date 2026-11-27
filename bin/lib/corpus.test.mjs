/**
* Tests of the corpus-check driver (bin/lib/corpus.mjs; ticket 0070): module
* selection, the input closure a cached result is keyed on, and the cache
* itself (hit, miss on a changed input, `--no-cache`, errors not cached).
*/

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT, CACHE, selectRoutines, moduleInputs, runCorpus } from './corpus.mjs';

const rel = ( set ) => new Set( [ ...set ].map( ( f ) => path.relative( ROOT, f ) ) );

test( 'selectRoutines: positional arguments, skipping option values', () => {
	assert.deepEqual( selectRoutines( [ 'dgeqrf', '--jobs', '2', '--base', 'x', 'dlarfg', '--slowest', '3', '--check' ], 't' ), [ 'dgeqrf', 'dlarfg' ] );
});

test( 'selectRoutines: --all lists every module', () => {
	const all = selectRoutines( [ '--all' ], 't' );
	assert.ok( all.includes( 'dgeqrf' ) && all.includes( 'ddot' ) && all.length > 500 );
});

test( 'moduleInputs: the module, its spec, its dependencies and their JSON fixtures', () => {
	const files = rel( moduleInputs( 'dgeqrf' ) );
	assert.ok( files.has( 'lib/lapack/dgeqrf/lib/base.js' ) );
	assert.ok( files.has( 'lib/lapack/dgeqrf/test/fixtures/3x3.json' ) );
	assert.ok( files.has( 'spec/dgeqrf.json' ) );
	// Transitive: dgeqrf -> dgeqr2 -> dlarfg.
	assert.ok( files.has( 'lib/lapack/dlarfg/lib/base.js' ) );
	assert.ok( [ ...files ].every( ( f ) => !f.includes( 'node_modules' ) && !f.startsWith( '..' ) ) );
});

test( 'moduleInputs: fixtures named only by a string literal', () => {
	const files = rel( moduleInputs( 'dgbbrd' ) );
	assert.ok( [ ...files ].some( ( f ) => /^test\/fixtures\/dgbbrd.*\.jsonl$/.test( f ) ), 'expected a test/fixtures/dgbbrd*.jsonl input' );
});

test( 'runCorpus: caches results, recomputes on a changed input, never caches errors', async () => {
	const tool = 'corpus-test-' + process.pid;
	const tmp = fs.mkdtempSync( path.join( os.tmpdir(), 'corpus-test-' ) );
	const log = path.join( tmp, 'computed.log' );
	const entry = path.join( tmp, 'tool.mjs' );
	const version = path.join( tmp, 'version.json' );
	fs.writeFileSync( version, '1' );
	fs.writeFileSync( entry, [
		"import fs from 'node:fs';",
		"import { isWorker, workerMain } from " + JSON.stringify( path.join( ROOT, 'bin', 'lib', 'corpus.mjs' ) ) + ';',
		'if ( isWorker() ) {',
		'	workerMain( ( r ) => {',
		'		fs.appendFileSync( ' + JSON.stringify( log ) + ", r + '\\n' );",
		"		return ( r === 'dlarfg' ) ? { 'routine': r, 'error': 'boom' } : { 'routine': r, 'ok': true };",
		'	});',
		'}'
	].join( '\n' ) );
	const run = ( argv ) => runCorpus( { 'tool': tool, 'entry': entry, 'extraFiles': [ version ], 'routines': [ 'ddot', 'dlarfg' ], 'argv': argv.concat( [ '--jobs', '2' ] ) } );
	const computed = () => ( fs.existsSync( log ) ? fs.readFileSync( log, 'utf8' ).trim().split( '\n' ).sort() : [] );
	try {
		let res = await run( [] );
		assert.deepEqual( res, [ { 'routine': 'ddot', 'ok': true }, { 'routine': 'dlarfg', 'error': 'boom' } ] );
		assert.deepEqual( computed(), [ 'ddot', 'dlarfg' ] );

		// ddot from the cache; dlarfg's error was not cached.
		res = await run( [] );
		assert.deepEqual( res[ 0 ], { 'routine': 'ddot', 'ok': true } );
		assert.deepEqual( computed(), [ 'ddot', 'dlarfg', 'dlarfg' ] );

		// --no-cache recomputes everything.
		await run( [ '--no-cache' ] );
		assert.deepEqual( computed(), [ 'ddot', 'ddot', 'dlarfg', 'dlarfg', 'dlarfg' ] );

		// A changed tool input invalidates every entry.
		fs.writeFileSync( version, '2' );
		await run( [] );
		assert.equal( computed().filter( ( r ) => r === 'ddot' ).length, 3 );
	} finally {
		fs.rmSync( tmp, { 'recursive': true, 'force': true } );
		fs.rmSync( path.join( CACHE, tool ), { 'recursive': true, 'force': true } );
	}
});
