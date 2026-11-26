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
* stopping), and calls the routine with every workspace length = -1 over the
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
import { spawn, spawnSync } from 'node:child_process';
import { ROOT } from './lib/corpus.mjs';
import { GRID_VERSION, CACHE_FILE, specLib, grid, routineSet } from './lib/lwkopt.mjs';

const SRC = path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC' );
const INSTALL = path.join( ROOT, 'data', 'lapack-3.12.0', 'INSTALL' );
const BLAS = path.join( ROOT, 'data', 'BLAS-3.12.0' );
const BUILD = path.join( ROOT, 'test', 'build', 'lwkopt' );
const LIB = path.join( BUILD, 'libref.a' );

// Every Fortran array is one buffer of this many elements. A query touches
// only the first element of its workspaces (and reads SELECT and the
// diagonal blocks of A/T in the routines named above).
const BIG = 200000;

const FTYPE = {
	'float64': 'double precision',
	'complex128': 'complex*16',
	'int32': 'integer',
	'bool': 'logical',
	'string': 'character(len=1)'
};


// LIBRARY //

function run( cmd, args, opts ) {
	return new Promise( ( resolve ) => {
		const child = spawn( cmd, args, Object.assign( { 'stdio': [ 'pipe', 'pipe', 'pipe' ] }, opts ) );
		const out = [];
		const err = [];
		child.stdout.on( 'data', ( b ) => out.push( b ) );
		child.stderr.on( 'data', ( b ) => err.push( b ) );
		child.on( 'close', ( code ) => resolve( { 'code': code, 'stdout': Buffer.concat( out ).toString( 'utf8' ), 'stderr': Buffer.concat( err ).toString( 'utf8' ) } ) );
		if ( opts && opts.input !== void 0 ) {
			child.stdin.end( opts.input );
		} else {
			child.stdin.end();
		}
	});
}

async function pool( items, jobs, fn ) {
	const out = new Array( items.length );
	let next = 0;
	const slot = async () => {
		while ( next < items.length ) {
			const i = next;
			next += 1;
			out[ i ] = await fn( items[ i ], i );
		}
	};
	await Promise.all( Array.from( { 'length': Math.min( jobs, items.length ) || 1 }, slot ) );
	return out;
}

// All of LAPACK SRC (not DEPRECATED/VARIANTS), INSTALL's dlamch,
// droundup_lwork and ilaver, and BLAS, in one archive.
async function buildLibrary( jobs, rebuild ) {
	if ( fs.existsSync( LIB ) && !rebuild ) {
		return;
	}
	const obj = path.join( BUILD, 'obj' );
	fs.rmSync( obj, { 'recursive': true, 'force': true } );
	fs.mkdirSync( obj, { 'recursive': true } );
	const flags = [ '-O0', '-cpp', '-w', '-ffixed-line-length-none', '-fallow-argument-mismatch', '-I', obj, '-J', obj ];
	for ( const m of [ 'la_constants.f90', 'la_xisnan.F90' ] ) {
		const r = spawnSync( 'gfortran', flags.concat( [ '-c', path.join( SRC, m ), '-o', path.join( obj, 'm_' + m.replace( /\..*$/, '' ) + '.o' ) ] ), { 'encoding': 'utf8' } );
		if ( r.status !== 0 ) {
			throw new Error( 'gfortran ' + m + ': ' + r.stderr );
		}
	}
	const src = [];
	fs.readdirSync( SRC ).filter( ( f ) => /\.(f|f90|F|F90)$/.test( f ) && !/^la_(constants|xisnan)\./.test( f ) ).forEach( ( f ) => src.push( [ path.join( SRC, f ), 'l_' ] ) );
	[ 'dlamch.f', 'droundup_lwork.f', 'ilaver.f' ].forEach( ( f ) => src.push( [ path.join( INSTALL, f ), 'i_' ] ) );
	fs.readdirSync( BLAS ).filter( ( f ) => /\.(f|f90)$/.test( f ) ).forEach( ( f ) => src.push( [ path.join( BLAS, f ), 'b_' ] ) );
	process.stderr.write( 'gen-lwkopt: compiling ' + src.length + ' reference sources into ' + path.relative( ROOT, LIB ) + '\n' );
	const res = await pool( src, jobs, ( s ) => run( 'gfortran', flags.concat( [ '-c', s[ 0 ], '-o', path.join( obj, s[ 1 ] + path.basename( s[ 0 ] ).replace( /\.[^.]+$/, '' ) + '.o' ) ] ), { 'cwd': obj } ) );
	const bad = res.map( ( r, i ) => ( r.code === 0 ) ? null : src[ i ][ 0 ] + ': ' + r.stderr.slice( 0, 200 ) ).filter( Boolean );
	if ( bad.length ) {
		throw new Error( 'reference sources that did not compile:\n' + bad.join( '\n' ) );
	}
	const objs = fs.readdirSync( obj ).filter( ( f ) => f.endsWith( '.o' ) ).sort().map( ( f ) => path.join( obj, f ) );
	fs.rmSync( LIB, { 'force': true } );
	const ar = spawnSync( 'ar', [ 'rcs', LIB ].concat( objs ), { 'encoding': 'utf8' } );
	if ( ar.status !== 0 ) {
		throw new Error( 'ar: ' + ar.stderr );
	}
}


