#!/usr/bin/env node

/**
* Wrapper replay check (tickets 0065, 0068): replays every module's recorded
* `strided.js` calls through its `<routine>.js` wrapper and requires
* results (exact with recorded workspaces; with `WORK = null`), and audits
* each vector length the wrapper assumes. See test/harness/replay.js.
*
* Usage:
*   node bin/wrapper-replay.mjs <routine> [...] [--check] [--json]
*   node bin/wrapper-replay.mjs --all [--check] [--json]
*   node bin/wrapper-replay.mjs --changed [--base <ref>] [--check] [--json]
*
* Results are cached per module and computed in a worker pool
* (bin/lib/corpus.mjs; `--no-cache`, `--jobs <n>`).
*
* `--check` exits 1 on any mismatch, rejected call or length finding, a
* timeout, or when a module's tests make no replayable `strided` call.
*/

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, moduleDir, selectRoutines, isWorker, workerMain, runCorpus } from './lib/corpus.mjs';
import { runReplay } from '../test/harness/replay.js';

const ENTRY = fileURLToPath( import.meta.url );
const HARNESS = path.join( ROOT, 'test', 'harness' );

function failed( r ) {
	return Boolean( r.unmapped || r.error ) || r.mismatches.length > 0 || r.rejected.length > 0 || r.lengths.length > 0 || ( r.validation || [] ).length > 0 || r.variants === 0;
}

async function main() {
	const argv = process.argv.slice( 2 );
	const flag = ( f ) => argv.includes( f );
	const routines = selectRoutines( argv, 'wrapper-replay' );
	if ( routines === null ) {
		process.exit( 2 );
	}
	const results = ( await runCorpus( { 'tool': 'wrapper-replay', 'entry': ENTRY, 'extraFiles': [ 'replay-offsets.mjs', 'replay-run.mjs', 'replay-record.mjs' ].map( ( f ) => path.join( HARNESS, f ) ), 'env': [ 'REPLAY_MAX_CALLS', 'REPLAY_MAX' ], 'routines': routines, 'argv': argv } ) ).map( ( r ) => Object.assign( { 'mismatches': [], 'rejected': [], 'lengths': [], 'variants': 0 }, r ) );
	if ( flag( '--json' ) ) {
		console.log( JSON.stringify( results, null, 1 ) );
	} else {
		results.forEach( ( r ) => {
			if ( r.error ) {
				console.log( 'ERROR      ' + r.routine + ': ' + r.error );
			} else if ( r.unmapped ) {
				console.log( 'UNMAPPED   ' + r.routine + ': ' + r.unmapped );
			} else if ( r.variants === 0 ) {
				console.log( 'UNTESTED   ' + r.routine + ': no replayable strided call (' + r.recorded + ' recorded; ' + JSON.stringify( r.skipped ) + ')' );
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

if ( isWorker() ) {
	workerMain( ( r ) => runReplay( moduleDir( r ) ) );
} else {
	main();
}
