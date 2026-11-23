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
* `<routine>.js` wrapper, `main.js`, `index.js`. The wrapper is where the
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
* `--check` exits 1 if any file is below its threshold (THRESHOLDS below).
* `--uncovered` lists the uncovered line numbers of each failing file.
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];
const REPLAY_COVERAGE = path.join( ROOT, 'test', 'harness', 'replay-coverage.mjs' );

// Minimum line and branch coverage (percent) per file role.
const THRESHOLDS = {
	'wrapper': { 'lines': 100, 'branches': 100 },
	'ndarray': { 'lines': 100, 'branches': 100 },
	'base': { 'lines': 90, 'branches': 85 },
	'other': { 'lines': 90, 'branches': 85 }
};

function moduleDir( r ) {
	for ( const pkg of PKGS ) {
		const d = path.join( ROOT, 'lib', pkg, 'base', r );
		if ( fs.existsSync( d ) ) {
			return d;
		}
	}
	return null;
}

function allRoutines() {
	const out = [];
	for ( const pkg of PKGS ) {
		const d = path.join( ROOT, 'lib', pkg, 'base' );
		if ( fs.existsSync( d ) ) {
			fs.readdirSync( d ).forEach( ( r ) => out.push( r ) );
		}
	}
	return out.sort();
}

function changedRoutines( base ) {
	const run = ( args ) => spawnSync( 'git', args, { 'cwd': ROOT, 'encoding': 'utf8' } );
	const mb = run( [ 'merge-base', 'HEAD', base ] );
	if ( mb.status !== 0 ) {
		return null;
	}
	const files = run( [ 'diff', '--name-only', mb.stdout.trim() ] ).stdout.split( '\n' )
		.concat( run( [ 'ls-files', '--others', '--exclude-standard', 'lib/' ] ).stdout.split( '\n' ) );
	const out = new Set();
	files.forEach( ( f ) => {
		const m = /^lib\/(?:blas|lapack|arpack)\/base\/([^/]+)\//.exec( f );
		if ( m && moduleDir( m[ 1 ] ) ) {
			out.add( m[ 1 ] );
		}
	});
	return [ ...out ].sort();
}

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

// Parse an lcov file into { file: { lf, lh, brf, brh, uncovered: [lines] } }.
function parseLcov( text ) {
	const out = {};
	let cur = null;
	text.split( '\n' ).forEach( ( line ) => {
		const i = line.indexOf( ':' );
		const k = ( i < 0 ) ? line : line.slice( 0, i );
		const v = ( i < 0 ) ? '' : line.slice( i + 1 );
		if ( k === 'SF' ) {
			cur = { 'lf': 0, 'lh': 0, 'brf': 0, 'brh': 0, 'uncovered': [], 'uncoveredBranches': [] };
			out[ path.relative( ROOT, path.resolve( ROOT, v ) ) ] = cur;
		} else if ( !cur ) {
			// ignore
		} else if ( k === 'LF' ) {
			cur.lf = Number( v );
		} else if ( k === 'LH' ) {
			cur.lh = Number( v );
		} else if ( k === 'BRF' ) {
			cur.brf = Number( v );
		} else if ( k === 'BRH' ) {
			cur.brh = Number( v );
		} else if ( k === 'BRDA' ) {
			const parts = v.split( ',' );
			if ( parts[ 3 ] === '0' || parts[ 3 ] === '-' ) {
				cur.uncoveredBranches.push( Number( parts[ 0 ] ) );
			}
		} else if ( k === 'DA' ) {
			const [ ln, hits ] = v.split( ',' );
			if ( Number( hits ) === 0 ) {
				cur.uncovered.push( Number( ln ) );
			}
		}
	});
	return out;
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
	const parsed = parseLcov( text );
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

function main() {
	const argv = process.argv.slice( 2 );
	const flag = ( f ) => argv.includes( f );
	let routines;
	if ( flag( '--all' ) ) {
		routines = allRoutines();
	} else if ( flag( '--changed' ) ) {
		const i = argv.indexOf( '--base' );
		const base = ( i >= 0 ) ? argv[ i + 1 ] : 'origin/main';
		routines = changedRoutines( base );
		if ( routines === null ) {
			console.error( 'coverage: cannot find merge-base with ' + base + ' (fetch full history)' );
			process.exit( 2 );
		}
	} else {
		routines = argv.filter( ( a, i ) => !a.startsWith( '--' ) && argv[ i - 1 ] !== '--base' );
	}
	const results = routines.map( measure );
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

main();