// DRIVER //

function v( F ) {
	return 'v_' + F.toLowerCase();
}

function literal( x ) {
	if ( typeof x === 'string' ) {
		return "'" + x + "'";
	}
	if ( typeof x === 'boolean' ) {
		return x ? 'T' : 'F';
	}
	if ( Number.isInteger( x ) ) {
		return String( x );
	}
	return x.toExponential( 17 ).replace( 'e', 'D' );
}

/**
* The driver for one routine: reads one call per line (the grid's `args`, in
* order), sets every workspace length to -1, calls the routine and prints
* INFO and the first element of each queried workspace.
*/
function driver( spec, g ) {
	const params = g.plan.params.slice().sort( ( a, b ) => a.p.position - b.p.position );
	const decl = [];
	const init = [];
	const reset = [];
	const callArgs = [];
	params.forEach( ( e ) => {
		const p = e.p;
		const name = v( p.fortran );
		const t = FTYPE[ p.dtype ];
		switch ( e.kind ) {
		case 'flag':
		case 'dim':
		case 'derived':
		case 'scalar':
		case 'ld':
		case 'info':
		case 'out':
			if ( !t ) {
				throw new Error( 'no Fortran type for ' + p.fortran + ' (' + p.dtype + ')' );
			}
			decl.push( t + ' :: ' + name );
			callArgs.push( name );
			break;
		case 'lwork':
			decl.push( 'integer :: ' + name );
			reset.push( name + ' = -1' );
			callArgs.push( name );
			break;
		case 'function':
			callArgs.push( 'selfn' );
			break;
		case 'select':
			decl.push( 'logical, allocatable :: ' + name + '(:)' );
			decl.push( 'integer :: n_' + p.fortran.toLowerCase() );
			init.push( 'allocate( ' + name + '( BIG ) )' );
			reset.push( name + ' = .false.' );
			reset.push( 'if ( n_' + p.fortran.toLowerCase() + ' > 0 ) ' + name + '( 1:n_' + p.fortran.toLowerCase() + ' ) = .true.' );
			callArgs.push( name );
			break;
		case 'array': {
			if ( !t ) {
				throw new Error( 'no Fortran type for array ' + p.fortran + ' (' + p.dtype + ')' );
			}
			decl.push( t + ', allocatable :: ' + name + '(:)' );
			const zero = ( p.dtype === 'bool' ) ? '.false.' : ( ( p.dtype === 'int32' ) ? '0' : '0.0d0' );
			init.push( 'allocate( ' + name + '( BIG ) )' );
			init.push( name + ' = ' + zero );
			if ( p.role === 'workspace' ) {
				reset.push( name + '( 1 ) = ' + zero );
			}
			callArgs.push( name );
			break;
		}
		default:
			throw new Error( 'unhandled kind ' + e.kind );
		}
	});
	const readList = g.args.map( ( F ) => {
		const e = params.find( ( x ) => x.p.fortran === F );
		return ( e.kind === 'select' ) ? 'n_' + F.toLowerCase() : v( F );
	});
	const outs = g.queries.map( ( W ) => 'dble( ' + v( W ) + '( 1 ) )' );
	const info = params.find( ( e ) => e.kind === 'info' );
	const wrap = ( s, ind ) => {
		// Free-form continuation keeps every line short.
		const parts = s.split( ', ' );
		const lines = [];
		let cur = ind;
		parts.forEach( ( x, i ) => {
			const piece = x + ( ( i < parts.length - 1 ) ? ', ' : '' );
			if ( cur.length + piece.length > 100 ) {
				lines.push( cur + '&' );
				cur = ind + '   & ';
			}
			cur += piece;
		});
		lines.push( cur );
		return lines.join( '\n' );
	};
	return [
		'! Generated by bin/gen-lwkopt.mjs: workspace queries of ' + spec.routine.toUpperCase() + '.',
		'subroutine xerbla( srname, info )',
		'  character(len=*) :: srname',
		'  integer :: info',
		'end subroutine xerbla',
		'logical function selfn()',
		'  selfn = .false.',
		'end function selfn',
		'program drv',
		'  implicit none',
		'  integer, parameter :: BIG = ' + BIG,
		'  integer :: ios',
		'  logical, external :: selfn',
		...decl.map( ( d ) => '  ' + d ),
		...init.map( ( d ) => '  ' + d ),
		'  do',
		wrap( 'read( *, *, iostat=ios ) ' + readList.join( ', ' ), '    ' ),
		'    if ( ios /= 0 ) exit',
		...reset.map( ( d ) => '    ' + d ),
		wrap( 'call ' + spec.routine.toUpperCase() + '( ' + callArgs.join( ', ' ) + ' )', '    ' ),
		// dlaqr2/3 have no INFO: every call is recorded (the grid gives only
		// values their callers pass).
		wrap( "write( *, '(I0,99(1X,ES26.17E3))' ) " + ( info ? v( info.p.fortran ) : '0' ) + ', ' + outs.join( ', ' ), '    ' ),
		'    flush( 6 )',
		'  end do',
		'end program drv',
		''
	].join( '\n' );
}

