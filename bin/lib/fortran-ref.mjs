/**
* The reference side of the workspace generators (developer-time only: needs
* gfortran and the gitignored Fortran sources). Shared by bin/gen-lwkopt.mjs
* (the reference's LWORK = -1 optimum; ticket 0103) and bin/gen-lwmin.mjs
* (the reference's minimum, the smallest LWORK it does not reject with
* INFO = -k; ticket 0016).
*
* - `buildLibrary()`: all of LAPACK SRC (not DEPRECATED/VARIANTS), INSTALL's
*   dlamch, droundup_lwork and ilaver, and BLAS, in one archive
*   (test/build/lwkopt/libref.a, gitignored).
* - `driver( spec, g, probe )`: the Fortran driver for one routine over the
*   grid `g` of bin/lib/lwkopt.mjs. Without `probe` every workspace length is
*   -1 (a query); with `probe` each input line also carries the length of
*   every workspace (see `driver`).
* - `compile()`, `Session`: build a driver and talk to it a line at a time.
* - `run()`, `pool()`: child processes and a bounded promise pool.
*/

import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { ROOT } from './corpus.mjs';

const SRC = path.join( ROOT, 'data', 'lapack-3.12.0', 'SRC' );
const INSTALL = path.join( ROOT, 'data', 'lapack-3.12.0', 'INSTALL' );
const BLAS = path.join( ROOT, 'data', 'BLAS-3.12.0' );
const LIB_DIR = path.join( ROOT, 'test', 'build', 'lwkopt' );
const LIB = path.join( LIB_DIR, 'libref.a' );

// Every Fortran array is one buffer of this many elements. A query touches
// only the first element of its workspaces (and reads SELECT and the
// diagonal blocks of A/T in the routines that count selected eigenvalues);
// a probe call (gen-lwmin) runs the algorithm on at most the grid's
// dimensions, with workspace lengths up to the optimum (at most ~80k).
const BIG = 200000;

// What a probe fills a workspace with past the length it passes.
const SENTINEL = {
	'float64': '-7.7777777777777777d+300',
	'complex128': 'cmplx( -7.7777777777777777d+300, 7.7777777777777777d+300, kind=8 )',
	'int32': '-987654321'
};

const FTYPE = {
	'float64': 'double precision',
	'complex128': 'complex*16',
	'int32': 'integer',
	'bool': 'logical',
	'string': 'character(len=1)'
};

// PROCESSES //

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


// LIBRARY //

