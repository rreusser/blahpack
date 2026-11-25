/**
* Wrapper replay (tickets 0065, 0068): every valid `ndarray.js` call a
* module's own tests make becomes a test of its `<routine>.js` wrapper.
*
* 1.  Record: the module's tests (except `test.replay.js`) run in a child
*     process with `test/harness/replay-record.mjs` preloaded, which records
*     the entry arguments of every `ndarray.js` call that returns normally.
* 2.  Map: `lint/lib/spec.cjs` projects the spec into both signatures
*     (`baseGroups`), so each `ndarray` argument group (matrix: A, s1, s2,
*     o; vector: x, s, o; workspace) maps onto its wrapper arguments
*     (A, LDA; x, stride; WORK). `order` comes from the matrix strides.
* 3.  Replay each sampled call through the wrapper:
*
*     -   `exact`: the recorded workspaces are passed. Every non-workspace
*         array and the return value must be BIT-IDENTICAL.
*     -   `null-work`: every workspace `null` (CONVENTIONS D5c). A routine may
*         size its blocking from the workspace it gets, so rounding-level
*         differences are recorded (`rounding`) but not failures; NaN, a
*         changed integer output or info, or a large difference fails.
*     -   `transposed`: a column-major call replayed in row-major, each
*         general matrix copied into row-major storage (unmapped padding NaN),
*         recorded workspaces passed. A col/row kernel switch legitimately
*         reorders arithmetic (test/harness/schemes.js pureAddrLayouts), so
*         this variant checks structure only: the same NaN pattern and return
*         value (integer outputs too may differ, by pivot ties). Numeric cross-order agreement is the
*         property harness's job (CONVENTIONS T7).
*     -   `min-work`: each workspace cut to the minimum `ndarray.js` itself
*         demands (read from the RangeError it throws for an empty
*         workspace), keeping the recorded leading elements. Results must
*         agree as for `null-work`: a declared minimum below what base.js
*         touches passes validation and then silently drops writes past the
*         end of the typed array (ticket 0096).
*     -   `zero-size`: for the first few calls, each dimension set to 0 in
*         turn; the wrapper and ndarray.js must agree (quick returns).
*     -   validation: for every top-level `if ( … ) { throw new E( … ) }` of
*         both forms (generated prologue checks and hand-written ones), a
*         recorded call with only one argument that statement names made
*         invalid, swept over the option values it names, must throw E.
*     -   length audit: the wrapper runs with its `stride2offset( n, stride )`
*         calls instrumented (test/harness/replay-offsets.mjs), giving the
*         length `n` it assumes for each vector. The call's actual extent is
*         measured by poisoning (a lower bound on the true length). A wrapper
*         length below it is a bug: with a negative stride the wrapper would
*         address the wrong elements. A wrapper length that differs from the
*         spec's is reported as a disagreement.
*
* A wrapper that throws on a call `ndarray` accepted is `rejected`, unless
* the recorded leading dimension is below the spec's row count (a storage
* the wrapper cannot express, e.g. a one-column matrix with LD 1).
*/

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import v8 from 'node:v8';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { testConcurrency } from '../../bin/lib/corpus.mjs';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as espree from 'espree';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex64Array from '@stdlib/array/complex64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex64 from '@stdlib/complex/float32/ctor/lib/index.js';

const require = createRequire( import.meta.url );
const specLib = require( '../../lint/lib/spec.cjs' );
const HERE = path.dirname( fileURLToPath( import.meta.url ) );
const RECORDER = path.join( HERE, 'replay-record.mjs' );
// REPLAY_MAX_CALLS raises the sample size (e.g. to replay every call).
const MAX_CALLS = Number( process.env.REPLAY_MAX_CALLS ) || 40;

// --- bounded calls ---------------------------------------------------------

// Every call the replay makes runs under a watchdog. A probe (a dimension set
// to 0, poisoned storage) can take an iterative routine outside its domain
// (dlasyf with nb = 0, dlarrb bisecting NaN), where it never returns. Without
// a bound one such call used up the module's whole timeout and the module
// reported nothing at all (ticket 0070). `vm`'s timeout interrupts any
// synchronous JavaScript, including module functions called from the script.
const VM_CONTEXT = vm.createContext( {} );
const VM_CALL = new vm.Script( '__fn( ...__args )' );
const MIN_BUDGET_MS = Number( process.env.REPLAY_CALL_MS ) || 2000;
let budgetMs = MIN_BUDGET_MS;

// The length audit's poisoned-storage trials get a tight budget: a timeout
// there only means "length unknown" (no finding), never a false finding,
// and an iterative routine fed NaN (dlarrb) can take most of a second per
// trial over hundreds of trials.
let probeMs = 100;

class CallTimeout extends Error {
	constructor( ms ) {
		super( 'did not return within ' + ms + ' ms' );
		this.name = 'CallTimeout';
	}
}

// Fortran SAVE state (dlacon, zlacon): a base.js that keeps it exports it as
// `SAVE`. Each call made from one recorded call starts from the state
// snapshotted before that record's first call, so ndarray.js and the wrapper
// see the same state (ticket 0074).
let SAVED = null;
let SAVED_AT = null;

function bounded( fn, args, ms ) {
	const limit = ms || budgetMs;
	if ( SAVED && SAVED_AT ) {
		Object.assign( SAVED, SAVED_AT );
	}
	VM_CONTEXT.__fn = fn;
	VM_CONTEXT.__args = args;
	try {
		return VM_CALL.runInContext( VM_CONTEXT, { 'timeout': limit } );
	} catch ( e ) {
		if ( e && e.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT' ) {
			throw new CallTimeout( limit );
		}
		throw e;
	} finally {
		VM_CONTEXT.__fn = null;
		VM_CONTEXT.__args = null;
	}
}
const SAME = Symbol( 'same-storage return' );

// --- argument encoding ---------------------------------------------------

// A recorded callback (replay-record.mjs) rebuilt from its source. One that
// cannot be rebuilt, or needs its closure, throws when called, so the call
// counts as rejected by ndarray.js and is skipped.
const CALLBACKS = new Map();
function callback( src ) {
	if ( !CALLBACKS.has( src ) ) {
		let fn;
		try {
			fn = ( 0, eval )( '(' + src + ')' ); // eslint-disable-line no-eval
		} catch ( e ) {
			fn = null;
		}
		CALLBACKS.set( src, ( typeof fn === 'function' ) ? fn : function unrebuildable() {
			throw new Error( 'recorded callback could not be rebuilt' );
		});
	}
	return CALLBACKS.get( src );
}

function decode( e ) {
	if ( 'v' in e ) {
		return e.v;
	}
	if ( e.f ) {
		return callback( e.f );
	}
	if ( e.o ) {
		const o = {};
		Object.keys( e.o ).forEach( ( k ) => {
			o[ k ] = decode( e.o[ k ] );
		});
		return o;
	}
	if ( e.c ) {
		const C = ( e.c === 'Complex128Array' ) ? Complex128Array : Complex64Array;
		return new C( e.d.slice() );
	}
	if ( e.z ) {
		return ( e.z === 'Complex128' ) ? new Complex128( e.re, e.im ) : new Complex64( e.re, e.im );
	}
	if ( e.t ) {
		return e.t.slice();
	}
	return e.a.map( decode );
}