// Does the reference answer a workspace query? It tests one of its
// workspace-length arguments against -1 (`LWORK.EQ.-1`, `LWORK.NE.-1`,
// dlaqr0's spelling), or for being negative (`LWORK.LT.0`, dlamtsqr), in
// executable code, whatever it names the result (`LQUERY` or none).
function hasQuery( r, spec ) {
	const names = spec.params.filter( ( p ) => p.role === 'lwork' ).map( ( p ) => p.fortran );
	for ( const ext of [ '.f', '.f90', '.F', '.F90' ] ) {
		const f = path.join( SRC, r + ext );
		if ( fs.existsSync( f ) ) {
			const code = fs.readFileSync( f, 'utf8' ).split( '\n' ).filter( ( l ) => !/^[*cC!]/.test( l ) && !/^\s*!/.test( l ) ).join( '\n' );
			return names.some( ( L ) => new RegExp( '\\b' + L + '\\s*(\\.EQ\\.|\\.NE\\.|==|/=)\\s*\\(?\\s*-\\s*1\\b|\\b' + L + '\\s*(\\.LT\\.|<)\\s*0\\b', 'i' ).test( code ) );
		}
	}
	return null;
}

function parseLine( line, nq ) {
	const t = line.trim().split( /\s+/ );
	if ( t.length !== nq + 1 ) {
		return null;
	}
	return { 'info': Number( t[ 0 ] ), 'opt': t.slice( 1 ).map( ( x ) => Number( x.replace( /[dD]/, 'e' ) ) ) };
}

async function generate( r ) {
	const spec = specLib.load( r );
	const g = grid( spec );
	if ( g.error ) {
		throw new Error( r + ': cannot build its query grid: ' + g.error );
	}
	const dir = path.join( BUILD, r );
	fs.mkdirSync( dir, { 'recursive': true } );
	const f90 = path.join( dir, 'drv_' + r + '.f90' );
	const bin = path.join( dir, 'drv_' + r );
	try {
		fs.writeFileSync( f90, driver( spec, g ) );
	} catch ( err ) {
		throw new Error( r + ': cannot write its driver: ' + err.message );
	}
	const c = await run( 'gfortran', [ '-O0', '-w', '-ffree-line-length-none', '-fallow-argument-mismatch', '-o', bin, f90, LIB ], { 'cwd': dir } );
	if ( c.code !== 0 ) {
		throw new Error( r + ': its driver does not compile: ' + c.stderr.split( '\n' ).filter( Boolean ).slice( 0, 3 ).join( ' / ' ) );
	}
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
			results[ at + i ] = parseLine( l, g.queries.length );
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
	await buildLibrary( jobs, argv.includes( '--rebuild' ) );
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
