#!/usr/bin/env node

/**
* Per-file test coverage of modules (ticket 0064).
*
* For each module, runs all of its `test/test*.js` once under node's
* coverage, together with the wrapper replay (test/harness/replay-coverage.mjs:
* every recorded `ndarray.js` call replayed through the wrapper, in both
* orders and with `WORK = null`), restricted to the module's own `lib/`
* files, and reports line
* and branch coverage for EVERY file there: `base.js`, `ndarray.js`, the
* `<routine>.js` wrapper, `index.js`. The wrapper is where the
* convenience logic lives (`order`/LD mapping, `WORK = null` allocation),
* and a module's correctness tests usually bypass it, so it must be measured
* on its own (ticket 0060's 15 undersized allocations sat in wrapper lines
* no test ran).
*
* Usage:
*   node bin/coverage.mjs <routine> [...] [--check] [--json] [--uncovered]
*   node bin/coverage.mjs --all [--check] [--json]
*   node bin/coverage.mjs --changed [--base <ref>] [--check] [--json]
*
* Results are cached per module and computed in a worker pool
* (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*
* `--check` exits 1 if any file is below its threshold (THRESHOLDS below).
* `--uncovered` lists the uncovered line numbers of each failing file.
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ROOT, moduleDir, selectRoutines, testConcurrency, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';
import { parseLcov } from './lib/lcov.mjs';

const ENTRY = fileURLToPath( import.meta.url );
const REPLAY_COVERAGE = path.join( ROOT, 'test', 'harness', 'replay-coverage.mjs' );

// Minimum line and branch coverage (percent) per file role.
const THRESHOLDS = {
	'wrapper': { 'lines': 100, 'branches': 100 },
	'ndarray': { 'lines': 100, 'branches': 100 },
	'base': { 'lines': 90, 'branches': 85 },
	'other': { 'lines': 90, 'branches': 85 }
};

function role( r, file ) {
	const b = path.basename( file );
	if ( b === r + '.js' ) {
		return 'wrapper';
	}
	if ( b === 'ndarray.js' ) {
		return 'ndarray';
	}
	if ( b === 'base.js' ) {
		return 'base';
	}
	return 'other';
}

function pct( hit, found ) {
	return ( found === 0 ) ? 100 : ( 100 * hit / found );
}

function measure( r ) {
	const dir = moduleDir( r );
	const testDir = path.join( dir, 'test' );
	const tests = fs.existsSync( testDir ) ? fs.readdirSync( testDir ).filter( ( f ) => /^test(\..+)?\.js$/.test( f ) ).map( ( f ) => path.join( testDir, f ) ) : [];
	if ( !tests.length ) {
		return { 'routine': r, 'error': 'no test files', 'files': [] };
	}
	// The wrapper replay (ticket 0065) runs in the same coverage run, so the
	// wrapper lines its replayed ndarray calls reach count as covered.
	if ( fs.existsSync( path.join( dir, 'lib', r + '.js' ) ) && fs.existsSync( path.join( ROOT, 'spec', r + '.json' ) ) ) {
		tests.push( REPLAY_COVERAGE );
	}
	const rel = path.relative( ROOT, dir );
	const tmp = fs.mkdtempSync( path.join( os.tmpdir(), 'cov-' ) );
	const lcov = path.join( tmp, 'lcov.info' );
	const res = spawnSync( process.execPath, [
		'--test',
		...testConcurrency(),
		'--experimental-test-coverage',
		'--test-coverage-include=' + rel + '/lib/**',
		'--test-reporter=lcov', '--test-reporter-destination=' + lcov,
		'--test-reporter=dot', '--test-reporter-destination=' + path.join( tmp, 'dot.txt' )
	].concat( tests ), { 'cwd': ROOT, 'encoding': 'utf8', 'timeout': 600000, 'env': Object.assign( {}, process.env, { 'REPLAY_MODULE': dir } ) } );
	const text = fs.existsSync( lcov ) ? fs.readFileSync( lcov, 'utf8' ) : '';
	fs.rmSync( tmp, { 'recursive': true, 'force': true } );
	if ( !text ) {
		return { 'routine': r, 'error': 'no coverage produced (exit ' + res.status + ')', 'files': [] };
	}
	const parsed = parseLcov( text, ROOT );
	const files = Object.keys( parsed ).sort().map( ( f ) => {
		const c = parsed[ f ];
		const ro = role( r, f );
		const t = THRESHOLDS[ ro ];
		const lines = pct( c.lh, c.lf );
		const branches = pct( c.brh, c.brf );
		return {
			'file': f,
			'role': ro,
			'lines': lines,
			'branches': branches,
			'uncovered': c.uncovered,
			'uncoveredBranches': [ ...new Set( c.uncoveredBranches ) ],
			'min': t,
			'ok': lines >= t.lines && branches >= t.branches
		};
	});
	return { 'routine': r, 'testsFailed': res.status !== 0, 'files': files };
}

async function main() {
	const argv = process.argv.slice( 2 );
	const flag = ( f ) => argv.includes( f );
	const routines = selectRoutines( argv, 'coverage' );
	if ( routines === null ) {
		process.exit( 2 );
	}
	const results = await runCorpus( { 'tool': 'coverage', 'entry': ENTRY, 'extraFiles': [ REPLAY_COVERAGE ], 'env': [ 'REPLAY_MAX_CALLS' ], 'routines': routines, 'argv': argv } );
	if ( flag( '--json' ) ) {
		console.log( JSON.stringify( results, null, 1 ) );
	} else {
		results.forEach( ( m ) => {
			if ( m.error ) {
				console.log( 'ERROR  ' + m.routine + ': ' + m.error );
				return;
			}
			m.files.filter( ( f ) => !f.ok ).forEach( ( f ) => {
				const t = THRESHOLDS[ f.role ];
				console.log( 'BELOW  ' + f.file + '  lines ' + f.lines.toFixed( 1 ) + '% (min ' + t.lines + '), branches ' + f.branches.toFixed( 1 ) + '% (min ' + t.branches + ')' + ( flag( '--uncovered' ) && f.uncovered.length ? '\n       uncovered lines: ' + f.uncovered.join( ' ' ) : '' ) + ( flag( '--uncovered' ) && f.uncoveredBranches.length ? '\n       branches not taken at lines: ' + f.uncoveredBranches.join( ' ' ) : '' ) );
			});
		});
		const bad = results.filter( ( m ) => m.error || m.files.some( ( f ) => !f.ok ) );
		console.log( '\n' + results.length + ' modules, ' + bad.length + ' below threshold' );
	}
	if ( flag( '--check' ) && results.some( ( m ) => m.error || m.files.some( ( f ) => !f.ok ) ) ) {
		process.exit( 1 );
	}
}

if ( isWorker() ) {
	workerMain( measure );
} else {
	main();
}