function isComplexArray( x ) {
	const n = x && x.constructor && x.constructor.name;
	return n === 'Complex128Array' || n === 'Complex64Array';
}

function isArrayArg( x ) {
	return isComplexArray( x ) || ArrayBuffer.isView( x ) || Array.isArray( x );
}

// Flat real view of an array argument (complex: interleaved re/im).
function flat( x ) {
	if ( isComplexArray( x ) ) {
		const F = ( x.constructor.name === 'Complex128Array' ) ? Float64Array : Float32Array;
		return new F( x.buffer, x.byteOffset, x.length * 2 );
	}
	return x;
}

function isFloat( x ) {
	return isComplexArray( x ) || x instanceof Float64Array || x instanceof Float32Array;
}

function sameValues( a, b ) {
	if ( a.length !== b.length ) {
		return -2;
	}
	for ( let i = 0; i < a.length; i++ ) {
		if ( !Object.is( a[ i ], b[ i ] ) ) {
			return i;
		}
	}
	return -1;
}

function retEqual( a, b ) {
	if ( isArrayArg( a ) && isArrayArg( b ) ) {
		return sameValues( flat( a ), flat( b ) ) === -1;
	}
	if ( a && typeof a === 'object' && b && typeof b === 'object' ) {
		return JSON.stringify( a ) === JSON.stringify( b );
	}
	return Object.is( a, b );
}

// --- recording -----------------------------------------------------------

function record( dir, routine ) {
	const testDir = path.join( dir, 'test' );
	const files = fs.readdirSync( testDir ).filter( ( f ) => /^test.*\.js$/.test( f ) && f !== 'test.replay.js' ).map( ( f ) => path.join( testDir, f ) );
	const out = fs.mkdtempSync( path.join( os.tmpdir(), 'replay-' ) );
	const env = Object.assign( {}, process.env, {
		'NODE_OPTIONS': ( ( process.env.NODE_OPTIONS || '' ).replace( /--experimental-test-coverage/g, '' ) + ' --import=' + pathToFileURL( RECORDER ).href ).trim(),
		'REPLAY_TARGET': pathToFileURL( path.join( dir, 'lib', 'ndarray.js' ) ).href,
		'REPLAY_OUT': out
	});
	delete env.NODE_TEST_CONTEXT;
	spawnSync( process.execPath, [ '--test', ...testConcurrency(), '--test-reporter=dot', ...files ], { 'env': env, 'encoding': 'utf8', 'timeout': 600000 } );
	let recs = [];
	// Sorted by test file name (see replay-record.mjs): deterministic order.
	fs.readdirSync( out ).sort( ( a, b ) => a.replace( /\.\d+\.bin$/, '' ).localeCompare( b.replace( /\.\d+\.bin$/, '' ) ) ).forEach( ( f ) => {
		recs = recs.concat( v8.deserialize( fs.readFileSync( path.join( out, f ) ) ) );
	});
	fs.rmSync( out, { 'recursive': true, 'force': true } );
	return recs;
}

// Spread recorded calls over the whole set (the first ones are often trivial
// quick-return cases), capped at MAX_CALLS.
function sample( recs ) {
	if ( recs.length <= MAX_CALLS ) {
		return recs;
	}
	const out = [];
	for ( let i = 0; i < MAX_CALLS; i++ ) {
		out.push( recs[ Math.floor( i * recs.length / MAX_CALLS ) ] );
	}
	return out;
}

// --- mapping -------------------------------------------------------------

function paramNames( fn ) {
	const m = /^[^(]*\(([^)]*)\)/.exec( fn.toString() );
	return m ? m[ 1 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean ) : [];
}

// Index the base-signature argument positions of each spec group.
function layout( spec ) {
	let at = 0;
	return specLib.baseGroups( spec ).map( function each( g ) {
		const r = { 'param': g.param, 'names': g.names, 'at': at };
		at += g.names.length;
		return r;
	});
}

function kindOf( g ) {
	const p = g.param;
	if ( g.names.length === 4 ) {
		return 'matrix';
	}
	if ( g.names.length === 3 ) {
		if ( p.role === 'workspace' ) {
			return 'workspace';
		}
		if ( p.role === 'packed' && p.format === 'packed' ) {
			return 'packed';
		}
		return 'vector';
	}
	if ( g.names.length === 2 ) {
		return 'offsetScalar';
	}
	return 'plain';
}

// Storage order implied by the matrix strides of a call, or null.
function orderOf( groups, args ) {
	const mats = groups.filter( ( g ) => kindOf( g ) === 'matrix' );
	if ( !mats.length ) {
		return 'column-major';
	}
	if ( mats.every( ( g ) => args[ g.at + 1 ] === 1 && args[ g.at + 2 ] >= 1 ) ) {
		return 'column-major';
	}
	if ( mats.every( ( g ) => args[ g.at + 2 ] === 1 && args[ g.at + 1 ] >= 1 ) ) {
		return 'row-major';
	}
	return null;
}

// Build wrapper arguments that address the same storage as base-form `args`.
// `vecOverride[k]` replaces vector group k with { x, stride } (already laid
// out for the wrapper's own offset computation). Returns null if the call
// cannot be expressed through the wrapper.
function toWrapper( spec, groups, args, order, vecOverride, keepWork ) {
	const out = [];
	for ( let k = 0; k < groups.length; k++ ) {
		const g = groups[ k ];
		const a = args.slice( g.at, g.at + g.names.length );
		const kind = kindOf( g );
		// A recorded call may pass `null` for an array the routine does not
		// touch (ztgevc's VL when SIDE = 'right'); a caller of the wrapper
		// passes `null` there too, with the same LD or stride.
		if ( g.names.length > 1 && a[ 0 ] === null ) {
			if ( kind === 'matrix' ) {
				out.push( null, ( order === 'column-major' ) ? a[ 2 ] : a[ 1 ] );
			} else if ( kind === 'vector' ) {
				out.push( null, a[ 1 ] );
			} else {
				out.push( null );
			}
			continue;
		}
		if ( g.names.length > 1 && Array.isArray( a[ 0 ] ) ) {
			// A plain array (ztgevc's boolean SELECT) has no subarray view:
			// expressible only at offset 0.
			if ( kind !== 'vector' || a[ 2 ] !== 0 || a[ 1 ] < 0 ) {
				return null;
			}
			out.push( a[ 0 ], a[ 1 ] );
			continue;
		}
		if ( g.names.length > 1 && !( a[ 0 ] && typeof a[ 0 ].subarray === 'function' ) ) {
			return null;
		}
		switch ( kind ) {
		case 'matrix':
			if ( order === 'column-major' && a[ 1 ] !== 1 && a[ 2 ] !== 1 ) {
				return null;
			}
			out.push( a[ 0 ].subarray( a[ 3 ] ), ( order === 'column-major' ) ? a[ 2 ] : a[ 1 ] );
			break;
		case 'workspace':
			// `null` stands for scratch only. A workspace the routine reads
			// (intent in/inout: dseupd's WORKL holds dsaupd's state) keeps
			// the caller's contents in every variant (ticket 0082).
			if ( keepWork || g.param.intent !== 'out' ) {
				if ( a[ 1 ] !== 1 ) {
					return null;
				}
				out.push( a[ 0 ].subarray( a[ 2 ] ) );
			} else {
				out.push( null );
			}
			break;
		case 'packed':
			if ( a[ 1 ] !== 1 ) {
				return null;
			}
			out.push( a[ 0 ].subarray( a[ 2 ] ) );
			break;
		case 'vector':
			if ( vecOverride && vecOverride[ k ] ) {
				out.push( vecOverride[ k ].x, vecOverride[ k ].stride );
			} else if ( a[ 1 ] < 0 ) {
				return null;
			} else {
				out.push( a[ 0 ].subarray( a[ 2 ] ), a[ 1 ] );
			}
			break;
		case 'offsetScalar':
			out.push( a[ 0 ].subarray( a[ 1 ] ) );
			break;
		default:
			out.push( ...a );
		}
	}
	return specLib.takesOrder( spec ) ? [ order ].concat( out ) : out;
}