async function buildLibrary( jobs, rebuild, tool ) {
	if ( fs.existsSync( LIB ) && !rebuild ) {
		return;
	}
	const obj = path.join( LIB_DIR, 'obj' );
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
	process.stderr.write( tool + ': compiling ' + src.length + ' reference sources into ' + path.relative( ROOT, LIB ) + '\n' );
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

// The executable Fortran of a reference routine (comment lines dropped), or
// null when it has no source.
function sourceCode( r ) {
	for ( const ext of [ '.f', '.f90', '.F', '.F90' ] ) {
		const f = path.join( SRC, r + ext );
		if ( fs.existsSync( f ) ) {
			return fs.readFileSync( f, 'utf8' ).split( '\n' ).filter( ( l ) => !/^[*cC!]/.test( l ) && !/^\s*!/.test( l ) ).join( '\n' );
		}
	}
	return null;
}


// Does the reference answer a workspace query? It tests one of its
// workspace-length arguments against -1 (`LWORK.EQ.-1`, `LWORK.NE.-1`,
// dlaqr0's spelling), or for being negative (`LWORK.LT.0`, dlamtsqr), in
// executable code, whatever it names the result (`LQUERY` or none).
function hasQuery( r, spec ) {
	const names = spec.params.filter( ( p ) => p.role === 'lwork' ).map( ( p ) => p.fortran );
	const code = sourceCode( r );
	if ( code === null ) {
		return null;
	}
	return names.some( ( L ) => new RegExp( '\\b' + L + '\\s*(\\.EQ\\.|\\.NE\\.|==|/=)\\s*\\(?\\s*-\\s*1\\b|\\b' + L + '\\s*(\\.LT\\.|<)\\s*0\\b', 'i' ).test( code ) );
}


// DRIVER //

function fv( F ) {
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
* The driver for one routine. It reads one call per line: the grid's
* `args`, in order, and with `probe` then an extent `zext`, a data `seed`
* (0: zero data) and the value of
* every workspace-length argument (in the plan's order). Without `probe`
* every workspace length is -1 (a query).
*
* With `probe`, every non-workspace array is zeroed over its first `zext`
* elements before each call (the call overwrites its outputs, and the next
* call must see the same data), and with `seed` > 0 its real and complex
* ones are then filled with seeded random values in [-1, 1] (Park-Miller,
* from `seed`; IPIV is the identity, other integer inputs and SELECT are as
* read); before the call a line `D` gives the
* value of every `probe.declared` expression (a workspace's declared
* extent, e.g. RWORK( 8*N )), and a callee's XERBLA prints `C` and ends
* the process (see `xerbla` below).
*
* The line after a call: INFO, then the first element of each workspace
* named by a workspace-length argument (a query's answer), then (probe) for
* each of those workspaces the last element written past its length (0:
* none; see `after` below).
*/
function driver( spec, g, probe ) {
	const params = g.plan.params.slice().sort( ( a, b ) => a.p.position - b.p.position );
	const decl = [];
	const init = [];
	const reset = [];
	const callArgs = [];
	params.forEach( ( e ) => {
		const p = e.p;
		const name = fv( p.fortran );
		const t = FTYPE[ p.dtype ];
		switch ( e.kind ) {
		case 'flag':
		case 'dim':
		case 'derived':
		case 'scalar':
		case 'inc':
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
			if ( !probe ) {
				reset.push( name + ' = -1' );
			}
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
			} else if ( probe && p.fortran === 'IPIV' && p.intent !== 'out' ) {
				// A pivot vector read by the call (dgetri's, dsytri_3's IPIV)
				// is the identity: zeros index out of bounds.
				reset.push( 'do ii = 1, zext' );
				reset.push( '  ' + name + '( ii ) = ii' );
				reset.push( 'end do' );
			} else if ( probe ) {
				reset.push( name + '( 1:zext ) = ' + zero );
				// Seeded random data in [-1, 1] for the real and complex
				// inputs (zero data hides data-dependent extents: ranks 0).
				if ( p.dtype === 'float64' || p.dtype === 'complex128' ) {
					reset.push( 'if ( seed > 0 ) call fill_' + ( p.dtype === 'float64' ? 'd' : 'z' ) + '( ' + name + ', zext, state )' );
				}
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
		return ( e.kind === 'select' ) ? 'n_' + F.toLowerCase() : fv( F );
	});
	// The workspace-length arguments in the plan's order (g.queries names
	// their workspaces; dtrsna's LDWORK names none).
	const lworks = g.plan.params.filter( ( e ) => e.kind === 'lwork' ).map( ( e ) => e.p );
	if ( probe ) {
		decl.push( 'integer :: zext, ii, seed' );
		decl.push( 'integer(8) :: state' );
		readList.push( 'zext' );
		readList.push( 'seed' );
		lworks.forEach( ( L ) => readList.push( fv( L.fortran ) ) );
		reset.unshift( 'zext = max( 1, min( BIG, zext ) )', 'state = int( seed, 8 )' );
	}
	const outs = probe ?
		lworks.map( ( L ) => ( L.of ? 'dble( ' + fv( L.of ) + '( 1 ) )' : '0.0d0' ) ) :
		g.queries.map( ( W ) => 'dble( ' + fv( W ) + '( 1 ) )' );
	// A probe first prints `D` and each declared extent, for the arguments
	// as read (before the call can change an in/out one).
	// A probe fills each workspace named by a length argument past that
	// length L with a sentinel, and after the call reports the last element
	// that no longer holds it (0: nothing past L was written). Writes only:
	// a read past L leaves no trace.
	const after = [];
	if ( probe ) {
		reset.push( "write( *, '(A,99(1X,I0))' ) 'D'" + ( probe.declared || [] ).map( ( d ) => ', max( 0, ' + d.expr + ' )' ).join( '' ) );
		lworks.filter( ( L ) => L.of ).forEach( ( L, k ) => {
			const W = spec.params.find( ( q ) => q.fortran === L.of );
			const sent = SENTINEL[ W.dtype ];
			if ( !sent ) {
				throw new Error( 'no sentinel for workspace ' + W.fortran + ' (' + W.dtype + ')' );
			}
			decl.push( 'integer :: l_' + k + ', wx_' + k );
			reset.push( 'l_' + k + ' = ' + fv( L.fortran ) );
			reset.push( 'if ( l_' + k + ' >= 0 .and. l_' + k + ' < BIG ) ' + fv( W.fortran ) + '( l_' + k + '+1:BIG ) = ' + sent );
			after.push( 'wx_' + k + ' = 0' );
			after.push( 'if ( l_' + k + ' >= 0 ) then' );
			after.push( '  do ii = BIG, l_' + k + ' + 1, -1' );
			after.push( '    if ( ' + fv( W.fortran ) + '( ii ) /= ' + sent + ' ) then' );
			after.push( '      wx_' + k + ' = ii' );
			after.push( '      exit' );
			after.push( '    end if' );
			after.push( '  end do' );
			after.push( 'end if' );
			outs.push( 'dble( wx_' + k + ' )' );
		});
	}
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
	// A query's XERBLA returns. A probe's returns for the routine itself (it
	// then returns INFO = -k) and, for a callee (the routine accepted its
	// arguments and passed a callee less than it needs), prints `C` and
	// ends the process: the call was accepted, and what follows is not
	// the reference's algorithm.
	const xerbla = probe ? [
		'subroutine xerbla( srname, info )',
		'  character(len=*) :: srname',
		'  integer :: info, i, c',
		'  character(len=32) :: up',
		'  up = adjustl( srname )',
		'  do i = 1, len( up )',
		'    c = ichar( up( i:i ) )',
		"    if ( c >= ichar( 'a' ) .and. c <= ichar( 'z' ) ) up( i:i ) = char( c - 32 )",
		'  end do',
		"  if ( trim( up ) /= '" + spec.routine.toUpperCase() + "' ) then",
		"    write( *, '(A,1X,A,1X,I0)' ) 'C', trim( up ), info",
		'    flush( 6 )',
		'    call exit( 0 )',
		'  end if',
		'end subroutine xerbla'
	] : [
		'subroutine xerbla( srname, info )',
		'  character(len=*) :: srname',
		'  integer :: info',
		'end subroutine xerbla'
	];
	return [
		'! Generated by bin/' + ( probe ? 'gen-lwmin' : 'gen-lwkopt' ) + '.mjs: workspace ' + ( probe ? 'probes' : 'queries' ) + ' of ' + spec.routine.toUpperCase() + '.',
		...xerbla,
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
		...after.map( ( d ) => '    ' + d ),
		// dlaqr2/3 have no INFO: every call is recorded (the grid gives only
		// values their callers pass).
		wrap( "write( *, '(I0,99(1X,ES26.17E3))' ) " + ( info ? fv( info.p.fortran ) : '0' ) + ', ' + outs.join( ', ' ), '    ' ),
		'    flush( 6 )',
		'  end do',
		...( probe ? [
			'contains',
			// A Park-Miller generator: the same data on every platform.
			'  subroutine fill_d( a, n, st )',
			'    integer :: n, i',
			'    double precision :: a( * )',
			'    integer(8) :: st',
			'    do i = 1, n',
			'      st = mod( st * 16807_8, 2147483647_8 )',
			'      a( i ) = 2.0d0 * dble( st ) / 2147483647.0d0 - 1.0d0',
			'    end do',
			'  end subroutine fill_d',
			'  subroutine fill_z( a, n, st )',
			'    integer :: n, i',
			'    complex*16 :: a( * )',
			'    integer(8) :: st',
			'    double precision :: x, y',
			'    do i = 1, n',
			'      st = mod( st * 16807_8, 2147483647_8 )',
			'      x = 2.0d0 * dble( st ) / 2147483647.0d0 - 1.0d0',
			'      st = mod( st * 16807_8, 2147483647_8 )',
			'      y = 2.0d0 * dble( st ) / 2147483647.0d0 - 1.0d0',
			'      a( i ) = cmplx( x, y, kind=8 )',
			'    end do',
			'  end subroutine fill_z'
		] : [] ),
		'end program drv',
		''
	].join( '\n' );
}

/**
* Writes and compiles a driver into test/build/<tool>/<routine>/; returns the
* binary's path. Throws naming the routine on failure.
*/
async function compile( tool, r, source ) {
	const dir = path.join( ROOT, 'test', 'build', tool, r );
	fs.mkdirSync( dir, { 'recursive': true } );
	const f90 = path.join( dir, 'drv_' + r + '.f90' );
	const bin = path.join( dir, 'drv_' + r );
	fs.writeFileSync( f90, source );
	const c = await run( 'gfortran', [ '-O0', '-w', '-ffree-line-length-none', '-fallow-argument-mismatch', '-o', bin, f90, LIB ], { 'cwd': dir } );
	if ( c.code !== 0 ) {
		throw new Error( r + ': its driver does not compile: ' + c.stderr.split( '\n' ).filter( Boolean ).slice( 0, 3 ).join( ' / ' ) );
	}
	return bin;
}

function parseLine( line, n ) {
	const t = line.trim().split( /\s+/ );
	if ( t.length !== n + 1 ) {
		return null;
	}
	return { 'info': Number( t[ 0 ] ), 'out': t.slice( 1 ).map( ( x ) => Number( x.replace( /[dD]/, 'e' ) ) ) };
}

/**
* A running probe driver answering one call at a time. `await s.call( values )`
* gives { declared, info, out } (the call returned), { declared, callee }
* (a callee's XERBLA ended the process: the routine accepted the call), or
* { declared, crashed } (the process died or exceeded `timeout` ms after
* the call started). The next call after an exit starts a fresh process.
*/
class Session {
	constructor( bin, nout, timeout ) {
		this.bin = bin;
		this.nout = nout;
		this.timeout = timeout;
		this.child = null;
		this.starts = 0;
	}

	start() {
		const child = spawn( this.bin, [], { 'cwd': path.dirname( this.bin ), 'stdio': [ 'pipe', 'pipe', 'ignore' ] } );
		this.starts += 1;
		child.buf = '';
		child.onLine = null;
		child.onExit = null;
		child.dead = false;
		child.stdout.on( 'data', ( b ) => {
			child.buf += b.toString( 'utf8' );
			let nl = child.buf.indexOf( '\n' );
			while ( nl >= 0 ) {
				const line = child.buf.slice( 0, nl );
				child.buf = child.buf.slice( nl + 1 );
				if ( child.onLine ) {
					child.onLine( line );
				}
				nl = child.buf.indexOf( '\n' );
			}
		});
		child.on( 'close', ( code, sig ) => {
			child.dead = true;
			if ( child.onExit ) {
				child.onExit( 'driver exited (' + ( sig || code ) + ')' );
			}
		});
		child.stdin.on( 'error', () => {} );
		this.child = child;
	}

	call( values ) {
		if ( !this.child || this.child.dead ) {
			this.start();
		}
		const child = this.child;
		return new Promise( ( resolve ) => {
			let declared = null;
			let done = false;
			const finish = ( x ) => {
				if ( done ) {
					return;
				}
				done = true;
				clearTimeout( timer );
				child.onLine = null;
				child.onExit = null;
				resolve( Object.assign( { 'declared': declared }, x ) );
			};
			const timer = setTimeout( () => {
				child.dead = true;
				child.kill( 'SIGKILL' );
				finish( { 'crashed': 'timeout' } );
			}, this.timeout );
			child.onLine = ( line ) => {
				const t = line.trim();
				if ( t.startsWith( 'D' ) ) {
					declared = t.split( /\s+/ ).slice( 1 ).map( Number );
				} else if ( t.startsWith( 'C' ) ) {
					// The process is ending: the next call starts a new one.
					child.dead = true;
					finish( { 'callee': t.slice( 1 ).trim() } );
				} else {
					const p = parseLine( t, this.nout );
					finish( p || { 'crashed': 'unparsable output: ' + t.slice( 0, 80 ) } );
				}
			};
			child.onExit = ( why ) => finish( { 'crashed': why } );
			child.stdin.write( values.map( literal ).join( ' ' ) + '\n' );
		});
	}

	close() {
		if ( this.child && !this.child.dead ) {
			this.child.stdin.end();
		}
	}
}

export { SRC, LIB, BIG, run, pool, buildLibrary, sourceCode, hasQuery, literal, driver, compile, parseLine, Session };
