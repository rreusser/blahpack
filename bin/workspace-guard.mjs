#!/usr/bin/env node

/**
* Workspace sufficiency check (CONVENTIONS D5c; ticket 0060).
*
* A `<routine>.js` wrapper must accept `WORK = null` (and IWORK, RWORK, ...)
* and then allocate a SUFFICIENT workspace. Nothing checked the "sufficient"
* part, and wrappers allocating a length-1 workspace returned NaN without
* any error, because typed arrays drop out-of-range writes.
*
* For each module, this runs the module's own tests with the wrapper
* rewritten in memory (bin/workspace-guard-loader.mjs): every null-allocated
* workspace argument is forced to null, and the allocation gets a guard
* region of sentinels past its end. A changed sentinel means the routine
* wrote past what the wrapper allocated. Test failures caused by forcing
* null (a test reading WORK as output, say) are ignored; only guard
* violations count. A module is reported as unexercised unless the
* allocation is reached from a test that passes and does not expect a throw
* (each top-level `test()` in the module's test files is wrapped to record
* this; ticket 0066).
*
* Usage:
*   node bin/workspace-guard.mjs <routine> [...]
*   node bin/workspace-guard.mjs --all [--check]
*   node bin/workspace-guard.mjs --changed [--base <ref>] [--check]
*
* Results are cached per module and computed in a worker pool
* (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, moduleDir, selectRoutines, testConcurrency, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';

const ENTRY = fileURLToPath( import.meta.url );
const LOADER = path.join( ROOT, 'bin', 'workspace-guard-loader.mjs' );
const ALLOC = /\b[A-Z]*WORK\s*=\s*new\s+\w+\s*\(/;

function analyze( r ) {
	const dir = moduleDir( r );
	const wrapper = dir && path.join( dir, 'lib', r + '.js' );
	if ( !wrapper || !fs.existsSync( wrapper ) || !ALLOC.test( fs.readFileSync( wrapper, 'utf8' ) ) ) {
		return null;
	}
	const tdir = path.join( dir, 'test' );
	const files = fs.readdirSync( tdir ).filter( ( f ) => /^test.*\.js$/.test( f ) ).map( ( f ) => path.join( tdir, f ) );
	const report = path.join( fs.mkdtempSync( path.join( os.tmpdir(), 'ws-guard-' ) ), 'report.jsonl' );
	const env = Object.assign( {}, process.env, {
		'NODE_OPTIONS': ( ( process.env.NODE_OPTIONS || '' ) + ' --import=' + pathToFileURL( LOADER ).href ).trim(),
		'WS_GUARD_TARGET': pathToFileURL( wrapper ).href,
		'WS_GUARD_REPORT': report,
		'WS_GUARD_TESTDIR': pathToFileURL( tdir ).href + '/'
	});
	spawnSync( process.execPath, [ '--test', ...testConcurrency(), '--test-reporter=dot', ...files ], { 'cwd': ROOT, 'timeout': 180000, 'encoding': 'utf8', 'env': env } );
	const rows = fs.existsSync( report ) ? fs.readFileSync( report, 'utf8' ).trim().split( '\n' ).filter( Boolean ).map( ( l ) => JSON.parse( l ) ) : [];
	fs.rmSync( path.dirname( report ), { 'recursive': true, 'force': true } );
	const bad = rows.filter( ( x ) => x.overrun );
	// `reached`: allocations made at all (including from throw tests and
	// failing tests); `exercised`: allocations made inside a passing test that
	// does not expect a throw (ticket 0066).
	return { 'routine': r, 'reached': rows.length, 'exercised': rows.filter( ( x ) => x.verified ).length, 'overruns': bad };
}

async function main( argv ) {
	const check = argv.includes( '--check' );
	const asJson = argv.includes( '--json' );
	const routines = selectRoutines( argv, 'workspace-guard' );
	if ( routines === null ) {
		process.exitCode = 2;
		return;
	}
	const all = ( await runCorpus( { 'tool': 'workspace-guard', 'entry': ENTRY, 'extraFiles': [ LOADER ], 'routines': routines, 'argv': argv } ) ).filter( Boolean );
	const errors = all.filter( ( x ) => x.error );
	const res = all.filter( ( x ) => !x.error );
	if ( asJson ) {
		console.log( JSON.stringify( res, null, 1 ) );
	}
	const bad = res.filter( ( x ) => x.overruns.length );
	const unexercised = res.filter( ( x ) => x.exercised === 0 );
	if ( !asJson ) {
		errors.forEach( ( x ) => console.log( 'ERROR         ' + x.routine + ': ' + x.error ) );
		bad.forEach( ( x ) => {
			const o = x.overruns[ 0 ];
			console.log( 'INSUFFICIENT  ' + o.tag + '  allocated ' + o.n + ', written up to ' + ( o.n + o.lastBeyond + 1 ) + ' elements (' + x.overruns.length + ' call(s))' );
		});
		unexercised.forEach( ( x ) => console.log( 'unexercised   ' + x.routine + '  (' + ( x.reached ? 'reached only from throw tests or failing tests' : 'no test reaches the null-workspace allocation' ) + ')' ) );
		console.log( '\n' + res.length + ' wrappers with null-workspace allocations, ' + bad.length + ' insufficient, ' + unexercised.length + ' unexercised' );
	}
	if ( check && ( bad.length || errors.length ) ) {
		process.exitCode = 1;
	}
}

if ( isWorker() ) {
	workerMain( analyze );
} else {
	main( process.argv.slice( 2 ) );
}
