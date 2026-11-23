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
* violations count. A module whose tests never reach the allocation is
* reported as unexercised.
*
* Usage:
*   node bin/workspace-guard.mjs <routine> [...]
*   node bin/workspace-guard.mjs --all [--check]
*   node bin/workspace-guard.mjs --changed [--base <ref>] [--check]
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const LOADER = path.join( ROOT, 'bin', 'workspace-guard-loader.mjs' );
const ALLOC = /\b[A-Z]*WORK\s*=\s*new\s+\w+\s*\(/;

function moduleDir( r ) {
	for ( const pkg of [ 'blas', 'lapack', 'arpack' ] ) {
		const d = path.join( ROOT, 'lib', pkg, 'base', r );
		if ( fs.existsSync( d ) ) {
			return d;
		}
	}
	return null;
}

function allRoutines() {
	const out = [];
	for ( const pkg of [ 'blas', 'lapack', 'arpack' ] ) {
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
		'WS_GUARD_REPORT': report
	});
	spawnSync( process.execPath, [ '--test', '--test-reporter=dot', ...files ], { 'cwd': ROOT, 'timeout': 180000, 'encoding': 'utf8', 'env': env } );
	const rows = fs.existsSync( report ) ? fs.readFileSync( report, 'utf8' ).trim().split( '\n' ).filter( Boolean ).map( ( l ) => JSON.parse( l ) ) : [];
	fs.rmSync( path.dirname( report ), { 'recursive': true, 'force': true } );
	const bad = rows.filter( ( x ) => x.overrun );
	return { 'routine': r, 'exercised': rows.length, 'overruns': bad };
}

function main( argv ) {
	const check = argv.includes( '--check' );
	const asJson = argv.includes( '--json' );
	const bi = argv.indexOf( '--base' );
	const base = ( bi >= 0 ) ? argv[ bi + 1 ] : 'origin/main';
	let routines = argv.filter( ( a, i ) => !a.startsWith( '--' ) && argv[ i - 1 ] !== '--base' );
	if ( argv.includes( '--all' ) ) {
		routines = allRoutines();
	} else if ( argv.includes( '--changed' ) ) {
		routines = changedRoutines( base );
		if ( routines === null ) {
			console.error( 'workspace-guard: `' + base + '` is not available; fetch it (CI needs full history) or pass --base <ref>' );
			process.exitCode = 2;
			return;
		}
	}
	const res = routines.map( analyze ).filter( Boolean );
	if ( asJson ) {
		console.log( JSON.stringify( res, null, 1 ) );
	}
	const bad = res.filter( ( x ) => x.overruns.length );
	const unexercised = res.filter( ( x ) => x.exercised === 0 );
	if ( !asJson ) {
		bad.forEach( ( x ) => {
			const o = x.overruns[ 0 ];
			console.log( 'INSUFFICIENT  ' + o.tag + '  allocated ' + o.n + ', written up to ' + ( o.n + o.lastBeyond + 1 ) + ' elements (' + x.overruns.length + ' call(s))' );
		});
		unexercised.forEach( ( x ) => console.log( 'unexercised   ' + x.routine + '  (no test reaches the null-workspace allocation)' ) );
		console.log( '\n' + res.length + ' wrappers with null-workspace allocations, ' + bad.length + ' insufficient, ' + unexercised.length + ' unexercised' );
	}
	if ( check && bad.length ) {
		process.exitCode = 1;
	}
}

main( process.argv.slice( 2 ) );
