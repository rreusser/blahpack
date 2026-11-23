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
*         general matrix copied into row-major storage; workspaces `null`.
*         Same tolerance as `null-work`.
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
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex64Array from '@stdlib/array/complex64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex64 from '@stdlib/complex/float32/ctor/lib/index.js';

const require = createRequire( import.meta.url );
const specLib = require( '../../lint/lib/spec.cjs' );
const HERE = path.dirname( fileURLToPath( import.meta.url ) );
const RECORDER = path.join( HERE, 'replay-record.mjs' );
const MAX_CALLS = 40;
const SAME = Symbol( 'same-storage return' );

// --- argument encoding ---------------------------------------------------

function decode( e ) {
	if ( 'v' in e ) {
		return e.v;
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
	spawnSync( process.execPath, [ '--test', '--test-reporter=dot', ...files ], { 'env': env, 'encoding': 'utf8', 'timeout': 600000 } );
	let recs = [];
	fs.readdirSync( out ).forEach( ( f ) => {
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
		switch ( kindOf( g ) ) {
		case 'matrix':
			if ( order === 'column-major' && a[ 1 ] !== 1 && a[ 2 ] !== 1 ) {
				return null;
			}
			out.push( a[ 0 ].subarray( a[ 3 ] ), ( order === 'column-major' ) ? a[ 2 ] : a[ 1 ] );
			break;
		case 'workspace':
			if ( keepWork ) {
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
		ret = nd( ...base );
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
			r = nd( ...a );
		} catch ( e ) {
			return false;
		}
		const out = outputsExcept( a, r, ai, T );
		const refT = outputsExcept( base, ret, ai, T );
		return sameValues( refT, out ) === -1 && ref.length >= 0;
	};
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
		if ( typeof args[ i ] === 'number' ) {
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

function classifyDiff( exp, act ) {
	let worst = 0;
	for ( let i = 0; i < exp.length; i++ ) {
		const e = exp[ i ];
		const a = act[ i ];
		if ( e === null ) {
			continue;
		}
		if ( a.length !== e.length ) {
			return 'fail';
		}
		let scale = 0;
		for ( let k = 0; k < e.length; k++ ) {
			if ( Number.isFinite( e[ k ] ) ) {
				scale = Math.max( scale, Math.abs( e[ k ] ) );
			}
		}
		for ( let k = 0; k < e.length; k++ ) {
			if ( Object.is( e[ k ], a[ k ] ) ) {
				continue;
			}
			if ( !Number.isFinite( e[ k ] ) || !Number.isFinite( a[ k ] ) || Number.isInteger( e[ k ] ) !== Number.isInteger( a[ k ] ) ) {
				return 'fail';
			}
			worst = Math.max( worst, Math.abs( e[ k ] - a[ k ] ) / Math.max( scale, 1e-300 ) );
		}
	}
	if ( worst === 0 ) {
		return 'same';
	}
	return ( worst < 1e-10 ) ? 'rounding' : 'fail';
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
	const probed = {};
	const recs = opts.recs || record( dir, routine );
	report.recorded = recs.length;
	for ( const rec of sample( recs ) ) {
		if ( rec.length !== baseNames.length ) {
			skip( 'argument count differs from the spec' );
			continue;
		}
		const expArgs = rec.map( decode );
		let expRet;
		try {
			expRet = nd( ...expArgs );
		} catch ( e ) {
			skip( 'ndarray threw on replay' );
			continue;
		}
		const exp = snapshot( expArgs, workspaceIdx );
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
				actRet = wrapper( ...wargs );
			} catch ( e ) {
				if ( ldCoversRows ) {
					report.rejected.push( { 'variant': variant + ' ' + order, 'detail': String( e.message ).slice( 0, 200 ) } );
				} else {
					skip( 'recorded LD below the spec row count' );
				}
				return null;
			}
			const er = sameStorageReturn( expArgs, expRet, actArgs, actRet ) ? SAME : expRet;
			return { 'act': snapshot( actArgs, workspaceIdx ), 'ret': actRet, 'er': er, 'lens': lens ? lens.slice() : [] };
		};

		// exact: recorded workspaces, bit-identical.
		const ex = run( 'exact', true );
		if ( ex ) {
			const d = diff( exp, ex.act, ex.er, ex.ret, baseNames );
			if ( d ) {
				report.mismatches.push( { 'variant': 'exact ' + order, 'detail': d, 'call': describe( rec, baseNames ) } );
			}
		}

		// null-work: workspaces allocated by the wrapper.
		if ( workspaceIdx.size ) {
			const nw = run( 'null-work', false );
			if ( nw ) {
				const d = diff( exp, nw.act, nw.er, nw.ret, baseNames );
				if ( d ) {
					const retOk = ( nw.er === SAME ) || retEqual( expRet, nw.ret ) || ( typeof expRet === 'object' && typeof nw.ret === 'object' );
					const cls = retOk ? classifyDiff( exp, nw.act ) : 'fail';
					if ( cls === 'rounding' ) {
						report.rounding += 1;
					} else {
						report.mismatches.push( { 'variant': 'null-work ' + order, 'detail': d, 'call': describe( rec, baseNames ) } );
					}
				}
			}
		}

		// transposed: a column-major call replayed in row-major, every general
		// matrix copied into row-major storage (exercises the wrapper's other
		// `order` branch). Bit-identical: base sees the same logical matrices.
		const mats = groups.filter( ( g ) => kindOf( g ) === 'matrix' );
		if ( order === 'column-major' && mats.length && mats.every( ( g ) => g.param.role === 'matrix' ) ) {
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
							fr[ ( ( ( i * cols ) + j ) * c ) + q ] = ( src < A.length ) ? fa[ ( src * c ) + q ] : 0;
						}
					}
				}
				shapes.push( { 'g': g, 'ld': ld, 'cols': cols, 'o': o, 'R': R } );
				tArgs[ g.at ] = R;
				tArgs[ g.at + 1 ] = cols;
				tArgs[ g.at + 2 ] = 1;
				tArgs[ g.at + 3 ] = 0;
			});
			const wt = toWrapper( spec, groups, tArgs, 'row-major', null, false );
			if ( wt ) {
				report.variants += 1;
				let tRet;
				let threw = null;
				try {
					tRet = wrapper( ...wt );
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
						const cls = retOk ? classifyDiff( exp, act ) : 'fail';
						if ( cls === 'rounding' ) {
							report.rounding += 1;
						} else {
							report.mismatches.push( { 'variant': 'transposed row-major', 'detail': d || ( 'return value ' + JSON.stringify( tRet ) + ' (expected ' + JSON.stringify( expRet ) + ')' ), 'call': describe( rec, baseNames ) } );
						}
					}
				}
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