// --- comparison ----------------------------------------------------------

function snapshot( args, skip ) {
	return args.map( ( x, i ) => ( ( skip.has( i ) || !isArrayArg( x ) ) ? null : Array.from( flat( x ) ) ) );
}

// A routine that returns one of its array arguments (BLAS `daxpy` returns
// `y`) returns, through the wrapper, the view it was given. Compare those by
// underlying storage; their values are compared as arguments.
function sameStorageReturn( expArgs, expRet, actArgs, actRet ) {
	const i = expArgs.indexOf( expRet );
	return i >= 0 && actRet && actArgs[ i ] && actRet.buffer === actArgs[ i ].buffer;
}

function diff( exp, act, expRet, actRet, names ) {
	for ( let i = 0; i < exp.length; i++ ) {
		if ( exp[ i ] === null ) {
			continue;
		}
		const k = sameValues( exp[ i ], act[ i ] );
		if ( k !== -1 ) {
			return names[ i ] + ( ( k >= 0 ) ? '[' + k + '] ' + act[ i ][ k ] + ' (expected ' + exp[ i ][ k ] + ')' : ' length differs' );
		}
	}
	if ( expRet !== SAME && !retEqual( expRet, actRet ) ) {
		return 'return value ' + JSON.stringify( actRet ) + ' (expected ' + JSON.stringify( expRet ) + ')';
	}
	return null;
}

// --- vector extent probing -----------------------------------------------

function poison( x, from, to ) {
	const f = flat( x );
	const k = isComplexArray( x ) ? 2 : 1;
	for ( let i = from * k; i < to * k && i < f.length; i++ ) {
		f[ i ] = NaN;
	}
}

function outputsExcept( args, ret, ai, upto ) {
	const parts = args.map( ( x, i ) => {
		if ( !isArrayArg( x ) ) {
			return [];
		}
		const f = Array.from( flat( x ) );
		return ( i === ai ) ? f.slice( 0, upto * ( isComplexArray( x ) ? 2 : 1 ) ) : f;
	});
	// A returned argument (BLAS `daxpy` returns `y`) is compared as that
	// argument, not again as a return value (it would include the poison).
	if ( !args.includes( ret ) ) {
		parts.push( isArrayArg( ret ) ? Array.from( flat( ret ) ) : [ ret ] );
	}
	return [].concat( ...parts );
}

// Highest element index of vector arg `ai` (stride > 0) that the call reads
// or writes, measured on fresh decoded copies. Returns -1 if unknown.
function touchedHigh( nd, rec, ai ) {
	const base = rec.map( decode );
	const before = Array.from( flat( base[ ai ] ) );
	let ret;
	try {
		ret = bounded( nd, base );
	} catch ( e ) {
		return -1;
	}
	const k = isComplexArray( base[ ai ] ) ? 2 : 1;
	const after = flat( base[ ai ] );
	let wrote = -1;
	for ( let i = 0; i < after.length; i++ ) {
		if ( !Object.is( before[ i ], after[ i ] ) ) {
			wrote = Math.floor( i / k );
		}
	}
	const len = base[ ai ].length;
	const ref = outputsExcept( base, ret, ai, len );
	const o = rec[ ai + 2 ].v;
	// Smallest T such that poisoning [T, len) leaves every output unchanged.
	let lo = o + 1;
	let hi = len;
	const unchanged = function unchanged( T ) {
		const a = rec.map( decode );
		poison( a[ ai ], T, len );
		let r;
		try {
			r = bounded( nd, a, probeMs );
		} catch ( e ) {
			if ( e instanceof CallTimeout ) {
				// Poisoned input the routine does not return from: every later
				// trial would cost a full budget too, so give up on this probe.
				throw e;
			}
			return false;
		}
		const out = outputsExcept( a, r, ai, T );
		const refT = outputsExcept( base, ret, ai, T );
		return sameValues( refT, out ) === -1 && ref.length >= 0;
	};
	try {
		if ( !unchanged( hi ) ) {
			return -1;
		}
		while ( lo < hi ) {
			const mid = ( lo + hi ) >> 1;
			if ( unchanged( mid ) ) {
				hi = mid;
			} else {
				lo = mid + 1;
			}
		}
	} catch ( e ) {
		if ( e instanceof CallTimeout ) {
			return -1;
		}
		throw e;
	}
	return Math.max( lo - 1, wrote, o );
}

// Compact description of a recorded call (scalars, array types/lengths).
function describe( rec, names ) {
	return rec.map( ( e, i ) => {
		let v;
		if ( 'v' in e ) {
			v = JSON.stringify( e.v );
		} else if ( e.c ) {
			v = e.c + '(' + ( e.d.length / 2 ) + ')';
		} else if ( e.z ) {
			v = e.z + '(' + e.re + ',' + e.im + ')';
		} else if ( e.t ) {
			v = e.t.constructor.name + '(' + e.t.length + ')' + ( ( e.t.length <= 6 ) ? '[' + Array.from( e.t ).join( ',' ) + ']' : '' );
		} else {
			v = 'Array(' + e.a.length + ')';
		}
		return names[ i ] + '=' + v;
	}).join( ' ' );
}

// --- spec expressions --------------------------------------------------

// Evaluate a spec `js` expression (`M`, `max(1,N)`, `min(M,N)`) with the
// call's scalar arguments; null if it cannot be evaluated.
function evalSpec( expr, names, args ) {
	if ( !expr || typeof expr !== 'string' ) {
		return null;
	}
	const env = {};
	names.forEach( ( n, i ) => {
		// Numbers and option strings (a flag-conditional length, ticket 0062).
		if ( typeof args[ i ] === 'number' || typeof args[ i ] === 'string' ) {
			env[ n ] = args[ i ];
			env[ n.toLowerCase() ] = args[ i ];
			env[ n.toUpperCase() ] = args[ i ];
		}
	});
	const fns = { 'max': Math.max, 'min': Math.min, 'abs': Math.abs, 'floor': Math.floor, 'ceil': Math.ceil };
	Object.keys( fns ).forEach( ( k ) => {
		env[ k ] = fns[ k ];
		env[ k.toUpperCase() ] = fns[ k ];
	});
	const keys = Object.keys( env );
	try {
		const v = Function( ...keys, '"use strict"; return (' + expr + ');' )( ...keys.map( ( k ) => env[ k ] ) );
		return ( typeof v === 'number' && Number.isFinite( v ) ) ? v : null;
	} catch ( e ) {
		return null;
	}
}

// --- comparison with tolerance (null-work) -------------------------------

