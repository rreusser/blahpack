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
*     (A, LDA; x, stride; WORK).
* 3.  Replay each call through the wrapper and require BIT-IDENTICAL results
*     (every non-workspace array and the return value) in these variants:
*
*     -   `native`: same storage, `order` taken from the matrix strides, every
*         workspace `null` (the wrapper must allocate enough, CONVENTIONS D5c).
*     -   `negative-stride:<x>`: one vector at a time is rebuilt with a
*         negative stride. Its true length is measured (which elements the
*         call reads or writes), the expected result is `ndarray` with the
*         offset that length implies, and the wrapper must compute the same
*         offset itself. Unused storage is NaN, so a wrong offset is loud.
*     -   `transposed`: matrices copied into the other storage order.
*
* A wrapper that throws on a call `ndarray` accepted is reported as
* `rejected` (its validation is stricter than the routine's contract).
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
function toWrapper( spec, groups, args, order, vecOverride ) {
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
			out.push( null );
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
	parts.push( isArrayArg( ret ) ? Array.from( flat( ret ) ) : [ ret ] );
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

// --- replay --------------------------------------------------------------

/**
* Replays a module's recorded ndarray calls through its wrapper.
*
* @param {string} dir - module directory (lib/<pkg>/base/<routine>)
* @returns {Promise<Object>} report
*/
async function replayModule( dir ) {
	const routine = path.basename( dir );
	const report = { 'routine': routine, 'recorded': 0, 'replayed': 0, 'variants': 0, 'mismatches': [], 'rejected': [], 'skipped': {} };
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
	const nBase = specLib.base( spec ).length;
	const baseNames = specLib.base( spec );
	const workspaceIdx = new Set();
	groups.forEach( ( g ) => {
		if ( kindOf( g ) === 'workspace' ) {
			workspaceIdx.add( g.at );
		}
	});
	const recs = record( dir, routine );
	report.recorded = recs.length;
	for ( const rec of sample( recs ) ) {
		if ( rec.length !== nBase ) {
			skip( 'argument count differs from the spec' );
			continue;
		}
		// Expected: ndarray on the recorded arguments.
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

		// Variant 1: native order, WORK = null.
		const actArgs = rec.map( decode );
		const wargs = toWrapper( spec, groups, actArgs, order, null );
		if ( wargs === null ) {
			skip( 'call not expressible through the wrapper' );
		} else {
			report.variants += 1;
			let actRet;
			try {
				actRet = wrapper( ...wargs );
				const er = sameStorageReturn( expArgs, expRet, actArgs, actRet ) ? SAME : expRet;
				const d = diff( exp, snapshot( actArgs, workspaceIdx ), er, actRet, baseNames );
				if ( d ) {
					report.mismatches.push( { 'variant': 'native ' + order, 'detail': d } );
				}
			} catch ( e ) {
				report.rejected.push( { 'variant': 'native ' + order, 'detail': String( e.message ).slice( 0, 200 ) } );
			}
		}

		// Variant 2: each float vector with a positive stride, rebuilt with a
		// negative stride.
		groups.forEach( function eachGroup( g, k ) {
			if ( kindOf( g ) !== 'vector' || wargs === null ) {
				return;
			}
			const ai = g.at;
			const x0 = rec[ ai ];
			const s = rec[ ai + 1 ].v;
			const o = rec[ ai + 2 ].v;
			const probe = decode( x0 );
			if ( !isFloat( probe ) || !( s > 0 ) ) {
				return;
			}
			const high = touchedHigh( nd, rec, ai );
			if ( high < 0 || ( high - o ) % s !== 0 ) {
				skip( 'vector extent not measurable' );
				return;
			}
			const n = ( ( high - o ) / s ) + 1;
			if ( n < 2 ) {
				return;
			}
			const build = function build() {
				const src = decode( x0 );
				const y = new src.constructor( ( ( n - 1 ) * s ) + 1 );
				poison( y, 0, y.length );
				const fs2 = flat( src );
				const fy = flat( y );
				const c = isComplexArray( src ) ? 2 : 1;
				for ( let j = 0; j < n; j++ ) {
					for ( let q = 0; q < c; q++ ) {
						fy[ ( ( ( n - 1 - j ) * s ) * c ) + q ] = fs2[ ( ( o + ( j * s ) ) * c ) + q ];
					}
				}
				return y;
			};
			const eArgs = rec.map( decode );
			eArgs[ ai ] = build();
			eArgs[ ai + 1 ] = -s;
			eArgs[ ai + 2 ] = ( n - 1 ) * s;
			let eRet;
			try {
				eRet = nd( ...eArgs );
			} catch ( e ) {
				return;
			}
			const e2 = snapshot( eArgs, workspaceIdx );
			const aArgs = rec.map( decode );
			const y = build();
			aArgs[ ai ] = y;
			const over = {};
			over[ k ] = { 'x': y, 'stride': -s };
			const w2 = toWrapper( spec, groups, aArgs, order, over );
			if ( w2 === null ) {
				return;
			}
			report.variants += 1;
			try {
				const aRet = wrapper( ...w2 );
				const er = sameStorageReturn( eArgs, eRet, aArgs, aRet ) ? SAME : eRet;
				const d = diff( e2, snapshot( aArgs, workspaceIdx ), er, aRet, baseNames );
				if ( d ) {
					report.mismatches.push( { 'variant': 'negative-stride:' + g.param.name + ' (n = ' + n + ')', 'detail': d } );
				}
			} catch ( e ) {
				report.rejected.push( { 'variant': 'negative-stride:' + g.param.name, 'detail': String( e.message ).slice( 0, 200 ) } );
			}
		});
	}
	return report;
}

export { replayModule };
