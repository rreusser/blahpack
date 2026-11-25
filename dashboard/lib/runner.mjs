// Runs a known command (looked up by id; the client never sends a command),
// streams its output to subscribers, and remembers the last result per id in
// dashboard/.state/results.json so results survive a restart.

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { ROOT } from './sources.mjs';

const STATE_DIR = path.join( ROOT, 'dashboard', '.state' );
const STATE_FILE = path.join( STATE_DIR, 'results.json' );
const MAX_OUTPUT = 512 * 1024;

export function createRunner( { concurrency = 2, onEvent } ) {
	const results = load();
	const procs = new Map();
	const queue = [];

	function emit( type, data ) {
		onEvent( type, data );
	}

	function publicResult( r ) {
		const { output, ...rest } = r;
		return rest;
	}

	function save() {
		try {
			fs.mkdirSync( STATE_DIR, { 'recursive': true } );
			const out = {};
			for ( const [ id, r ] of Object.entries( results ) ) {
				if ( r.status !== 'running' && r.status !== 'queued' ) {
					out[ id ] = r;
				}
			}
			fs.writeFileSync( STATE_FILE, JSON.stringify( out ) );
		} catch ( err ) {
			console.error( 'could not save state:', err.message );
		}
	}

	function enqueue( id, cmd ) {
		const cur = results[ id ];
		if ( cur && ( cur.status === 'running' || cur.status === 'queued' ) ) {
			return publicResult( cur );
		}
		results[ id ] = { id, cmd, 'status': 'queued', 'queuedAt': Date.now(), 'output': '' };
		queue.push( id );
		emit( 'run', publicResult( results[ id ] ) );
		pump();
		return publicResult( results[ id ] );
	}

	function pump() {
		while ( procs.size < concurrency && queue.length ) {
			start( queue.shift() );
		}
	}

	function start( id ) {
		const r = results[ id ];
		r.status = 'running';
		r.startedAt = Date.now();
		// GitHub Actions runs `run:` steps with `bash -e`; match it. A new
		// process group lets Stop kill the whole tree.
		const child = spawn( 'bash', [ '-e', '-o', 'pipefail', '-c', r.cmd ], {
			'cwd': ROOT,
			'detached': true,
			'env': { ...process.env, 'NO_COLOR': '1', 'FORCE_COLOR': '0' },
			'stdio': [ 'ignore', 'pipe', 'pipe' ]
		});
		procs.set( id, child );
		emit( 'run', publicResult( r ) );
		const onData = ( buf ) => {
			const chunk = buf.toString( 'utf8' );
			r.output += chunk;
			if ( r.output.length > MAX_OUTPUT ) {
				r.output = '…[earlier output truncated]…\n' + r.output.slice( -MAX_OUTPUT );
			}
			emit( 'out', { id, chunk } );
		};
		child.stdout.on( 'data', onData );
		child.stderr.on( 'data', onData );
		child.on( 'close', ( code, signal ) => {
			procs.delete( id );
			r.endedAt = Date.now();
			r.durationMs = r.endedAt - r.startedAt;
			r.code = code;
			r.status = r.stopped ? 'stopped' : ( code === 0 ? 'pass' : 'fail' );
			delete r.stopped;
			r.summary = summarize( r.output, signal );
			emit( 'run', publicResult( r ) );
			save();
			pump();
		});
	}

	function stop( id ) {
		const qi = queue.indexOf( id );
		if ( qi >= 0 ) {
			queue.splice( qi, 1 );
			delete results[ id ];
			emit( 'run', { id, 'status': 'idle' } );
			return true;
		}
		const child = procs.get( id );
		if ( !child ) {
			return false;
		}
		results[ id ].stopped = true;
		try {
			process.kill( -child.pid, 'SIGTERM' );
		} catch {
			child.kill( 'SIGTERM' );
		}
		return true;
	}

	function stopAll() {
		for ( const id of [ ...queue ] ) {
			stop( id );
		}
		for ( const id of procs.keys() ) {
			stop( id );
		}
	}

	return {
		enqueue,
		stop,
		stopAll,
		'all': () => Object.fromEntries( Object.entries( results ).map( ( [ k, v ] ) => [ k, publicResult( v ) ] ) ),
		'get': ( id ) => results[ id ] || null
	};
}

function load() {
	try {
		return JSON.parse( fs.readFileSync( STATE_FILE, 'utf8' ) );
	} catch {
		return {};
	}
}

// One line for the badge: node:test totals, the corpus total, or the last
// meaningful line of output.
export function summarize( output, signal ) {
	if ( signal ) {
		return 'killed (' + signal + ')';
	}
	const pick = ( re ) => {
		const m = output.match( re );
		return m ? Number( m[ 1 ] ) : null;
	};
	const pass = pick( /ℹ pass (\d+)/ );
	const fail = pick( /ℹ fail (\d+)/ );
	if ( pass !== null || fail !== null ) {
		return ( pass || 0 ) + ' pass, ' + ( fail || 0 ) + ' fail';
	}
	const viol = pick( /Total violations:\s*(\d+)/ );
	if ( viol !== null ) {
		return viol + ' violation' + ( viol === 1 ? '' : 's' );
	}
	const lines = output.split( '\n' ).map( ( l ) => l.trim() ).filter( Boolean );
	const last = lines[ lines.length - 1 ] || '';
	return last.length > 140 ? last.slice( 0, 137 ) + '…' : last;
}