function classifyDiff( exp, act, intArgs, structural ) {
	let worst = 0;
	let tolerated = false;
	for ( let i = 0; i < exp.length; i++ ) {
		const e = exp[ i ];
		const a = act[ i ];
		if ( e === null ) {
			continue;
		}
		if ( a.length !== e.length ) {
			return 'fail: argument ' + i + ' length';
		}
		let scale = 0;
		for ( let k = 0; k < e.length; k++ ) {
			if ( Number.isFinite( e[ k ] ) ) {
				scale = Math.max( scale, Math.abs( e[ k ] ) );
			}
		}
		// Arrays of error-estimate magnitude (FERR/BERR-like: every value
		// below 1e-10) are bounds from an iterative estimator; reordered
		// arithmetic legitimately moves them, so they agree within a factor 2.
		const estimate = scale < 1e-10;
		for ( let k = 0; k < e.length; k++ ) {
			if ( Object.is( e[ k ], a[ k ] ) ) {
				continue;
			}
			// Integer outputs (pivots, counts) must match exactly.
			if ( !Number.isFinite( e[ k ] ) || !Number.isFinite( a[ k ] ) || ( intArgs && intArgs.has( i ) ) ) {
				return 'fail: argument ' + i + '[' + k + '] ' + a[ k ] + ' vs ' + e[ k ];
			}
			if ( structural ) {
				// Finite against finite: rounding for this variant.
				tolerated = true;
				continue;
			}
			if ( estimate ) {
				const r = Math.abs( a[ k ] ) / Math.max( Math.abs( e[ k ] ), 1e-300 );
				tolerated = true;
				// Within a factor 2, or both at the level of eps (a backward
				// error of exactly 0 against 3e-17).
				if ( !( r >= 0.5 && r <= 2 ) && Math.abs( a[ k ] - e[ k ] ) > 1e-14 ) {
					return 'fail: argument ' + i + '[' + k + '] estimate ' + a[ k ] + ' vs ' + e[ k ];
				}
				continue;
			}
			worst = Math.max( worst, Math.abs( e[ k ] - a[ k ] ) / Math.max( scale, 1e-300 ) );
		}
	}
	if ( worst === 0 ) {
		return tolerated ? 'rounding' : 'same';
	}
	return ( worst < 1e-10 ) ? 'rounding' : 'fail: relative difference ' + worst.toExponential( 2 );
}

// --- validation (generated prologue checks) -------------------------------

const VALIDATOR_PATHS = {
	'isLayout': '@stdlib/blas/base/assert/is-layout/lib/index.js',
	'isTransposeOperation': '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js',
	'isMatrixTriangle': '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js',
	'isOperationSide': '@stdlib/blas/base/assert/is-operation-side/lib/index.js',
	'isDiagonalType': '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js',
	'max': '@stdlib/math/base/special/fast/max/lib/index.js',
	'min': '@stdlib/math/base/special/fast/min/lib/index.js',
	'abs': '@stdlib/math/base/special/abs/lib/index.js',
	'trunc': '@stdlib/math/base/special/trunc/lib/index.js',
	'real': '@stdlib/complex/float64/real/lib/index.js',
	'imag': '@stdlib/complex/float64/imag/lib/index.js'
};
let VALIDATORS = null;

async function validators() {
	if ( !VALIDATORS ) {
		VALIDATORS = {};
		for ( const k of Object.keys( VALIDATOR_PATHS ) ) {
			VALIDATORS[ k ] = ( await import( VALIDATOR_PATHS[ k ] ) ).default;
		}
	}
	return VALIDATORS;
}

// Every default import of a module file (`import isInteger from '…'`), so
// a validation statement is evaluated with the helpers it actually calls
// (hand-written type checks use many stdlib asserts).
async function moduleImports( file ) {
	const out = {};
	const src = fs.readFileSync( file, 'utf8' );
	for ( const m of src.matchAll( /^import ([\w$]+) from '([^']+)';/gm ) ) {
		const spec = ( m[ 2 ].startsWith( '.' ) ) ? pathToFileURL( path.resolve( path.dirname( file ), m[ 2 ] ) ).href : m[ 2 ];
		try {
			out[ m[ 1 ] ] = ( await import( spec ) ).default;
		} catch ( e ) {
			// unavailable: checks that call it stay unevaluable
		}
	}
	// Module-level rebindings of an import (`const isInteger =
	// isInteger$cjs.isPrimitive;`).
	for ( const m of src.matchAll( /^const (\w+) = ([\w$]+)\.(\w+);/gm ) ) {
		if ( out[ m[ 2 ] ] && out[ m[ 2 ] ][ m[ 3 ] ] !== void 0 ) {
			out[ m[ 1 ] ] = out[ m[ 2 ] ][ m[ 3 ] ];
		}
	}
	return out;
}

function evalTest( test, names, args, fns, prelude ) {
	const keys = names.concat( Object.keys( fns ) );
	const vals = args.concat( Object.keys( fns ).map( ( k ) => fns[ k ] ) );
	try {
		return Boolean( Function( ...keys, '"use strict"; ' + ( prelude || '' ) + 'return (' + test + ');' )( ...vals ) );
	} catch ( e ) {
		return null;
	}
}

// The function's own validation statements: every top-level
// `if ( <cond> ) { throw new <Ctor>( ... ); }` in its body, as
// { test, ctor, src, idents } (covers hand-written checks the spec prologue
// does not generate, e.g. non-zero strides).
function codeChecks( fn ) {
	const src = '(' + fn.toString() + ')';
	let ast;
	try {
		ast = espree.parse( src, { 'ecmaVersion': 2022, 'range': true } );
	} catch ( e ) {
		return [];
	}
	const out = [];
	const text = ( n ) => src.slice( n.range[ 0 ], n.range[ 1 ] );
	// Walk a block: declarations and assignments become the prelude of later
	// checks; `if ( c ) { throw … }` is a check; `if ( c ) { … }` without an
	// else is walked with `c` as a guard on everything inside.
	( function walk( stmts, guard, prelude ) {
		stmts.forEach( function each( st ) {
			// Each prelude statement is independent: a local whose initializer
			// calls something unavailable here (`stride2offset`) stays
			// undefined instead of making every later check unevaluable.
			if ( st.type === 'VariableDeclaration' ) {
				st.declarations.forEach( ( d ) => {
					if ( d.id.type === 'Identifier' ) {
						prelude += 'var ' + d.id.name + ';' + ( d.init ? ' try { ' + d.id.name + ' = ' + text( d.init ) + '; } catch ( e ) {}' : '' ) + '\n';
					}
				});
				return;
			}
			if ( st.type === 'ExpressionStatement' && st.expression.type === 'AssignmentExpression' ) {
				prelude += 'try { ' + text( st ) + ' } catch ( e ) {}\n';
				return;
			}
			if ( st.type !== 'IfStatement' || st.alternate ) {
				return;
			}
			const c = st.consequent;
			const inner = ( c.type === 'BlockStatement' ) ? c.body : [ c ];
			const th = ( inner.length === 1 ) ? inner[ 0 ] : null;
			const cond = guard ? '( ' + guard + ' ) && ( ' + text( st.test ) + ' )' : text( st.test );
			if ( inner.some( ( x ) => x.type === 'ReturnStatement' ) ) {
				// An early return: later statements run only when it is not taken.
				guard = guard ? '( ' + guard + ' ) && !( ' + text( st.test ) + ' )' : '!( ' + text( st.test ) + ' )';
				return;
			}
			if ( th && th.type === 'ThrowStatement' && th.argument.type === 'NewExpression' && th.argument.callee.type === 'Identifier' ) {
				out.push( {
					'prelude': prelude,
					'test': cond,
					'ctor': th.argument.callee.name,
					'literals': [ ...text( st ).matchAll( /'([a-z][a-z-]*)'/g ) ].map( ( m ) => m[ 1 ] ),
					'idents': [ ...new Set( ( text( st ) + ' ' + ( guard || '' ) ).match( /[A-Za-z_]\w*/g ) || [] ) ]
				});
				return;
			}
			walk( inner, cond, prelude );
		});
	})( ast.body[ 0 ].expression.body.body, '', '' );
	return out;
}

