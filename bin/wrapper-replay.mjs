#!/usr/bin/env node

/**
* Wrapper replay check (tickets 0065, 0068): replays every module's recorded
* `ndarray.js` calls through its `<routine>.js` wrapper and requires
* results (exact with recorded workspaces; with `WORK = null`), and audits
* each vector length the wrapper assumes. See test/harness/replay.js.
*
* Usage:
*   node bin/wrapper-replay.mjs <routine> [...] [--check] [--json]
*   node bin/wrapper-replay.mjs --all [--check] [--json]
*   node bin/wrapper-replay.mjs --changed [--base <ref>] [--check] [--json]
*
* `--check` exits 1 on any mismatch, rejected call or length finding, a
* timeout, or when a module's tests make no replayable `ndarray` call.
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { runReplay } from '../test/harness/replay.js';

const ROOT = path.resolve( path.dirname( fileURLToPath( import.meta.url ) ), '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];

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

function failed( r ) {
	return Boolean( r.unmapped || r.error ) || r.mismatches.length > 0 || r.rejected.length > 0 || r.lengths.length > 0 || ( r.validation || [] ).length > 0 || r.variants === 0;
}

async function main() {
	const argv = process.argv.slice( 2 );
	const flag = ( f ) => argv.includes( f );
	let routines;
	if ( flag( '--all' ) ) {
		routines = allRoutines();
	} else if ( flag( '--changed' ) ) {
		const i = argv.indexOf( '--base' );
		routines = changedRoutines( ( i >= 0 ) ? argv[ i + 1 ] : 'origin/main' );
		if ( routines === null ) {
			console.error( 'wrapper-replay: cannot find merge-base (fetch full history)' );
			process.exit( 2 );
		}
	} else {
		routines = argv.filter( ( a, i ) => !a.startsWith( '--' ) && argv[ i - 1 ] !== '--base' );
	}
	const results = [];
	for ( const r of routines ) {
		results.push( runReplay( moduleDir( r ) ) );
	}
	if ( flag( '--json' ) ) {
		console.log( JSON.stringify( results, null, 1 ) );
	} else {
		results.forEach( ( r ) => {
			if ( r.error ) {
				console.log( 'ERROR      ' + r.routine + ': ' + r.error );
			} else if ( r.unmapped ) {
				console.log( 'UNMAPPED   ' + r.routine + ': ' + r.unmapped );
			} else if ( r.variants === 0 ) {
				console.log( 'UNTESTED   ' + r.routine + ': no replayable ndarray call (' + r.recorded + ' recorded; ' + JSON.stringify( r.skipped ) + ')' );
			}
			r.mismatches.slice( 0, 3 ).forEach( ( m ) => console.log( 'MISMATCH   ' + r.routine + '  ' + m.variant + ': ' + m.detail ) );
			r.rejected.slice( 0, 3 ).forEach( ( m ) => console.log( 'REJECTED   ' + r.routine + '  ' + m.variant + ': ' + m.detail ) );
			( r.validation || [] ).slice( 0, 3 ).forEach( ( v ) => console.log( 'VALIDATION ' + r.routine + '  ' + v.form + ' `' + v.check + '`: ' + v.detail ) );
			const seen = new Set();
			r.lengths.forEach( ( l ) => {
				const key = l.kind + l.param + l.wrapper + ( l.spec ?? l.touched );
				if ( seen.has( key ) || seen.size >= 4 ) {
					return;
				}
				seen.add( key );
				console.log( 'LENGTH     ' + r.routine + '  ' + l.param + ': wrapper assumes ' + l.wrapper + ', ' + ( ( l.kind === 'shorter-than-touched' ) ? 'call touches ' + l.touched : 'spec says ' + l.spec ) );
			});
		});
		console.log( '\n' + results.length + ' modules, ' + results.filter( failed ).length + ' failing' );
	}
	if ( flag( '--check' ) && results.some( failed ) ) {
		process.exit( 1 );
	}
}

main();
