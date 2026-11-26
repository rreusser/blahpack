#!/usr/bin/env node

/**
* Records the reference's workspace-query optimum (CONVENTIONS W6; ticket
* 0103) into the committed cache data/fortran-lwkopt.json, which
* bin/workspace-optimum.mjs checks every wrapper's `null` allocation against.
*
* For each d/z module whose spec has a workspace-length argument (LWORK,
* LRWORK, LIWORK, ...) and whose reference has a workspace query (it tests
* one of them for -1 or < 0, under whatever name: `LQUERY`, or dlaqr0's bare
* `LWORK.NE.-1`), this writes a Fortran driver from
* the spec, compiles it against the reference (all of LAPACK SRC and BLAS,
* built once into test/build/lwkopt/, with an XERBLA that returns instead of
* stopping; bin/lib/fortran-ref.mjs, shared with bin/gen-lwmin.mjs), and
* calls the routine with every workspace length = -1 over the
* grid of bin/lib/lwkopt.mjs (each dimension over a ladder crossing the
* blocking thresholds, each option over its letters). Arrays are zero-filled
* buffers; the only data a query reads is SELECT (dtrsen, dtgsen, dtgsna,
* dtrevc3 and their z twins count the selected eigenvalues), which the grid
* sweeps. A row is recorded only when INFO = 0: its arguments and the
* optimum each queried workspace returns in its first element (WORK(1),
* RWORK(1), IWORK(1)).
*
* Usage:
*   node bin/gen-lwkopt.mjs [<routine>...]   regenerate (needs gfortran and the
*                                            gitignored Fortran sources)
*   node bin/gen-lwkopt.mjs --check          CI: the cache covers every such
*                                            module and each entry's grid is the
*                                            one its current spec gives (reads
*                                            only the cache and the specs, T6)
*   --jobs <n>                               parallel compiles (default: CPUs)
*   --rebuild                                rebuild the reference library
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ROOT } from './lib/corpus.mjs';
import { GRID_VERSION, CACHE_FILE, specLib, grid, routineSet } from './lib/lwkopt.mjs';
import { SRC, run, pool, buildLibrary, hasQuery, literal, driver, compile, parseLine } from './lib/fortran-ref.mjs';

async function generate( r ) {
	const spec = specLib.load( r );
	const g = grid( spec );
	if ( g.error ) {
		throw new Error( r + ': cannot build its query grid: ' + g.error );
	}
	let source;
	try {
		source = driver( spec, g );
	} catch ( err ) {
		throw new Error( r + ': cannot write its driver: ' + err.message );
	}
	const bin = await compile( 'lwkopt', r, source );
	const dir = path.dirname( bin );
	const results = new Array( g.calls.length ).fill( null );
	const crashed = [];
	let at = 0;
	// A crash (a query that touches more than it should) loses only its own
	// call: the rest are rerun after it.
	while ( at < g.calls.length ) {
		const input = g.calls.slice( at ).map( ( row ) => row.map( literal ).join( ' ' ) ).join( '\n' ) + '\n';
		const res = await run( bin, [], { 'cwd': dir, 'input': input } );
		const lines = res.stdout.split( '\n' ).filter( ( l ) => l.trim() );
		lines.forEach( ( l, i ) => {
			const x = parseLine( l, g.queries.length );
			results[ at + i ] = x && { 'info': x.info, 'opt': x.out };
		});
		at += lines.length;
		if ( at < g.calls.length ) {
			crashed.push( at );
			at += 1;
		}
	}
	const rows = [];
	let rejected = 0;
	results.forEach( ( x, i ) => {
		if ( x && x.info === 0 ) {
			rows.push( g.calls[ i ].concat( x.opt ) );
		} else if ( x ) {
			rejected += 1;
		}
	});
	return {
		'entry': {
			'grid': g.hash,
			'ladder': g.ladder,
			'calls': g.calls.length,
			'rejected': rejected,
			'crashed': crashed.length,
			'args': g.args,
			'queries': g.queries,
			'rows': rows
		},
		'crashed': crashed.map( ( i ) => g.args.map( ( a, j ) => a + '=' + g.calls[ i ][ j ] ).join( ' ' ) )
	};
}


// CACHE //

// Deterministic, one row per line.
function serialize( cache ) {
	const out = [ '{' ];
	out.push( '\t"$comment": ' + JSON.stringify( cache.$comment ) + ',' );
	out.push( '\t"version": ' + cache.version + ',' );
	const obj = ( o ) => JSON.stringify( o, Object.keys( o ).sort() );
	out.push( '\t"noQuery": ' + JSON.stringify( cache.noQuery ) + ',' );
	out.push( '\t"skipped": ' + obj( cache.skipped ) + ',' );
	out.push( '\t"routines": {' );
	const names = Object.keys( cache.routines ).sort();
	names.forEach( ( r, k ) => {
		const e = cache.routines[ r ];
		out.push( '\t\t' + JSON.stringify( r ) + ': {' );
		[ 'grid', 'ladder', 'calls', 'rejected', 'crashed', 'args', 'queries' ].forEach( ( f ) => {
			out.push( '\t\t\t' + JSON.stringify( f ) + ': ' + JSON.stringify( e[ f ] ) + ',' );
		});
		out.push( '\t\t\t"rows": [' );
		e.rows.forEach( ( row, i ) => out.push( '\t\t\t\t' + JSON.stringify( row ) + ( ( i < e.rows.length - 1 ) ? ',' : '' ) ) );
		out.push( '\t\t\t]' );
		out.push( '\t\t}' + ( ( k < names.length - 1 ) ? ',' : '' ) );
	});
	out.push( '\t}' );
	out.push( '}' );
	return out.join( '\n' ) + '\n';
}

const COMMENT = 'Generated by bin/gen-lwkopt.mjs from the reference workspace queries (LWORK = -1); read by bin/workspace-optimum.mjs (CONVENTIONS W6, ticket 0103). Per routine: `args` are Fortran argument names (options as Fortran letters; SELECT is the number of leading .TRUE. entries), `queries` the workspaces whose optimum each row ends with (WORK(1), RWORK(1), IWORK(1) as the query returns it); only calls returning INFO = 0 are rows. `noQuery`: modules with a workspace-length argument whose reference never tests it for -1 (or < 0), i.e. answers no workspace query. `skipped` is always empty: a routine the generator cannot sweep is an error.';

function readCache() {
	return fs.existsSync( CACHE_FILE ) ? JSON.parse( fs.readFileSync( CACHE_FILE, 'utf8' ) ) : null;
}

function check() {
	const cache = readCache();
	const problems = [];
	if ( !cache ) {
		console.error( 'gen-lwkopt --check: missing ' + path.relative( ROOT, CACHE_FILE ) + '; run node bin/gen-lwkopt.mjs' );
		return 1;
	}
	if ( cache.version !== GRID_VERSION ) {
		problems.push( 'cache version ' + cache.version + ' != grid version ' + GRID_VERSION );
	}
	const known = new Set( Object.keys( cache.routines ).concat( cache.noQuery, Object.keys( cache.skipped ) ) );
	routineSet().forEach( ( r ) => {
		if ( !known.has( r ) ) {
			problems.push( r + ': module with a workspace-length argument not in the cache' );
		}
	});
	Object.keys( cache.routines ).forEach( ( r ) => {
		const spec = specLib.load( r );
		if ( !spec ) {
			problems.push( r + ': cached, but spec/' + r + '.json is gone' );
			return;
		}
		const g = grid( spec );
		if ( g.error ) {
			problems.push( r + ': ' + g.error );
		} else if ( g.hash !== cache.routines[ r ].grid ) {
			problems.push( r + ': stale (the grid its spec gives has changed)' );
		}
	});
	// Every routine with a query is swept: a skipped one would go unchecked.
	Object.keys( cache.skipped ).forEach( ( r ) => {
		problems.push( r + ': skipped as "' + cache.skipped[ r ] + '"; every routine with a workspace query must be swept' );
	});
	problems.forEach( ( p ) => console.log( 'gen-lwkopt --check: ' + p ) );
	if ( problems.length ) {
		console.log( 'regenerate with node bin/gen-lwkopt.mjs (needs gfortran and the Fortran sources)' );
		return 1;
	}
	console.log( 'gen-lwkopt --check: ' + Object.keys( cache.routines ).length + ' routines up to date' );
	return 0;
}

async function main( argv ) {
	if ( argv.includes( '--check' ) ) {
		process.exitCode = check();
		return;
	}
	if ( !fs.existsSync( SRC ) ) {
		console.error( 'gen-lwkopt: needs the Fortran sources (bin/fetch-reference.sh)' );
		process.exitCode = 2;
		return;
	}
	const ji = argv.indexOf( '--jobs' );
	const jobs = ( ji >= 0 ) ? Math.max( 1, Number( argv[ ji + 1 ] ) ) : Math.max( 1, os.availableParallelism() );
	const only = argv.filter( ( a, i ) => !a.startsWith( '--' ) && argv[ i - 1 ] !== '--jobs' );
	await buildLibrary( jobs, argv.includes( '--rebuild' ), 'gen-lwkopt' );
	const prev = readCache();
	const cache = ( prev && only.length ) ? prev : { 'routines': {}, 'noQuery': [], 'skipped': {} };
	cache.$comment = COMMENT;
	cache.version = GRID_VERSION;
	const all = routineSet();
	const todo = [];
	( only.length ? only : all ).forEach( ( r ) => {
		delete cache.routines[ r ];
		delete cache.skipped[ r ];
		cache.noQuery = cache.noQuery.filter( ( x ) => x !== r );
		const q = hasQuery( r, specLib.load( r ) );
		if ( q === false ) {
			cache.noQuery.push( r );
		} else if ( q === null ) {
			throw new Error( r + ': has a workspace-length argument but no reference source to query' );
		} else {
			todo.push( r );
		}
	});
	cache.noQuery.sort();
	let done = 0;
	const res = await pool( todo, jobs, async ( r ) => {
		const x = await generate( r );
		done += 1;
		if ( process.stderr.isTTY ) {
			process.stderr.write( '\rgen-lwkopt: ' + done + '/' + todo.length + '   ' );
		}
		return x;
	});
	if ( process.stderr.isTTY ) {
		process.stderr.write( '\n' );
	}
	res.forEach( ( x, i ) => {
		const r = todo[ i ];
		if ( !x.entry.rows.length ) {
			throw new Error( r + ': no grid call returned INFO = 0 (' + x.entry.calls + ' calls); widen its grid' );
		}
		cache.routines[ r ] = x.entry;
		x.crashed.forEach( ( c ) => console.log( 'crashed   ' + r + ': ' + c ) );
	});
	fs.writeFileSync( CACHE_FILE, serialize( cache ) );
	const n = Object.values( cache.routines ).reduce( ( a, e ) => a + e.rows.length, 0 );
	console.log( 'gen-lwkopt: ' + Object.keys( cache.routines ).length + ' routines, ' + n + ' rows; ' + cache.noQuery.length + ' without a query; ' + Object.keys( cache.skipped ).length + ' skipped -> ' + path.relative( ROOT, CACHE_FILE ) );
}

main( process.argv.slice( 2 ) );