// Candidate values that may violate a check on argument value `v`.
function candidates( v ) {
	if ( typeof v === 'string' ) {
		return [ '__invalid__' ];
	}
	// The last candidate of each kind has the wrong type, for hand-written
	// type checks (`!isNumber( lambda )`).
	if ( typeof v === 'number' ) {
		return [ -1, 0, v - 1, v + 1, 1, -2, ( 2 * v ) + 1, 1e6, '__invalid__' ];
	}
	if ( typeof v === 'boolean' ) {
		return [ '__invalid__' ];
	}
	if ( v && ( ArrayBuffer.isView( v ) || isComplexArray( v ) ) ) {
		return [ null, new v.constructor( 0 ), '__invalid__' ];
	}
	// An in/out option held in a one-element array (zposvx's `equed`).
	if ( Array.isArray( v ) && v.length && typeof v[ 0 ] === 'string' ) {
		return [ [ '__invalid__' ] ];
	}
	return [];
}

/**
* For each validation statement of one form, starting from `args` (a valid
* call in that form), find argument lists where ONLY this statement fires:
* one argument it names made invalid, swept over the values of every option
* argument it names (so branches inside its message are reached too). Call
* `fn` and require the statement's error type.
*
* @returns {Array} findings `{ check, detail }` (empty if all pass)
*/
function validate( fn, names, args, checks, fns, done, optionValues ) {
	const out = [];
	const orderIdx = names.indexOf( 'order' );
	checks.forEach( function each( c, ci ) {
		const params = names.map( ( n, i ) => i ).filter( ( i ) => c.idents.includes( names[ i ] ) );
		const flags = params.filter( ( i ) => typeof args[ i ] === 'string' && i !== orderIdx );
		// Option sweeps: one value set per mentioned option argument.
		let combos = [ {} ];
		flags.forEach( ( fi ) => {
			const vals = [ ...new Set( [ args[ fi ] ].concat( optionValues[ names[ fi ] ] || [], c.literals ) ) ];
			const next = [];
			combos.forEach( ( cb ) => vals.forEach( ( v ) => next.push( Object.assign( {}, cb, { [ fi ]: v } ) ) ) );
			combos = next.slice( 0, 16 );
		});
		// Also an unpinned attempt, so an option argument can itself be the
		// one made invalid.
		combos.unshift( {} );
		let failure = null;
		combos.forEach( function eachCombo( cb ) {
			for ( const target of params ) {
				const key = ci + ':' + target + ':' + JSON.stringify( cb );
				if ( done.has( key ) ) {
					return;
				}
				const orders = ( orderIdx >= 0 && orderIdx !== target && c.idents.includes( 'order' ) ) ? [ 'column-major', 'row-major' ] : [ null ];
				for ( const ord of orders ) {
					for ( const cand of candidates( args[ target ] ) ) {
						const trial = args.slice();
						Object.keys( cb ).forEach( ( k ) => {
							trial[ k ] = cb[ k ];
						});
						if ( Object.prototype.hasOwnProperty.call( cb, target ) ) {
							continue;
						}
						trial[ target ] = cand;
						if ( ord !== null ) {
							trial[ orderIdx ] = ord;
							names.forEach( ( n, i ) => {
								if ( i !== target && /^LD/i.test( n ) && typeof trial[ i ] === 'number' ) {
									trial[ i ] = 1e6;
								}
							});
						}
						if ( evalTest( c.test, names, trial, fns, c.prelude ) !== true ) {
							continue;
						}
						let earlier = false;
						for ( let k = 0; k < ci; k++ ) {
							if ( evalTest( checks[ k ].test, names, trial, fns, checks[ k ].prelude ) !== false ) {
								earlier = true;
								break;
							}
						}
						if ( earlier ) {
							continue;
						}
						let threw = null;
						try {
							bounded( fn, trial );
						} catch ( e ) {
							threw = e;
						}
						if ( threw && threw.constructor.name === c.ctor ) {
							done.add( key );
							done.add( 'check:' + ci );
							failure = null;
							return;
						}
						// The evaluation does not model every statement before the
						// check (a wrapper replaces `null` by an allocation), so
						// keep trying; report only if no candidate throws.
						failure = failure || { 'check': c.test, 'detail': ( threw ) ? 'threw ' + threw.constructor.name + ' (expected ' + c.ctor + '): ' + String( threw.message ).slice( 0, 120 ) : 'did not throw' };
					}
				}
			}
		});
		if ( failure && !done.has( 'check:' + ci ) ) {
			out.push( failure );
		}
	});
	return out;
}

// --- replay --------------------------------------------------------------

/**
* Replays a module's recorded ndarray calls through its wrapper. Must run in
* a process where test/harness/replay-offsets.mjs instruments the wrapper
* (see runReplay), or the length audit is skipped.
*
* @param {string} dir - module directory (lib/<pkg>/base/<routine>)
* @returns {Promise<Object>} report
*/
async function replayModule( dir, options ) {
	const opts = Object.assign( { 'probe': true, 'recs': null }, options );
	const routine = path.basename( dir );
	const report = { 'routine': routine, 'recorded': 0, 'replayed': 0, 'variants': 0, 'mismatches': [], 'rejected': [], 'lengths': [], 'rounding': 0, 'skipped': {} };
	const skip = function skipReason( why ) {
		report.skipped[ why ] = ( report.skipped[ why ] || 0 ) + 1;
	};
	const spec = specLib.load( routine );
	const wrapperFile = path.join( dir, 'lib', routine + '.js' );
	if ( !spec || !fs.existsSync( wrapperFile ) ) {
		report.unmapped = 'no spec or no wrapper';
		return report;
	}
	const nd = ( await import( pathToFileURL( path.join( dir, 'lib', 'ndarray.js' ) ).href ) ).default;
	const baseNs = await import( pathToFileURL( path.join( dir, 'lib', 'base.js' ) ).href );
	SAVED = ( baseNs.SAVE && typeof baseNs.SAVE === 'object' ) ? baseNs.SAVE : null;
	SAVED_AT = null;
	const wrapper = ( await import( pathToFileURL( wrapperFile ).href ) ).default;
	const want = specLib.strided( spec ).map( ( s ) => s.toLowerCase() );
	const have = paramNames( wrapper ).map( ( s ) => s.toLowerCase() );
	if ( want.join( ',' ) !== have.join( ',' ) ) {
		report.unmapped = 'wrapper parameters (' + have.join( ', ' ) + ') differ from the spec projection (' + want.join( ', ' ) + ')';
		return report;
	}
	const groups = layout( spec );
	const baseNames = specLib.base( spec );
	const workspaceIdx = new Set();
	groups.forEach( ( g ) => {
		if ( kindOf( g ) === 'workspace' ) {
			workspaceIdx.add( g.at );
		}
	});
	const lens = globalThis.__replayLens;
	const ndNames = paramNames( nd );
	const wNames = paramNames( wrapper );
	const ndImports = await moduleImports( path.join( dir, 'lib', 'ndarray.js' ) );
	const wImports = await moduleImports( wrapperFile );
	const ndChecks = codeChecks( nd );
	const wChecks = codeChecks( wrapper );
	// Every option value any recorded call used, by parameter name.
	const optionValues = {};
	const ndDone = new Set();
	const wDone = new Set();
	const valFindings = [];
	const probed = {};
	const recs = opts.recs || record( dir, routine );
	report.recorded = recs.length;
	recs.forEach( ( rec ) => rec.forEach( ( e, i ) => {
		if ( e && typeof e.v === 'string' && baseNames[ i ] ) {
			( optionValues[ baseNames[ i ] ] = optionValues[ baseNames[ i ] ] || new Set() ).add( e.v );
		}
	}));
	Object.keys( optionValues ).forEach( ( k ) => {
		optionValues[ k ] = [ ...optionValues[ k ] ];
	});
	for ( const rec of sample( recs ) ) {
		if ( rec.length !== baseNames.length ) {
			skip( 'argument count differs from the spec' );
			continue;
		}
		const expArgs = rec.map( decode );
		let expRet;
		SAVED_AT = SAVED ? Object.assign( {}, SAVED ) : null;
		// The recorded call's own time sets the budget of every call made
		// from it (min MIN_BUDGET_MS).
		budgetMs = 60000;
		const t0 = Date.now();
		try {
			expRet = bounded( nd, expArgs );
		} catch ( e ) {
			skip( ( e instanceof CallTimeout ) ? 'ndarray did not return on replay' : 'ndarray threw on replay' );
			continue;
		}
		budgetMs = Math.max( MIN_BUDGET_MS, 50 * ( Date.now() - t0 ) );
		probeMs = Math.max( 100, 10 * ( Date.now() - t0 ) );
		const exp = snapshot( expArgs, workspaceIdx );
		const intIdx = new Set( expArgs.map( ( x, i ) => ( ( x instanceof Int32Array || x instanceof Int8Array || x instanceof Int16Array || x instanceof Uint8Array || x instanceof Uint32Array || Array.isArray( x ) ) ? i : -1 ) ).filter( ( i ) => i >= 0 ) );
		const order = orderOf( groups, rec.map( decode ) );
		if ( order === null ) {
			skip( 'matrix strides fit neither storage order' );
			continue;
		}
		report.replayed += 1;
		const plain = rec.map( decode );

		// Rejection is only meaningful if every recorded LD covers the spec's rows.
		const ldCoversRows = groups.filter( ( g ) => kindOf( g ) === 'matrix' ).every( ( g ) => {
			const rows = evalSpec( g.param.rows && g.param.rows.js, baseNames, plain );
			const ld = ( order === 'column-major' ) ? plain[ g.at + 2 ] : plain[ g.at + 1 ];
			const cols = evalSpec( g.param.cols && g.param.cols.js, baseNames, plain );
			const need = ( order === 'column-major' ) ? rows : cols;
			return need === null || ld >= Math.max( 1, need );
		});
		const run = function run( variant, keepWork ) {
			const actArgs = rec.map( decode );
			const wargs = toWrapper( spec, groups, actArgs, order, null, keepWork );
			if ( wargs === null ) {
				skip( 'call not expressible through the wrapper (' + variant + ')' );
				return null;
			}
			report.variants += 1;
			if ( lens ) {
				lens.length = 0;
			}
			let actRet;
			try {
				actRet = bounded( wrapper, wargs );
			} catch ( e ) {
				if ( ldCoversRows ) {
					report.rejected.push( { 'variant': variant + ' ' + order, 'detail': String( e.message ).slice( 0, 200 ) } );
				} else {
					skip( 'recorded LD below the spec row count' );
				}
				return null;
			}
			const er = sameStorageReturn( expArgs, expRet, actArgs, actRet ) ? SAME : expRet;
			return { 'act': snapshot( actArgs, workspaceIdx ), 'args': actArgs, 'ret': actRet, 'er': er, 'lens': lens ? lens.slice() : [] };
		};

		// exact: recorded workspaces, bit-identical.
		const ex = run( 'exact', true );
		if ( ex ) {
			const d = diff( exp, ex.act, ex.er, ex.ret, baseNames );
			if ( d ) {
				report.mismatches.push( { 'variant': 'exact ' + order, 'detail': d, 'call': describe( rec, baseNames ) } );
			}
		}

		// null-work: workspaces allocated by the wrapper. A routine may choose
		// its algorithm by workspace size (dgelss's paths), so when the wrapper's
		// allocation sizes are known (instrumented run), the expected result is
		// ndarray.js given workspaces of exactly those sizes.
		if ( workspaceIdx.size ) {
			const allocs = globalThis.__replayAllocs;
			if ( allocs ) {
				allocs.length = 0;
			}
			const nw = run( 'null-work', false );
			let nwExp = exp;
			let nwExpRet = expRet;
			let nwExpArgs = expArgs;
			if ( nw && allocs && allocs.length ) {
				const sized = rec.map( decode );
				let ok = true;
				groups.forEach( ( g ) => {
					if ( kindOf( g ) !== 'workspace' ) {
						return;
					}
					const hit = allocs.find( ( a ) => a.name.toLowerCase() === g.param.name.toLowerCase() );
					if ( hit ) {
						// The recorded call may have passed `null` (ztgsyl): use the
						// wrapper's own array type.
						sized[ g.at ] = new hit.ctor( hit.length );
						sized[ g.at + 1 ] = 1;
						sized[ g.at + 2 ] = 0;
					}
				});
				try {
					nwExpRet = bounded( nd, sized );
				} catch ( e ) {
					ok = false;
				}
				if ( ok ) {
					nwExp = snapshot( sized, workspaceIdx );
					nwExpArgs = sized;
				}
			}
			if ( nw ) {
				const nwEr = ( nwExpArgs !== expArgs && sameStorageReturn( nwExpArgs, nwExpRet, nw.args, nw.ret ) ) ? SAME : ( ( nwExpArgs === expArgs ) ? nw.er : nwExpRet );
				const d = diff( nwExp, nw.act, nwEr, nw.ret, baseNames );
				if ( d ) {
					const retOk = ( nwEr === SAME ) || ( nw.er === SAME ) || retEqual( nwExpRet, nw.ret ) || ( typeof nwExpRet === 'object' && typeof nw.ret === 'object' );
					const cls = retOk ? classifyDiff( nwExp, nw.act, intIdx ) : 'fail';
					if ( cls === 'rounding' ) {
						report.rounding += 1;
					} else {
						report.mismatches.push( { 'variant': 'null-work ' + order, 'detail': d + ' [' + cls + ']', 'call': describe( rec, baseNames ) } );
					}
				}
			}
		}

		// min-work: each workspace cut to the minimum ndarray.js itself
		// demands (ticket 0096). The minimum is read from the RangeError
		// ndarray.js throws for an empty workspace; the call is replayed with
		// the recorded workspace's leading `min` elements (a workspace can
		// carry state: ARPACK's workd/workl, ticket 0082). Results must agree
		// as for `null-work`: a minimum too small for what base.js touches
		// silently drops writes past the end of the typed array.
		groups.forEach( ( g ) => {
			if ( kindOf( g ) !== 'workspace' ) {
				return;
			}
			const W = expArgs[ g.at ];
			if ( !W || typeof W.length !== 'number' || typeof expArgs[ g.at + 2 ] !== 'number' || expArgs[ g.at + 1 ] !== 1 ) {
				return;
			}
			const have = W.length - expArgs[ g.at + 2 ];
			const probe = rec.map( decode );
			probe[ g.at ] = new W.constructor( 0 );
			probe[ g.at + 2 ] = 0;
			let min = null;
			try {
				bounded( nd, probe );
			} catch ( e ) {
				const m = /\b(\w+) array must have at least (\d+) elements/.exec( String( e && e.message ) );
				if ( e instanceof RangeError && m && m[ 1 ].toLowerCase() === g.param.name.toLowerCase() ) {
					min = Number( m[ 2 ] );
				}
			}
			if ( min === null || min >= have ) {
				return;
			}
			const mArgs = rec.map( decode );
			const src = mArgs[ g.at ];
			const o = mArgs[ g.at + 2 ];
			mArgs[ g.at ] = isComplexArray( src ) ? new src.constructor( flat( src ).slice( 2 * o, 2 * ( o + min ) ) ) : src.slice( o, o + min );
			mArgs[ g.at + 2 ] = 0;
			report.variants += 1;
			let mRet;
			try {
				mRet = bounded( nd, mArgs );
			} catch ( e ) {
				report.mismatches.push( { 'variant': 'min-work ' + g.param.name + '=' + min, 'detail': 'ndarray.js rejected its own minimum: ' + String( e.message ).slice( 0, 160 ), 'call': describe( rec, baseNames ) } );
				return;
			}
			const mAct = snapshot( mArgs, workspaceIdx );
			const mEr = sameStorageReturn( expArgs, expRet, mArgs, mRet ) ? SAME : expRet;
			const d = diff( exp, mAct, mEr, mRet, baseNames );
			if ( d ) {
				const retOk = ( mEr === SAME ) || retEqual( expRet, mRet ) || ( typeof expRet === 'object' && typeof mRet === 'object' );
				const cls = retOk ? classifyDiff( exp, mAct, intIdx ) : 'fail';
				if ( cls === 'rounding' ) {
					report.rounding += 1;
				} else {
					report.mismatches.push( { 'variant': 'min-work ' + g.param.name + '=' + min + ' (of ' + have + ')', 'detail': d + ' [' + cls + ']', 'call': describe( rec, baseNames ) } );
				}
			}
		});

		// transposed: a column-major call replayed in row-major, every general
		// matrix copied into row-major storage (exercises the wrapper's other
		// `order` branch). Bit-identical: base sees the same logical matrices.
		const mats = groups.filter( ( g ) => kindOf( g ) === 'matrix' );
		// Like `exact`, only calls whose recorded LDs cover the spec's rows can
		// be expressed through the wrapper (a 3-by-1 C recorded with LD 1 cannot).
		if ( ldCoversRows && order === 'column-major' && mats.length && mats.every( ( g ) => g.param.role === 'matrix' ) ) {
			const tArgs = rec.map( decode );
			const shapes = [];
			mats.forEach( function eachMat( g ) {
				const A = tArgs[ g.at ];
				const ld = tArgs[ g.at + 2 ];
				const o = tArgs[ g.at + 3 ];
				// Columns: what the storage holds, but at least the spec's
				// column count (a zero-size call can hold fewer, yet a
				// row-major LD must still cover N).
				// The spec's column count can be flattened (dgemm's A is K-by-M
				// under transa; ticket 0062), and a wider row-major LD is always
				// valid, so also cover every dimension argument.
				const specCols = evalSpec( g.param.cols && g.param.cols.js, baseNames, plain );
				const dims = groups.filter( ( h ) => h.param.role === 'dim' && h.names.length === 1 ).map( ( h ) => plain[ h.at ] ).filter( ( v ) => typeof v === 'number' );
				const cols = Math.max( 1, Math.ceil( ( A.length - o ) / ld ), specCols || 0, ...dims );
				const R = new A.constructor( ld * cols );
				const c = isComplexArray( A ) ? 2 : 1;
				const fa = flat( A );
				const fr = flat( R );
				for ( let i = 0; i < ld; i++ ) {
					for ( let j = 0; j < cols; j++ ) {
						const src = o + i + ( j * ld );
						for ( let q = 0; q < c; q++ ) {
							// Padding no recorded element maps to is NaN, so
							// reading a wrong element is loud.
							fr[ ( ( ( i * cols ) + j ) * c ) + q ] = ( src < A.length ) ? fa[ ( src * c ) + q ] : NaN;
						}
					}
				}
				shapes.push( { 'g': g, 'ld': ld, 'cols': cols, 'o': o, 'R': R } );
				tArgs[ g.at ] = R;
				tArgs[ g.at + 1 ] = cols;
				tArgs[ g.at + 2 ] = 1;
				tArgs[ g.at + 3 ] = 0;
			});
			// Recorded workspaces, so only the layout differs (CONVENTIONS T7:
			// bit-exact across layouts); WORK = null is the null-work variant.
			const wt = toWrapper( spec, groups, tArgs, 'row-major', null, true );
			if ( wt ) {
				report.variants += 1;
				let tRet;
				let threw = null;
				try {
					tRet = bounded( wrapper, wt );
				} catch ( e ) {
					threw = e;
				}
				if ( threw ) {
					if ( ldCoversRows ) {
						report.rejected.push( { 'variant': 'transposed row-major', 'detail': String( threw.message ).slice( 0, 200 ) } );
					}
				} else {
					// Map each row-major matrix back into the recorded layout.
					const back = rec.map( decode );
					// Carry over every non-matrix argument (vector outputs etc.).
					// A group's arguments are `names.length` positions from
					// `at`; an LD group has none and shares its `at` with the
					// next group.
					groups.forEach( ( g ) => {
						if ( kindOf( g ) !== 'matrix' ) {
							for ( let q = 0; q < g.names.length; q++ ) {
								back[ g.at + q ] = tArgs[ g.at + q ];
							}
						}
					});
					shapes.forEach( function eachShape( sh ) {
						const A = back[ sh.g.at ];
						const c = isComplexArray( A ) ? 2 : 1;
						const fa = flat( A );
						const fr = flat( sh.R );
						for ( let i = 0; i < sh.ld; i++ ) {
							for ( let j = 0; j < sh.cols; j++ ) {
								const dst = sh.o + i + ( j * sh.ld );
								if ( dst < A.length ) {
									for ( let q = 0; q < c; q++ ) {
										fa[ ( dst * c ) + q ] = fr[ ( ( ( i * sh.cols ) + j ) * c ) + q ];
									}
								}
							}
						}
					});
					const act = snapshot( back, workspaceIdx );
					const d = diff( exp, act, SAME, tRet, baseNames );
					const retOk = isArrayArg( expRet ) || retEqual( expRet, tRet ) || ( typeof expRet === 'object' && typeof tRet === 'object' );
					if ( d || !retOk ) {
						// Integer outputs are not compared exactly here: with tied
						// pivot candidates, reordered arithmetic legitimately breaks
						// ties differently (zgeqp3's JPVT on a rank-deficient matrix
						// with equal column norms; zgemv's col/row forms).
						const cls = retOk ? classifyDiff( exp, act, null, true ) : 'fail';
						if ( cls === 'rounding' ) {
							report.rounding += 1;
						} else {
							report.mismatches.push( { 'variant': 'transposed row-major', 'detail': ( d || ( 'return value ' + JSON.stringify( tRet ) + ' (expected ' + JSON.stringify( expRet ) + ')' ) ) + ' [' + cls + ']', 'call': describe( rec, baseNames ) } );
						}
					}
				}
			}
		}

		// zero-size: each dimension set to 0 in turn (first few calls only);
		// the wrapper and ndarray.js must agree, including on quick returns.
		if ( ldCoversRows && report.replayed <= 4 ) {
			groups.forEach( function eachDim( g ) {
				if ( g.param.role !== 'dim' || g.names.length !== 1 || !( plain[ g.at ] > 0 ) ) {
					return;
				}
				const zArgs = rec.map( decode );
				zArgs[ g.at ] = 0;
				let zRet;
				let zThrew = null;
				try {
					zRet = bounded( nd, zArgs );
				} catch ( e ) {
					zThrew = e;
				}
				if ( zThrew instanceof CallTimeout ) {
					// The reference does not return: outside the routine's domain.
					skip( 'zero-size probe outside the domain (ndarray did not return)' );
					return;
				}
				const aArgs = rec.map( decode );
				aArgs[ g.at ] = 0;
				const w0 = toWrapper( spec, groups, aArgs, order, null, true );
				if ( !w0 ) {
					return;
				}
				report.variants += 1;
				let aRet;
				let aThrew = null;
				try {
					aRet = bounded( wrapper, w0 );
				} catch ( e ) {
					aThrew = e;
				}
				if ( zThrew || aThrew ) {
					if ( Boolean( zThrew ) !== Boolean( aThrew ) ) {
						report.mismatches.push( { 'variant': 'zero-size ' + g.param.name + ' = 0', 'detail': ( zThrew ? 'ndarray.js threw (' + zThrew.message.slice( 0, 80 ) + ') but the wrapper did not' : 'the wrapper threw (' + aThrew.message.slice( 0, 80 ) + ') but ndarray.js did not' ), 'call': describe( rec, baseNames ) } );
					}
					return;
				}
				const er = sameStorageReturn( zArgs, zRet, aArgs, aRet ) ? SAME : zRet;
				const d = diff( snapshot( zArgs, workspaceIdx ), snapshot( aArgs, workspaceIdx ), er, aRet, baseNames );
				if ( d ) {
					report.mismatches.push( { 'variant': 'zero-size ' + g.param.name + ' = 0', 'detail': d, 'call': describe( rec, baseNames ) } );
				}
			});
		}

		// validation: every generated prologue check of both forms must throw
		// its documented error when only its argument is made invalid.
		{
			const fns = Object.assign( {}, await validators(), ndImports );
			const wFns = Object.assign( {}, await validators(), wImports );
			const ndArgs = rec.map( decode );
			valFindings.push( ...validate( nd, ndNames, ndArgs, ndChecks, fns, ndDone, optionValues ).map( ( f ) => Object.assign( { 'form': 'ndarray' }, f ) ) );
			// Recorded workspaces (not null), so a workspace can be the
			// argument made invalid.
			const wArgs = toWrapper( spec, groups, rec.map( decode ), order, null, true ) || toWrapper( spec, groups, rec.map( decode ), order, null, false );
			if ( wArgs ) {
				valFindings.push( ...validate( wrapper, wNames, wArgs, wChecks, wFns, wDone, optionValues ).map( ( f ) => Object.assign( { 'form': 'wrapper' }, f ) ) );
			}
		}

		// length audit: the wrapper's assumed vector lengths vs the measured
		// extent (lower bound) and the spec.
		const used = ex ? ex.lens : [];
		groups.forEach( function eachGroup( g ) {
			if ( kindOf( g ) !== 'vector' ) {
				return;
			}
			const ai = g.at;
			const strideName = g.names[ 1 ];
			const hit = used.find( ( u ) => u.stride === strideName );
			if ( !hit ) {
				return;
			}
			const s = plain[ ai + 1 ];
			const nSpec = evalSpec( g.param.length && g.param.length.js, baseNames, plain );
			if ( nSpec !== null && nSpec !== hit.n ) {
				report.lengths.push( { 'kind': 'disagrees-with-spec', 'param': g.param.name, 'wrapper': hit.n, 'spec': nSpec } );
			}
			probed[ g.param.name ] = ( probed[ g.param.name ] || 0 ) + 1;
			if ( !opts.probe || !( s > 0 ) || !isFloat( plain[ ai ] ) || probed[ g.param.name ] > 6 ) {
				return;
			}
			const o = plain[ ai + 2 ];
			const high = touchedHigh( nd, rec, ai );
			if ( high < 0 || ( high - o ) % s !== 0 ) {
				return;
			}
			const nTouched = ( ( high - o ) / s ) + 1;
			if ( hit.n < nTouched && nTouched > 1 ) {
				report.lengths.push( { 'kind': 'shorter-than-touched', 'param': g.param.name, 'wrapper': hit.n, 'touched': nTouched } );
			}
		});
	}
	report.validation = valFindings;
	const reached = ( done, list ) => list.filter( ( c, i ) => done.has( 'check:' + i ) ).length;
	report.validationCovered = { 'ndarray': reached( ndDone, ndChecks ) + '/' + ndChecks.length, 'wrapper': reached( wDone, wChecks ) + '/' + wChecks.length };
	report.validationUnreached = ndChecks.filter( ( c, i ) => !ndDone.has( 'check:' + i ) ).map( ( c ) => 'ndarray: ' + c.test ).concat( wChecks.filter( ( c, i ) => !wDone.has( 'check:' + i ) ).map( ( c ) => 'wrapper: ' + c.test ) );
	return report;
}

/**
* Runs replayModule for one module in a child process with the wrapper's
* offsets instrumented and a timeout.
*
* @param {string} dir - module directory
* @param {number} [timeout=180000] - milliseconds
* @returns {Object} report
*/
function runReplay( dir, timeout ) {
	const env = Object.assign( {}, process.env, { 'REPLAY_WRAPPER': pathToFileURL( path.join( dir, 'lib', path.basename( dir ) + '.js' ) ).href } );
	delete env.NODE_TEST_CONTEXT;
	const res = spawnSync( process.execPath, [ '--import=' + pathToFileURL( path.join( HERE, 'replay-offsets.mjs' ) ).href, path.join( HERE, 'replay-run.mjs' ), dir ], { 'env': env, 'encoding': 'utf8', 'timeout': timeout || 180000, 'maxBuffer': 64 * 1024 * 1024 } );
	if ( res.error || res.status !== 0 ) {
		return { 'routine': path.basename( dir ), 'error': ( res.error && res.error.code === 'ETIMEDOUT' ) ? 'timed out' : ( 'exit ' + res.status + ': ' + String( res.stderr ).slice( -300 ) ), 'mismatches': [], 'rejected': [], 'lengths': [], 'variants': 0 };
	}
	return JSON.parse( res.stdout );
}

export { replayModule, runReplay };
