#!/usr/bin/env node

/**
* Probe-driven benchmark generator.
*
* Reads the JSDoc signature of a module's strided wrapper (`lib/<r>.js`) and
* offset form (`lib/ndarray.js`), picks an argument expression for every
* parameter, and then *probes* the real routine at a small size: whenever a
* call throws, the error message is used to identify the offending argument
* (`invalid argument. Fifth argument ...`) and that argument advances to its
* next candidate; unattributable errors grow the arrays. The first argument
* list that runs (repeatedly, without throwing) is emitted as a benchmark.
*
* Usage:
*   node bin/gen-benchmark.mjs <module-dir>... [--write] [--kind=strided|ndarray]
*
* Without --write, prints the probe outcome only. Exit code 1 if any probe
* failed to find a working argument list.
*/

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, basename, dirname, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import RECIPES from './gen-benchmark-recipes.mjs';


// VARIABLES //

const PROBE_N = 10;
const GROWTH_CALLS = 1000;
const GROWTH_DRAWS = 8;
const LARGE_N = 100;
const LARGE_CALLS = 10;
const LARGE_DRAWS = 4;
const ORDINALS = [ 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth' ];
const TENS = { 'twenty': 20, 'thirty': 30, 'forty': 40 };

// Known-good enum values by parameter name (first entry is the default).
const ENUMS = {
	'order': [ 'column-major', 'row-major' ],
	'uplo': [ 'upper', 'lower', 'all' ],
	'trans': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transa': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transb': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'trana': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'tranb': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'transr': [ 'no-transpose', 'transpose', 'conjugate-transpose' ],
	'diag': [ 'non-unit', 'unit' ],
	'side': [ 'left', 'right', 'both' ],
	'norm': [ 'max', 'one-norm', 'inf-norm', 'frobenius' ],
	'direct': [ 'forward', 'backward' ],
	'storev': [ 'columnwise', 'rowwise' ],
	'range': [ 'all', 'value', 'index' ],
	'jobz': [ 'compute-vectors', 'no-vectors' ],
	'jobvl': [ 'compute-vectors', 'no-vectors', 'compute', 'none' ],
	'jobvr': [ 'compute-vectors', 'no-vectors', 'compute', 'none' ],
	'jobvs': [ 'compute-vectors', 'no-vectors' ],
	'jobvsl': [ 'compute-vectors', 'no-vectors' ],
	'jobvsr': [ 'compute-vectors', 'no-vectors' ],
	'jobu': [ 'all-columns', 'economy', 'compute-vectors', 'compute', 'overwrite', 'none', 'initialize', 'update' ],
	'jobvt': [ 'all-rows', 'economy', 'overwrite', 'none' ],
	'jobv': [ 'compute-vectors', 'compute', 'compute-v', 'apply-v', 'no-v', 'none', 'initialize', 'update' ],
	'jobq': [ 'compute-vectors', 'compute', 'initialize', 'update', 'none' ],
	'compq': [ 'initialize', 'update', 'none' ],
	'compz': [ 'initialize', 'update', 'none' ],
	'balanc': [ 'both', 'none', 'permute', 'scale' ],
	'sense': [ 'none', 'eigenvalues', 'right-vectors', 'both' ],
	'sort': [ 'not-sorted', 'none', 'sorted', 'sort' ],
	'fact': [ 'not-factored', 'equilibrate', 'factored' ],
	'equed': [ 'none', 'row', 'column', 'both', 'yes' ],
	'howmny': [ 'all', 'backtransform', 'selected', 'select', 'partial' ],
	'vect': [ 'q-only', 'p-only', 'both', 'initialize', 'update', 'no-vectors' ],
	'normin': [ 'no', 'yes' ],
	'type': [ 'general', 'lower', 'upper', 'upper-hessenberg', 'band', 'lower-band', 'upper-band' ],
	'id': [ 'increasing', 'decreasing' ],
	'pivot': [ 'variable', 'top', 'bottom' ],
	'way': [ 'convert', 'revert' ],
	'bmat': [ 'standard', 'generalized' ],
	'initv': [ 'no-init', 'no', 'user' ],
	'eigsrc': [ 'qr', 'no' ],
	'ident': [ 'not-identity', 'identity' ],
	'jobt': [ 'ldl', 'tridiagonal' ]
};

// Integer parameter starting candidates by name (expressions in `N`).
const BAND = [ '2', '1', '0' ];
const INTS = {
	'KL': BAND,
	'KU': BAND,
	'KD': BAND,
	'KA': BAND,
	'KB': BAND,
	'K': [ 'N', '1', '2', '0', 'N-1' ],
	'ilo': [ '1', '0', 'N' ],
	'ihi': [ 'N', 'N-1', '1', '0' ],
	'ILO': [ '1', '0', 'N' ],
	'IHI': [ 'N', 'N-1', '1', '0' ],
	'il': [ '1', '0', 'N' ],
	'iu': [ 'N', 'N-1', '1' ],
	'IL': [ '1', '0', 'N' ],
	'IU': [ 'N', 'N-1', '1' ],

	// Block sizes and (0-based) block start of the xTGEX2/xLAEXC/xTREXC family:
	'n1': [ '1', '2' ],
	'n2': [ '1', '2' ],
	'j1': [ '0', '1' ],

	// Sign of the Sylvester equation (xTRSYL) and the xLASD* row flag:
	'isgn': [ '1', '-1' ],
	'sqre': [ '0', '1' ],

	// 0-based active window and Q/Z update ranges of the xLAQZ* sweeps:
	'istartm': [ '0', '1' ],
	'istopm': [ 'N-1', 'N' ],
	'qstart': [ '0', '1' ],
	'zstart': [ '0', '1' ],
	'nq': [ 'N', 'N-1' ],
	'nz': [ 'N', 'N-1' ]
};
const DEFAULT_INTS = [ 'N', '1', '0', '2', 'N-1', 'N / 2', 'N + 1', '2 * N', '3', '-1' ];
const NUMBERS = [ '1.0', '0.5', '2.0', '0.0', '-1.0', '10.0' ];

// Plane-rotation cosine/sine (c^2 + s^2 = 1), so repeated in-place rotation stays bounded:
const NUMS = {
	'c': [ '0.6', ...NUMBERS ],
	's': [ '0.8', ...NUMBERS ]
};

// Array size tiers (expressions in `N`):
const SIZES_2D = [ 'N * N', '4 * N * N', '16 * N * N' ];
const WORK_2D = [ '(4 * N * N) + (64 * N)', '(16 * N * N) + (256 * N)', '(64 * N * N) + (1024 * N)' ];
const SIZES_1D = [ 'N', '4 * N', '16 * N' ];
const WORK_1D = [ '64 * N', '256 * N', '1024 * N' ];
const RE_WORK = /^[A-Z]?work\w*$/i;


// FUNCTIONS //

/**
* Parses the JSDoc params + returns of the named function in a file.
*
* @param {string} src - source
* @param {string} fname - function name
* @returns {(Object|null)} signature
*/
function parseSignature( src, fname ) {
	const re = new RegExp( '/\\*\\*((?:(?!\\*/)[\\s\\S])*?)\\*/\\s*function\\s+' + fname + '\\s*\\(([^)]*)\\)' );
	const m = src.match( re );
	if ( !m ) {
		return null;
	}
	const names = m[ 2 ].split( ',' ).map( ( s ) => s.trim() ).filter( Boolean );
	const types = {};
	const pre = /@param\s+\{([^}]+)\}\s+(\[?[\w.]+)\]?(?:\s*-\s*([^\n]*))?/g;
	const descs = {};
	let pm;
	while ( ( pm = pre.exec( m[ 1 ] ) ) !== null ) {
		// Normalize e.g. "(Complex128Array|null)" to its first non-null alternative:
		descs[ pm[ 2 ].replace( /^\[/, '' ) ] = pm[ 3 ] || '';
		types[ pm[ 2 ].replace( /^\[/, '' ) ] = pm[ 1 ].replace( /[()]/g, '' ).split( '|' ).filter( ( a ) => a !== 'null' )[ 0 ] || pm[ 1 ];
	}
	const rm = m[ 1 ].match( /@returns\s+\{([^}]+)\}\s*([^\n]*)/ );
	return {
		'params': names.map( ( n ) => ( { 'name': n, 'type': types[ n ] || 'unknown', 'desc': descs[ n ] || '' } ) ),
		'returns': ( rm ) ? rm[ 1 ] : 'void',
		'returnsDesc': ( rm ) ? rm[ 2 ] : ''
	};
}

/**
* Harvests string literals from a module's lib sources.
*
* @param {string} dir - module dir
* @returns {Array<string>} literals
*/
function harvestStrings( dir ) {
	const out = new Set();
	for ( const f of [ 'base.js', 'ndarray.js', basename( dir ) + '.js' ] ) {
		const p = join( dir, 'lib', f );
		if ( !existsSync( p ) ) {
			continue;
		}
		const src = readFileSync( p, 'utf8' ).replace( /\/\*[\s\S]*?\*\//g, '' ).replace( /\/\/.*$/gm, '' );
		for ( const m of src.matchAll( /'([A-Za-z][A-Za-z0-9-]*)'/g ) ) {
			out.add( m[ 1 ] );
		}
	}
	return [ ...out ];
}

/**
* Parses an ordinal-word position from an error message.
*
* @param {string} msg - message
* @returns {integer} zero-based index or -1
*/
function argIndex( msg ) {
	const m = msg.match( /\b([A-Z][a-z]+(?:-[a-z]+)?) argument/ );
	if ( !m ) {
		return -1;
	}
	const w = m[ 1 ].toLowerCase();
	let i = ORDINALS.indexOf( w );
	if ( i >= 0 ) {
		return i;
	}
	const parts = w.split( '-' );
	if ( parts.length === 2 && TENS[ parts[ 0 ] ] ) {
		i = ORDINALS.indexOf( parts[ 1 ] );
		if ( i >= 0 ) {
			return TENS[ parts[ 0 ] ] + i;
		}
	}
	if ( TENS[ w.replace( /ieth$/, 'y' ) ] ) {
		return TENS[ w.replace( /ieth$/, 'y' ) ] - 1;
	}
	return -1;
}

/**
* Builds the candidate list for every parameter.
*
* @param {Object} sig - signature
* @param {boolean} is2d - whether the routine takes matrices
* @param {Array<string>} literals - module string literals
* @returns {Array<Object>} parameter specs
*/
function buildSpecs( sig, is2d, literals ) {
	const names = sig.params.map( ( p ) => p.name );
	return sig.params.map( ( p ) => {
		const n = p.name;
		const t = p.type;
		let kind;
		let cands;
		if ( n === 's' && t === 'Float64Array' && sig.params.some( ( q ) => q.name === 'c' && q.type === 'number' ) ) {
			// Complex plane-rotation sine stored as [re, im]; |c|^2 + |s|^2 = 1:
			kind = 'const';
			cands = [ 'new Float64Array( [ 0.8, 0.0 ] )' ];
		} else if ( /^(Int32Array|Float64Array)$/.test( t ) && /length-1|single-element|one-element/i.test( p.desc ) ) {
			// A scalar passed by reference (e.g. xTREXC's 1-based `ifst`):
			kind = 'const';
			cands = [ `new ${t}( [ 1 ] )`, `new ${t}( [ 0 ] )` ];
			if ( /^ilst$/i.test( n ) ) {
				// Move the block the whole way (ifst = 1 to ilst = N), not nowhere:
				cands = [ `new ${t}( [ N ] )`, ...cands ];
			}
		} else if ( /Array/.test( t ) && !/^Array/.test( t ) ) {
			const work = RE_WORK.test( n );
			kind = 'array';
			cands = ( is2d ) ? ( work ? WORK_2D : SIZES_2D ) : ( work ? WORK_1D : SIZES_1D );
		} else if ( t === 'string' ) {
			kind = 'enum';
			const known = ENUMS[ n ] || ENUMS[ n.toLowerCase() ] || [];
			cands = [ ...new Set( [ ...known, ...literals ] ) ].map( ( s ) => `'${s}'` );
		} else if ( /^stride/.test( n ) ) {
			kind = 'int';
			const m = n.match( /^stride(\w+?)([12])$/ );
			if ( m && names.includes( `stride${m[ 1 ]}${( m[ 2 ] === '1' ) ? '2' : '1'}` ) ) {
				// Column-major 2D strides with LD = N:
				cands = ( m[ 2 ] === '1' ) ? [ '1', 'N' ] : [ 'N', '1', '2 * N' ];
			} else {
				cands = [ '1', '2' ];
			}
		} else if ( /^offset/.test( n ) ) {
			kind = 'int';
			cands = [ '0' ];
		} else if ( /^LD/i.test( n ) ) {
			kind = 'int';
			cands = [ 'N', '2 * N', '4 * N', '1' ];
		} else if ( t === 'number' ) {
			kind = 'num';
			cands = NUMS[ n ] || NUMBERS;
		} else if ( t === 'Complex128' ) {
			kind = 'cplx';
			cands = [ 'new Complex128( 1.0, 0.0 )', 'new Complex128( 0.5, 0.5 )', 'new Complex128( 0.0, 0.0 )' ];
			if ( n === 's' && sig.params.some( ( q ) => q.name === 'c' && q.type === 'number' ) ) {
				// Complex plane-rotation sine with a real cosine (c = 0.6): c^2 + |s|^2 = 1.
				cands = [ 'new Complex128( 0.8, 0.0 )', ...cands ];
			}
		} else if ( t === 'boolean' ) {
			kind = 'bool';
			cands = [ 'true', 'false' ];
		} else if ( t === 'Function' ) {
			kind = 'fn';
			cands = [ 'select' ];
		} else if ( t === 'Object' ) {
			kind = 'obj';
			cands = [ '{}' ];
		} else if ( /^Array/.test( t ) ) {
			kind = 'obj';
			cands = ( n === 'equed' ) ? [ "[ 'none' ]", "[ 'yes' ]" ] : [ '[ 0 ]', '[ 1 ]' ];
		} else if ( /integer|Integer/.test( t ) ) {
			kind = 'int';
			// In band routines (xGB/xSB/xTB/xHB/xPB), `K` is a bandwidth:
			cands = ( n === 'K' && sig.band ) ? BAND : ( INTS[ n ] || INTS[ n.toUpperCase() ] || DEFAULT_INTS );
			if ( /1-based/i.test( p.desc ) ) {
				// A 1-based index: start at the first valid position.
				cands = [ ...new Set( [ '1', ...cands.filter( ( c ) => c !== '0' ) ] ) ];
			} else if ( /0-based/i.test( p.desc ) ) {
				// A 0-based index: `N` is one past the end.
				cands = [ ...new Set( cands.map( ( c ) => ( c === 'N' ) ? 'N-1' : c ).filter( ( c ) => c !== 'N + 1' && c !== '2 * N' ) ) ];
			}
		} else {
			kind = 'unknown';
			cands = [ 'null' ];
		}
		return { 'name': n, 'type': t, 'kind': kind, 'cands': cands, 'idx': 0 };
	}).map( ( s, k ) => {
		s.tag = 1 + ( 3 * k );
		return s;
	});
}

/**
* Evaluates an expression for a parameter spec at size N.
*
* @param {Object} spec - spec
* @param {integer} N - size
* @param {integer} tier - array size tier
* @returns {*} value
*/
function materialize( spec, N, tier, pad ) {
	if ( spec.kind === 'array' ) {
		let len = Function( 'N', `return ${arrayLen( spec, tier )};` )( N );
		if ( pad && spec.type === 'Float64Array' ) {
			// Distinct padding per array so a failed complex reinterpretation
			// ("Invalid typed array length: 2*len") identifies the array:
			len += spec.tag;
		}
		spec.probeLen = len;
		const arr = makeArray( spec.type, len );
		if ( spec.dominant ) {
			const f = flat( arr );
			const step = ( arr instanceof Complex128Array ) ? 2 : 1;
			for ( let j = 0; j < N; j++ ) {
				f[ step * j * ( N + 1 ) ] += 20.0 * N;
			}
		}
		return arr;
	}
	if ( spec.kind === 'fn' ) {
		return select;
	}
	return Function( 'N', 'Complex128', 'Float64Array', 'Int32Array', `return ( ${spec.cands[ spec.idx ]} );` )( N, Complex128, Float64Array, Int32Array );
}

/**
* Materializes every argument at size N and runs the recipe setup, if any.
*
* @param {Array<Object>} specs - parameter specs
* @param {integer} N - size
* @param {integer} tier - array size tier
* @returns {Array} arguments
*/
function materializeAll( specs, N, tier ) {
	const args = specs.map( ( q ) => materialize( q, N, tier, false ) );
	if ( specs.setup ) {
		specs.setup( N, args );
	}
	return args;
}

/**
* Returns an array parameter's length expression.
*
* @param {Object} spec - spec
* @param {integer} tier - array size tier
* @returns {string} expression in `N`
*/
function arrayLen( spec, tier ) {
	return spec.fixedLen || spec.cands[ Math.min( spec.idx + tier, spec.cands.length - 1 ) ];
}

/**
* Selection callback used for routines that take one (never selects).
*
* @returns {boolean} false
*/
function select() {
	return false;
}

/**
* Creates a typed array filled the same way the emitted benchmark does.
*
* @param {string} type - type name
* @param {integer} len - length
* @returns {*} array
*/
function makeArray( type, len ) {
	let i;
	if ( type === 'Complex128Array' ) {
		const buf = new Float64Array( 2 * len );
		for ( i = 0; i < buf.length; i++ ) {
			buf[ i ] = ( Math.random() * 20.0 ) - 10.0;
		}
		return new Complex128Array( buf );
	}
	if ( type === 'Float64Array' ) {
		const a = new Float64Array( len );
		for ( i = 0; i < len; i++ ) {
			a[ i ] = ( Math.random() * 20.0 ) - 10.0;
		}
		return a;
	}
	if ( type === 'Int32Array' ) {
		return new Int32Array( len );
	}
	if ( type === 'Uint8Array' || type === 'BooleanArray' || type === 'Uint8Array|Array' ) {
		return new Uint8Array( len );
	}
	if ( type === 'Float32Array' ) {
		return new Float32Array( len );
	}
	return new Float64Array( len );
}

/**
* Checks whether a return value is NaN-like.
*
* @param {*} v - value
* @returns {boolean} boolean
*/
function isBad( v ) {
	if ( typeof v === 'number' ) {
		return v !== v;
	}
	if ( v instanceof Complex128 ) {
		return v.re !== v.re || v.im !== v.im;
	}
	if ( v instanceof Float64Array || v instanceof Complex128Array ) {
		// The emitted benchmark checks every element of a returned array:
		return flat( v ).some( ( x ) => x !== x );
	}
	return false;
}

/**
* Returns a real-valued view of a typed array (complex arrays reinterpreted).
*
* @param {*} v - typed array
* @returns {*} view
*/
function flat( v ) {
	return ( v instanceof Complex128Array ) ? new Float64Array( v.buffer, v.byteOffset, 2 * v.length ) : v;
}

/**
* Returns the names of array arguments that become non-finite under repeated
* in-place calls (the benchmark would then time Inf/NaN arithmetic).
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {Array} args - working argument list
* @returns {Array<string>} offending parameter names
*/
function nonfinite( fcn, specs, args ) {
	const fresh = specs.map( ( q, k ) => ( q.refresh ) ? flat( args[ k ] ).slice() : null );
	try {
		for ( let k = 0; k < GROWTH_CALLS; k++ ) {
			fresh.forEach( ( f, j ) => f && flat( args[ j ] ).set( f ) );
			fcn( ...args );
		}
	} catch ( e ) {
		return [ '(throws on repeat: ' + e.message + ')' ];
	}
	const out = [];
	specs.forEach( ( q, k ) => {
		const v = args[ k ];
		if ( q.kind !== 'array' || RE_WORK.test( q.name ) || !v || !v.buffer ) {
			return;
		}
		const view = flat( v );
		for ( let i = 0; i < view.length; i++ ) {
			if ( !Number.isFinite( view[ i ] ) ) {
				out.push( q.name );
				return;
			}
		}
	});
	return out;
}

/**
* Tests whether a routine never touches array `q` past length `len`.
*
* Out-of-bounds typed-array access is silent, so instead run at the full
* length twice from identical inputs that differ only in `q`'s tail: the tail
* must come back unchanged (never written), and every output must match bit
* for bit (never read).
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
* @param {Object} q - spec under test
* @param {string} len - candidate length expression
* @returns {boolean} boolean
*/
function untouchedTail( fcn, specs, tier, q, len ) {
	const args = specs.map( ( r ) => materialize( r, PROBE_N, tier, false ) );
	const k = specs.indexOf( q );
	const head = Function( 'N', `return ${len};` )( PROBE_N ) * ( flat( args[ k ] ).length / args[ k ].length );
	const snap = args.map( ( v ) => ( v && v.buffer ) ? flat( v ).slice() : null );
	const runs = [];
	for ( let r = 0; r < 2; r++ ) {
		snap.forEach( ( v, j ) => v && flat( args[ j ] ).set( v ) );
		const view = flat( args[ k ] );
		for ( let i = head; i < view.length; i++ ) {
			view[ i ] = ( r === 0 ) ? 1.0 + ( i % 7 ) : -3.0 - ( i % 5 );
		}
		const tail = view.slice( head );
		const ret = fcn( ...args );
		if ( !flat( args[ k ] ).slice( head ).every( ( v, i ) => Object.is( v, tail[ i ] ) ) ) {
			return false;
		}
		runs.push( args.map( ( v, j ) => ( snap[ j ] ) ? flat( v ).slice( ( j === k ) ? 0 : 0, ( j === k ) ? head : undefined ) : null ) );
		runs[ r ].ret = ( ret && ret.buffer ) ? null : ret;
	}
	if ( !Object.is( runs[ 0 ].ret, runs[ 1 ].ret ) && !( runs[ 0 ].ret instanceof Complex128 ) ) {
		return false;
	}
	return runs[ 0 ].every( ( v, j ) => !v || v.every( ( x, i ) => Object.is( x, runs[ 1 ][ j ][ i ] ) ) );
}

/**
* Shrinks each restored array to the smallest length that still runs cleanly,
* so restoring it costs O(what the routine touches) rather than O(N^2).
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
*/
function shrinkRefreshed( fcn, specs, tier ) {
	if ( specs.setup ) {
		return; // Setup code fills whole arrays; restore them whole.
	}
	for ( const q of specs ) {
		if ( !q.refresh || q.kind !== 'array' ) {
			continue;
		}
		const was = arrayLen( q, tier );
		for ( const len of [ 'N', '2 * N' ] ) {
			if ( len === was ) {
				break;
			}
			try {
				if ( untouchedTail( fcn, specs, tier, q, len ) ) {
					q.fixedLen = len;
					const real = materializeAll( specs, PROBE_N, tier );
					if ( !nonfinite( fcn, specs, real ).length ) {
						break;
					}
				}
			} catch ( e ) {
				// Too small: try the next length.
			}
			q.fixedLen = null;
		}
	}
}

/**
* Returns what goes non-finite over repeated calls at a realistic size
* (restoring as emitted): array names, plus `(return)` for a bad return.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
* @returns {Array<string>} offenders (empty if all finite)
*/
function largeBad( fcn, specs, tier ) {
	for ( let d = 0; d < LARGE_DRAWS; d++ ) {
		const args = materializeAll( specs, LARGE_N, tier );
		const fresh = specs.map( ( q, k ) => ( q.refresh ) ? flat( args[ k ] ).slice() : null );
		let v;
		try {
			for ( let c = 0; c < LARGE_CALLS; c++ ) {
				fresh.forEach( ( f, j ) => f && flat( args[ j ] ).set( f ) );
				v = fcn( ...args );
			}
		} catch ( e ) {
			return []; // Size-dependent errors are the probe's business, not conditioning's.
		}
		const out = specs.filter( ( q, k ) => q.kind === 'array' && !RE_WORK.test( q.name ) && args[ k ].buffer && !flat( args[ k ] ).every( Number.isFinite ) ).map( ( q ) => q.name );
		if ( isBad( v ) ) {
			out.push( '(return)' );
		}
		if ( out.length ) {
			return out;
		}
	}
	return [];
}

/**
* Returns the nonzero `info` a status-returning routine reports on the
* emitted inputs (an early exit: e.g. a Cholesky of a non-SPD matrix), at the
* probe size or at `LARGE_N`, else 0.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
* @returns {integer} info
*/
function infoAt( fcn, specs, tier ) {
	if ( !specs.infoReturn ) {
		return 0;
	}
	for ( const n of [ PROBE_N, LARGE_N ] ) {
		try {
			const v = fcn( ...materializeAll( specs, n, tier ) );
			if ( typeof v === 'number' && v !== 0 ) {
				return v;
			}
		} catch ( e ) {
			// Size-dependent errors are the probe's business.
		}
	}
	return 0;
}

/**
* Builds the context a recipe's `build` sees: the probed argument choices.
*
* @param {string} routine - routine name
* @param {Array<Object>} specs - parameter specs
* @returns {Object} context
*/
function recipeContext( routine, specs ) {
	const find = ( n ) => specs.find( ( q ) => q.name.toLowerCase() === n.toLowerCase() );
	const arg = ( n ) => {
		const q = find( n );
		return ( q && q.kind !== 'array' && q.kind !== 'fn' ) ? q.cands[ q.idx ].replace( /^N-1$/, 'N - 1' ) : null;
	};
	const tmps = {};
	const ctx = {
		'routine': routine,
		'p': routine[ 0 ],
		'cplx': routine[ 0 ] === 'z',
		'CA': ( routine[ 0 ] === 'z' ) ? 'Complex128Array' : 'Float64Array',
		'has': ( n ) => Boolean( find( n ) ),
		'arg': arg,
		'pick': ( ...ns ) => ns.find( ( n ) => find( n ) && find( n ).kind === 'array' ) || null,
		'isMatrix': ( n ) => Boolean( find( 'LD' + n ) || find( 'stride' + n + '2' ) ),
		'ld': ( n ) => arg( 'LD' + n ) || arg( 'stride' + n + '2' ),
		'stride1': ( n ) => ( find( 'stride' + n + '1' ) ) ? arg( 'stride' + n + '1' ) : ( ( arg( 'order' ) === '\'column-major\'' ) ? '1' : null ),
		'offset': ( n ) => arg( 'offset' + n ) || '0',
		'dense': ( n ) => Boolean( find( n ) ) && find( n ).kind === 'array' && ctx.stride1( n ) === '1' && ctx.ld( n ) === 'N' && ctx.offset( n ) === '0',
		'vec': ( n ) => Boolean( find( n ) ) && find( n ).kind === 'array' && ( !find( 'stride' + n ) || arg( 'stride' + n ) === '1' ) && ctx.offset( n ) === '0',
		'allN': () => specs.every( ( q ) => !/^(M|N|K)$/i.test( q.name ) || q.kind !== 'int' || q.cands[ q.idx ] === 'N' ),
		'tmp': ( base ) => {
			if ( !tmps[ base ] ) {
				let v = base;
				while ( find( v ) || Object.values( tmps ).includes( v ) ) {
					v += '0';
				}
				tmps[ base ] = v;
			}
			return tmps[ base ];
		},
		'copy': ( dst, src ) => {
			const c = ( n ) => find( n ) && find( n ).type === 'Complex128Array';
			return ( c( dst ) ) ? `reinterpret( ${dst}, 0 ).set( reinterpret( ${src}, 0 ) );` : `${dst}.set( ${src} );`;
		}
	};
	return ctx;
}

/**
* Rewrites a recipe's canonical parameter names (`TAU`, `d`) to the
* routine's own spelling (`tau`, `D`).
*
* @param {Array<string>} lines - setup code
* @param {Array<Object>} specs - parameter specs
* @returns {Array<string>} lines
*/
function canonicalize( lines, specs ) {
	const byLower = {};
	specs.forEach( ( q ) => {
		byLower[ q.name.toLowerCase() ] = q.name;
	});
	return lines.map( ( l ) => l.replace( /\b[A-Za-z_]\w*\b/g, ( id ) => byLower[ id.toLowerCase() ] || id ) );
}

/**
* Installs a recipe: compiles its setup code against the routine's arguments
* and producers, verifies the routine runs on the structured inputs, and marks
* the arrays the routine overwrites for restoring.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
* @param {Object} recipe - recipe
* @param {Object} built - `{ producers, lines }`
* @param {Object} producers - producer functions by name
* @returns {string} empty string, or why the recipe was rejected
*/
function installRecipe( fcn, specs, tier, recipe, built, producers ) {
	const lines = canonicalize( built.lines, specs );
	const names = specs.map( ( q ) => q.name );
	const pnames = Object.keys( producers );
	let body;
	try {
		body = Function( 'N', '__args', 'reinterpret', 'Float64Array', 'Complex128Array', 'Int32Array', ...pnames, [
			`const [ ${names.map( ( n ) => ( n === 'N' ) ? '' : n ).join( ', ' )} ] = __args;`,
			'let j, k;',
			...lines
		].join( '\n' ) );
	} catch ( e ) {
		return 'setup does not compile: ' + e.message;
	}
	specs.setup = ( N, args ) => body( N, args, reinterpret, Float64Array, Complex128Array, Int32Array, ...pnames.map( ( n ) => producers[ n ] ) );
	try {
		const args = materializeAll( specs, PROBE_N, tier );
		const snap = args.map( ( v ) => ( v && v.buffer ) ? flat( v ).slice() : null );
		fcn( ...args );
		specs.forEach( ( q, k ) => {
			const touched = lines.some( ( l ) => new RegExp( `\\b${q.name}\\b` ).test( l ) );
			if ( touched && q.kind === 'array' && !RE_WORK.test( q.name ) && snap[ k ] && !flat( args[ k ] ).every( ( x, i ) => Object.is( x, snap[ k ][ i ] ) ) ) {
				// Overwritten: restore before every call so each sees the structured input.
				q.refresh = true;
			}
		});
		for ( let c = 0; c < 2; c++ ) {
			fcn( ...materializeAll( specs, PROBE_N, tier ) );
		}
	} catch ( e ) {
		specs.setup = null;
		specs.forEach( ( q ) => {
			q.refresh = false;
		});
		return 'routine rejects the structured inputs: ' + e.message;
	}
	specs.setupLines = lines;
	specs.producers = pnames;
	specs.recipeName = recipe.name;
	return '';
}

/**
* Probes a function for a working argument list.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @returns {Object} result
*/
function probe( fcn, specs ) {
	let tier = 0;
	let pad = true;
	let lastErr = '';
	for ( let iter = 0; iter < 200; iter++ ) {
		let args;
		try {
			args = specs.map( ( s ) => materialize( s, PROBE_N, tier, pad ) );
		} catch ( e ) {
			return { 'ok': false, 'error': 'materialize: ' + e.message };
		}
		try {
			let v;
			for ( let k = 0; k < 3; k++ ) {
				v = fcn( ...args );
			}
			if ( isBad( v ) ) {
				throw new Error( 'NaN result' );
			}
			if ( specs.infoReturn && typeof v === 'number' && v < 0 && specs.fortranPos[ -v ] && specs.some( ( q ) => q.name.toLowerCase() === specs.fortranPos[ -v ].toLowerCase() && q.kind !== 'array' ) ) {
				// LAPACK's illegal-argument report: INFO = -i names the i-th
				// (Fortran) argument. When it is a scalar, step it like any
				// invalid argument (an array needs a recipe; INFO is reported).
				throw new Error( `info=${v}: \`${specs.fortranPos[ -v ]}\` is invalid` );
			}
			if ( pad ) {
				// Re-verify with the exact (unpadded) sizes the benchmark will use:
				pad = false;
				continue;
			}
			if ( specs.recipePending ) {
				return { 'ok': true, 'tier': tier, 'pending': true };
			}
			return finish( fcn, specs, tier, args );
		} catch ( e ) {
			lastErr = String( e && e.message || e );
			if ( process.env.DEBUG ) {
				console.error( specs.map( ( s ) => s.cands[ s.idx ] ).join( ', ' ), '=>', ( process.env.DEBUG === '2' ) ? e.stack : lastErr );
			}
			if ( handleError( specs, args, lastErr ) ) {
				continue;
			}
			if ( tier < 2 ) {
				tier += 1;
				continue;
			}
			return { 'ok': false, 'error': lastErr };
		}
	}
	return { 'ok': false, 'error': 'iteration limit: ' + lastErr };
}

/**
* Runs the growth, large-N and `info` checks on a working argument list,
* restoring, shrinking or structuring inputs as needed.
*
* @param {Function} fcn - routine
* @param {Array<Object>} specs - parameter specs
* @param {integer} tier - array size tier
* @param {Array} args - working argument list
* @returns {Object} result
*/
function finish( fcn, specs, tier, args ) {
	{
		{
			// Growth depends on the draw (e.g. a near-zero pivot), so check several:
			let bad = nonfinite( fcn, specs, args );
			for ( let d = 1; d < GROWTH_DRAWS && !/^\(/.test( bad[ 0 ] || '' ); d++ ) {
				bad = [ ...new Set( [ ...bad, ...nonfinite( fcn, specs, materializeAll( specs, PROBE_N, tier ) ) ] ) ];
			}
			if ( bad.length && !/^\(/.test( bad[ 0 ] ) ) {
				// Restore the growing arrays before every call, then re-check
				// from freshly materialized inputs:
				specs.forEach( ( q ) => {
					q.refresh = q.refresh || bad.includes( q.name );
				});
				bad = [];
				for ( let d = 0; d < GROWTH_DRAWS; d++ ) {
					bad = [ ...new Set( [ ...bad, ...nonfinite( fcn, specs, materializeAll( specs, PROBE_N, tier ) ) ] ) ];
				}
				if ( !bad.length ) {
					shrinkRefreshed( fcn, specs, tier );
				}
			}
			let lb = largeBad( fcn, specs, tier );
			if ( lb.some( ( n ) => !/^\(/.test( n ) ) ) {
				// Growth that is too slow to show at the probe size:
				specs.forEach( ( q ) => {
					q.refresh = q.refresh || lb.includes( q.name );
				});
				lb = largeBad( fcn, specs, tier );
				if ( !lb.length ) {
					shrinkRefreshed( fcn, specs, tier );
				}
			}
			let large = !lb.length;
			if ( !large ) {
				// One call already overflows at a realistic size (e.g. a solve
				// through a random, badly conditioned triangle). Retry with
				// diagonally dominant square inputs:
				const square = specs.filter( ( q ) => q.kind === 'array' && !RE_WORK.test( q.name ) && arrayLen( q, tier ) === 'N * N' && ( q.type === 'Float64Array' || q.type === 'Complex128Array' ) );
				square.forEach( ( q ) => {
					q.dominant = true;
				});
				large = square.length > 0 && !largeBad( fcn, specs, tier ).length;
				if ( !large ) {
					square.forEach( ( q ) => {
						q.dominant = false;
					});
					bad = [ ...bad, `(non-finite at N=${LARGE_N})` ];
				}
			}
			return { 'ok': true, 'tier': tier, 'info': infoAt( fcn, specs, tier ), 'nonfinite': bad, 'refreshed': specs.filter( ( q ) => q.refresh ).map( ( q ) => q.name ), 'dominant': specs.filter( ( q ) => q.dominant ).map( ( q ) => q.name ) };
		}
	}
}

/**
* Adjusts the parameter specs in response to a probe error.
*
* @param {Array<Object>} specs - parameter specs
* @param {Array} args - the argument list that failed
* @param {string} lastErr - error message
* @returns {boolean} whether anything changed (retry)
*/
function handleError( specs, args, lastErr ) {
	const cm = lastErr.match( /Cannot create property '\w+' on number '(-?[\d.]+)'/ );
	if ( cm ) {
		// An integer-typed parameter that is really a one-element output array:
		const hit = specs.find( ( s, k ) => ( s.kind === 'int' || s.kind === 'num' ) && !/^(stride|offset|LD)/i.test( s.name ) && args[ k ] === Number( cm[ 1 ] ) );
		if ( hit && RE_WORK.test( hit.name ) ) {
			// A workspace documented as a scalar:
			hit.kind = 'array';
			hit.type = 'Float64Array';
			hit.cands = ( specs.is2d ) ? WORK_2D : WORK_1D;
			hit.idx = 0;
			return true;
		}
		if ( hit ) {
			hit.kind = 'obj';
			hit.cands = [ '[ 0 ]' ];
			hit.idx = 0;
			return true;
		}
	}
	const tm = lastErr.match( /Invalid typed array length: (\d+)/ );
	if ( tm ) {
		// A Float64Array (per its JSDoc) that the routine reinterprets as complex:
		const want = Number( tm[ 1 ] ) / 2;
		const hit = specs.find( ( s ) => s.type === 'Float64Array' && s.probeLen === want );
		if ( hit ) {
			hit.type = 'Complex128Array';
			hit.retyped = true;
			return true;
		}
	}
	if ( lastErr === 'NaN result' ) {
		// Valid but degenerate configuration (e.g. a block offset at
		// the matrix edge): step the first free integer that has
		// candidates left.
		const free = specs.find( ( q ) => q.kind === 'int' && !/^(stride|offset|LD|N$|M$)/i.test( q.name ) && q.idx + 1 < q.cands.length );
		if ( free ) {
			free.idx += 1;
			return true;
		}
	}
	let i = ( /invalid argument/i.test( lastErr ) ) ? argIndex( lastErr ) : -1;
	if ( i < 0 ) {
		const nm = lastErr.match( /`(\w+)` (?:must be|is invalid)/ );
		if ( nm ) {
			i = specs.findIndex( ( s ) => s.name.toLowerCase() === nm[ 1 ].toLowerCase() );
		}
	}
	const numericLeft = i >= 0 && i < specs.length && ( specs[ i ].kind === 'int' || specs[ i ].kind === 'num' ) && specs[ i ].idx + 1 < specs[ i ].cands.length;
	if ( i >= 0 && i < specs.length && specs[ i ].kind !== 'enum' && !numericLeft && /must be one of/.test( lastErr ) && specs.literals ) {
		// Documented as non-string, validated as an enum:
		specs[ i ].kind = 'enum';
		specs[ i ].type = 'string';
		specs[ i ].cands = specs.literals.map( ( l ) => `'${l}'` );
		specs[ i ].idx = 0;
		return true;
	}
	if ( i >= 0 && i < specs.length && specs[ i ].kind !== 'array' && specs[ i ].idx + 1 < specs[ i ].cands.length ) {
		specs[ i ].idx += 1;
		return true;
	}
	if ( i >= 0 && i < specs.length && specs[ i ].kind === 'array' && specs[ i ].idx + 1 < specs[ i ].cands.length ) {
		specs[ i ].idx += 1;
		return true;
	}
	// A constraint relative to another parameter (`must be >= k+2`):
	// step the parameter it names.
	const named = [ ...lastErr.matchAll( /`([A-Za-z]\w*)/g ) ].map( ( m ) => m[ 1 ] );
	const rel = specs.find( ( q, k ) => k !== i && named.includes( q.name ) && q.kind === 'int' && q.idx + 1 < q.cands.length );
	if ( rel ) {
		rel.idx += 1;
		return true;
	}
	return false;
}

/**
* Emits benchmark source.
*
* @param {Object} o - options
* @returns {string} source
*/
function emit( o ) {
	const { routine, importPath, importName, specs, tier, is2d, ret, header } = o;
	const imports = [
		"import bench from '@stdlib/bench/lib/index.js';"
	];
	const types = new Set( specs.filter( ( s ) => s.kind === 'array' ).map( ( s ) => s.type ) );
	const needsUniform = types.has( 'Float64Array' ) || types.has( 'Complex128Array' );
	if ( needsUniform ) {
		imports.push( "import uniform from '@stdlib/random/array/uniform/lib/index.js';" );
	}
	if ( types.has( 'Complex128Array' ) ) {
		imports.push( "import Complex128Array from '@stdlib/array/complex128/lib/index.js';" );
	}
	if ( types.has( 'Int32Array' ) ) {
		imports.push( "import Int32Array from '@stdlib/array/int32/lib/index.js';" );
	}
	if ( types.has( 'Uint8Array' ) || types.has( 'BooleanArray' ) || types.has( 'Uint8Array|Array' ) ) {
		imports.push( "import Uint8Array from '@stdlib/array/uint8/lib/index.js';" );
	}
	if ( types.has( 'Float32Array' ) ) {
		imports.push( "import Float32Array from '@stdlib/array/float32/lib/index.js';" );
	}
	const refreshed = specs.filter( ( s ) => s.kind === 'array' && s.refresh );
	const setup = specs.setupLines || null;
	const uses = ( re ) => Boolean( setup ) && setup.some( ( l ) => re.test( l ) );
	if ( !types.has( 'Complex128Array' ) && uses( /new Complex128Array\(/ ) ) {
		imports.push( "import Complex128Array from '@stdlib/array/complex128/lib/index.js';" );
	}
	if ( !types.has( 'Int32Array' ) && uses( /new Int32Array\(/ ) ) {
		imports.push( "import Int32Array from '@stdlib/array/int32/lib/index.js';" );
	}
	if ( !types.has( 'Int32Array' ) && specs.some( ( s ) => s.kind === 'const' && /Int32Array/.test( s.cands[ s.idx ] ) ) ) {
		imports.push( "import Int32Array from '@stdlib/array/int32/lib/index.js';" );
	}
	if ( specs.some( ( s ) => s.kind === 'const' && /Float64Array/.test( s.cands[ s.idx ] ) ) || ( !setup && refreshed.some( ( s ) => s.type === 'Float64Array' ) ) || uses( /new Float64Array\(/ ) ) {
		imports.push( "import Float64Array from '@stdlib/array/float64/lib/index.js';" );
	}
	if ( specs.some( ( s ) => s.kind === 'array' && s.type === 'Complex128Array' && ( s.refresh || s.dominant ) ) || uses( /reinterpret\(/ ) ) {
		imports.push( "import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';" );
	}
	for ( const n of ( setup ) ? specs.producers : [] ) {
		let rel = relative( resolve( o.dir, 'benchmark' ), join( specs.producerDirs[ n ], 'lib', 'ndarray.js' ) );
		rel = ( rel.startsWith( '.' ) ) ? rel : './' + rel;
		imports.push( `import ${n} from '${rel.replace( /^\.\.\//, './../' )}';` );
	}
	if ( specs.some( ( s ) => s.kind === 'cplx' ) || /^Complex128$/.test( ret ) ) {
		imports.push( "import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';" );
	}
	const rv = [ 'out', 'res', 'result', 'z' ].find( ( v ) => !specs.some( ( q ) => q.name === v ) );
	let check = null;
	if ( /^(number|integer|NonNegativeInteger|PositiveInteger|boolean)$/.test( ret ) ) {
		check = `isnan( ${rv} )`;
	} else if ( ret === 'Float64Array' ) {
		check = `isnan( ${rv}[ i % ${rv}.length ] )`;
	} else if ( ret === 'Complex128' ) {
		check = `isnan( real( ${rv} ) )`;
		imports.push( "import real from '@stdlib/complex/float64/real/lib/index.js';" );
	}
	if ( check ) {
		imports.push( "import isnan from '@stdlib/math/base/assert/is-nan/lib/index.js';" );
	}
	imports.push( "import pow from '@stdlib/math/base/special/pow/lib/index.js';" );
	imports.push( "import format from '@stdlib/string/format/lib/index.js';" );
	imports.push( "import pkgJson from './../package.json' with { type: 'json' };" );
	imports.push( `import ${importName} from '${importPath}';` );
	if ( specs.some( ( s ) => s.cands[ s.idx ] === 'new Complex128( 1.0, 0.0 )' ) && !imports.some( ( l ) => /complex\/float64\/ctor/.test( l ) ) ) {
		imports.push( "import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';" );
	}

	const decl = [];
	const restore = [];
	const taken = new Set( specs.map( ( s ) => s.name ) );
	( setup || [] ).forEach( ( l ) => {
		const m = l.match( /^const (\w+)/ );
		if ( m ) {
			taken.add( m[ 1 ] );
		}
	});
	const fresh = ( base ) => {
		let v = base + 'Init';
		while ( taken.has( v ) ) {
			v += '0';
		}
		taken.add( v );
		return v;
	};
	const freshExact = ( base ) => {
		let v = base;
		while ( taken.has( v ) ) {
			v += '0';
		}
		taken.add( v );
		return v;
	};
	for ( const s of specs ) {
		if ( s.kind === 'const' ) {
			decl.push( `\tconst ${s.name} = ${s.cands[ s.idx ]};` );
			continue;
		}
		if ( s.kind !== 'array' ) {
			continue;
		}
		const len = arrayLen( s, tier );
		if ( s.refresh && !setup && s.type === 'Complex128Array' ) {
			const init = fresh( s.name );
			const view = freshExact( s.name + 'View' );
			decl.push( `\tconst ${init} = uniform( 2 * ( ${len} ), -10.0, 10.0, options );` );
			decl.push( `\tconst ${s.name} = new Complex128Array( ${init}.length / 2 );` );
			decl.push( `\tconst ${view} = reinterpret( ${s.name}, 0 );` );
			restore.push( `${view}.set( ${init} );` );
		} else if ( s.refresh && !setup && s.type === 'Float64Array' ) {
			const init = fresh( s.name );
			decl.push( `\tconst ${init} = uniform( ${len}, -10.0, 10.0, options );` );
			decl.push( `\tconst ${s.name} = new Float64Array( ${init}.length );` );
			restore.push( `${s.name}.set( ${init} );` );
		} else if ( s.type === 'Complex128Array' ) {
			decl.push( `\tconst ${s.name} = new Complex128Array( uniform( 2 * ( ${len} ), -10.0, 10.0, options ) );` );
		} else if ( s.type === 'Float64Array' ) {
			decl.push( `\tconst ${s.name} = uniform( ${len}, -10.0, 10.0, options );` );
		} else if ( s.type === 'Int32Array' ) {
			decl.push( `\tconst ${s.name} = new Int32Array( ${len} );` );
		} else if ( s.type === 'Float32Array' ) {
			decl.push( `\tconst ${s.name} = new Float32Array( ${len} );` );
		} else {
			decl.push( `\tconst ${s.name} = new Uint8Array( ${len} );` );
		}
	}
	const dom = [];
	for ( const s of specs.filter( ( q ) => q.kind === 'array' && q.dominant ) ) {
		const line = decl.findIndex( ( l ) => l.startsWith( `\tconst ${s.name}Init` ) );
		if ( s.type === 'Complex128Array' && s.refresh ) {
			dom.push( `${s.name}Init[ 2 * j * ( N + 1 ) ] += 20.0 * N;` );
		} else if ( s.type === 'Complex128Array' ) {
			const view = freshExact( s.name + 'View' );
			decl.push( `\tconst ${view} = reinterpret( ${s.name}, 0 );` );
			dom.push( `${view}[ 2 * j * ( N + 1 ) ] += 20.0 * N;` );
		} else {
			dom.push( `${( line >= 0 ) ? s.name + 'Init' : s.name}[ j * ( N + 1 ) ] += 20.0 * N;` );
		}
	}
	const loopVars = [ ( dom.length || uses( /\bj\b/ ) ) ? 'j' : '', uses( /\bk\b/ ) ? 'k' : '' ].filter( Boolean );
	if ( loopVars.length ) {
		decl.push( `\tlet ${loopVars.join( ', ' )};` );
	}
	if ( dom.length ) {
		decl.push( '', '\t// Diagonally dominant, so one call stays finite at every N:', '\tfor ( j = 0; j < N; j++ ) {', ...dom.map( ( l ) => `\t\t${l}` ), '\t}' );
	}
	if ( setup ) {
		decl.push( '', `\t// Structured inputs: ${specs.recipeName}.`, ...setup.map( ( l ) => `\t${l}` ) );
		for ( const s of refreshed ) {
			if ( s.type === 'Complex128Array' ) {
				const view = freshExact( s.name + 'View' );
				const init = fresh( s.name );
				decl.push( `\tconst ${view} = reinterpret( ${s.name}, 0 );`, `\tconst ${init} = ${view}.slice();` );
				restore.push( `${view}.set( ${init} );` );
			} else {
				const init = fresh( s.name );
				decl.push( `\tconst ${init} = ${s.name}.slice();` );
				restore.push( `${s.name}.set( ${init} );` );
			}
		}
	}
	const args = specs.map( ( s ) => {
		if ( s.kind === 'array' || s.kind === 'fn' || s.kind === 'const' ) {
			return ( s.kind === 'fn' ) ? 'select' : s.name;
		}
		return s.cands[ s.idx ].replace( /^N-1$/, 'N - 1' );
	});
	const hasFn = specs.some( ( s ) => s.kind === 'fn' );
	const fnBlock = ( hasFn ) ? [
		'/**',
		'* Eigenvalue selection callback (selects nothing).',
		'*',
		'* @private',
		'* @returns {boolean} boolean',
		'*/',
		'function select() {',
		'\treturn false;',
		'}',
		'',
		''
	].join( '\n' ) : '';
	const loopCheck = ( check ) ? [
		`\t\t\tif ( ${check} ) {`,
		"\t\t\t\tb.fail( 'should not return NaN' );",
		'\t\t\t}'
	].join( '\n' ) + '\n' : '';
	const endCheck = ( check ) ? [
		`\t\tif ( ${check.replace( `i % ${rv}.length`, '0' )} ) {`,
		"\t\t\tb.fail( 'should not return NaN' );",
		'\t\t}'
	].join( '\n' ) + '\n' : '';
	const restoreBlock = ( restore.length ) ? [
		( setup ) ? '\t\t\t// Restore the structured inputs the routine overwrites:' : '\t\t\t// Restore the arrays repeated in-place calls would grow to Inf/NaN:',
		...restore.map( ( l ) => `\t\t\t${l}` )
	].join( '\n' ) + '\n' : '';
	const lets = ( ret === 'void' || ret === 'undefined' ) ? 'let i;' : `let ${rv}, i;`;
	const call = ( ret === 'void' || ret === 'undefined' ) ? `${importName}( ${args.join( ', ' )} );` : `${rv} = ${importName}( ${args.join( ', ' )} );`;
	const max = ( is2d ) ? ( ( /\/lapack\//.test( o.dir ) ) ? 2 : 3 ) : 6;
	const opts = ( needsUniform ) ? "const options = {\n\t'dtype': 'float64'\n};\n" : '';
	return `${( header ) ? header + '\n' : ''}// MODULES //

${imports.join( '\n' )}


// VARIABLES //

const pkg = pkgJson.name;
${opts}

// FUNCTIONS //

${fnBlock}/**
* Creates a benchmark function.
*
* @private
* @param {PositiveInteger} N - problem size
* @returns {Function} benchmark function
*/
function createBenchmark( N ) {
${decl.join( '\n' )}
	return benchmark;

	/**
	* Benchmark function.
	*
	* @private
	* @param {Benchmark} b - benchmark instance
	*/
	function benchmark( b ) {
		${lets}

		b.tic();
		for ( i = 0; i < b.iterations; i++ ) {
${restoreBlock}			${call}
${loopCheck}		}
		b.toc();
${endCheck}		b.pass( 'benchmark finished' );
		b.end();
	}
}


// MAIN //

/**
* Main execution sequence.
*
* @private
*/
function main() {
	let N, f, i;

	const min = 1; // 10^min
	const max = ${max}; // 10^max

	for ( i = min; i <= max; i++ ) {
		N = pow( 10, i );
		f = createBenchmark( N );
		bench( format( '%s:${o.label}N=%d', pkg, N ), f );
	}
}

main();
`;
}

/**
* Returns the leading license comment of a source file, if any.
*
* @param {string} src - source
* @returns {string} header (or empty string)
*/
function licenseHeader( src ) {
	const m = src.match( /^\/\*\*[\s\S]*?\*\// );
	return ( m && /@license/.test( m[ 0 ] ) ) ? m[ 0 ] + '\n' : '';
}

/**
* Processes one benchmark of one module.
*
* @param {string} dir - module dir
* @param {string} kind - 'strided' or 'ndarray'
* @param {boolean} write - whether to write
* @returns {Promise<Object>} result
*/
async function processOne( dir, kind, write ) {
	const routine = basename( dir );
	const libFile = ( kind === 'ndarray' ) ? 'ndarray.js' : `${routine}.js`;
	const libPath = join( dir, 'lib', libFile );
	const benchPath = join( dir, 'benchmark', ( kind === 'ndarray' ) ? 'benchmark.ndarray.js' : 'benchmark.js' );
	if ( !existsSync( libPath ) ) {
		return { 'ok': false, 'error': `missing ${libPath}` };
	}
	const src = readFileSync( libPath, 'utf8' );
	const em = src.match( /export default (\w+);/ );
	const fname = ( em ) ? em[ 1 ] : routine;
	const sig = parseSignature( src, fname );
	if ( !sig ) {
		return { 'ok': false, 'error': `cannot parse signature in ${libPath}` };
	}
	// Fill missing/unhelpful JSDoc types from the sibling files' JSDoc:
	for ( const f of [ 'base.js', 'ndarray.js', `${routine}.js` ] ) {
		const p = join( dir, 'lib', f );
		if ( f === libFile || !existsSync( p ) ) {
			continue;
		}
		const osrc = readFileSync( p, 'utf8' );
		const oem = osrc.match( /export default (\w+);/ );
		const other = parseSignature( osrc, ( oem ) ? oem[ 1 ] : fname );
		if ( !other ) {
			continue;
		}
		for ( const q of sig.params ) {
			const od = other.params.find( ( r ) => r.name === q.name );
			if ( od && /\b[01]-based\b/i.test( od.desc ) && !/\b[01]-based\b/i.test( q.desc ) ) {
				// e.g. the wrapper says "j1 - j1", base.js says "(1-based)":
				q.desc += ' ' + od.desc;
			}
			if ( q.type === 'unknown' || q.type === '*' ) {
				const o = other.params.find( ( r ) => r.name === q.name );
				if ( o && o.type !== 'unknown' && o.type !== '*' ) {
					q.type = o.type;
				}
			}
		}
	}
	const names = sig.params.map( ( p ) => p.name );
	const is2d = names.some( ( n ) => /^LD/i.test( n ) || /^stride\w+[12]$/.test( n ) || /^(A|B)P$|^AFP$/.test( n ) ) || /\/lapack\//.test( dir );
	const literals = harvestStrings( dir );
	sig.band = /^[dz](gb|sb|tb|hb|pb)/.test( routine ) || /^dlan(sb|tb|gb)|^zlan(sb|tb|gb|hb)/.test( routine );
	const specs = buildSpecs( sig, is2d, literals );
	specs.is2d = is2d;
	specs.infoReturn = /integer/i.test( sig.returns ) && /\binfo\b|status/i.test( sig.returnsDesc ) && !/\bindex\b/i.test( sig.returnsDesc );
	specs.fortranPos = {};
	const specFile = resolve( 'spec', routine + '.json' );
	if ( existsSync( specFile ) ) {
		for ( const fp of JSON.parse( readFileSync( specFile, 'utf8' ) ).params || [] ) {
			specs.fortranPos[ fp.position ] = fp.name;
		}
	}
	specs.literals = literals;
	const unknown = specs.filter( ( s ) => s.kind === 'unknown' );
	if ( unknown.length ) {
		return { 'ok': false, 'error': `unsupported param types: ${unknown.map( ( s ) => `${s.name}:${s.type}` ).join( ', ' )}` };
	}
	const mod = await import( pathToFileURL( resolve( libPath ) ).href );
	const recipe = RECIPES.find( ( r ) => r.match( routine ) );
	specs.recipePending = Boolean( recipe );
	let res = probe( mod.default, specs );
	if ( !res.ok ) {
		return res;
	}
	if ( res.pending ) {
		specs.recipePending = false;
		const built = recipe.build( recipeContext( routine, specs ) );
		let why = 'chosen layout does not fit the recipe';
		if ( built ) {
			const producers = {};
			for ( const n of built.producers ) {
				const pdir = [ 'lapack', 'blas' ].map( ( pk ) => resolve( 'lib', pk, 'base', n ) ).find( ( d ) => existsSync( join( d, 'lib', 'ndarray.js' ) ) );
				if ( !pdir ) {
					return { 'ok': false, 'error': `recipe "${recipe.name}": no producer ${n}` };
				}
				producers[ n ] = ( await import( pathToFileURL( join( pdir, 'lib', 'ndarray.js' ) ).href ) ).default;
				producers[ n ].dir = pdir;
			}
			why = installRecipe( mod.default, specs, res.tier, recipe, built, producers );
			specs.producerDirs = Object.fromEntries( Object.entries( producers ).map( ( [ k, f ] ) => [ k, f.dir ] ) );
		}
		res = finish( mod.default, specs, res.tier, materializeAll( specs, PROBE_N, res.tier ) );
		res.recipe = ( why ) ? `${recipe.name}: NOT APPLIED (${why})` : recipe.name;
	}
	if ( write ) {
		const old = ( existsSync( benchPath ) ) ? readFileSync( benchPath, 'utf8' ) : '';
		const header = licenseHeader( old ) || licenseHeader( readFileSync( join( dir, 'lib', 'index.js' ), 'utf8' ) ) || '';
		const out = emit({
			'dir': dir,
			'routine': routine,
			'importPath': `./../lib/${libFile}`,
			'importName': routine,
			'specs': specs,
			'tier': res.tier,
			'is2d': is2d,
			'ret': sig.returns,
			'header': header,
			'label': ( kind === 'ndarray' ) ? 'ndarray:' : ''
		});
		writeFileSync( benchPath, out );
	}
	return res;
}


// MAIN //

const argv = process.argv.slice( 2 );
const write = argv.includes( '--write' );
const km = argv.find( ( a ) => a.startsWith( '--kind=' ) );
const kinds = ( km ) ? [ km.slice( 7 ) ] : [ 'strided', 'ndarray' ];
let failed = 0;
for ( const dir of argv.filter( ( a ) => !a.startsWith( '--' ) ) ) {
	for ( const kind of kinds ) {
		let res;
		try {
			res = await processOne( dir.replace( /\/$/, '' ), kind, write );
		} catch ( e ) {
			res = { 'ok': false, 'error': String( e && e.stack || e ).split( '\n' )[ 0 ] };
		}
		if ( res.ok ) {
			console.log( `ok   ${dir} ${kind}${( res.refreshed && res.refreshed.length ) ? ` (restores: ${res.refreshed.join( ', ' )})` : ''}${( res.dominant && res.dominant.length ) ? ` (dominant: ${res.dominant.join( ', ' )})` : ''}${( res.nonfinite && res.nonfinite.length ) ? ` NONFINITE: ${res.nonfinite.join( ', ' )}` : ''}${( res.info ) ? ` INFO=${res.info}` : ''}${( res.recipe ) ? ` [${res.recipe}]` : ''}` );
		} else {
			failed += 1;
			console.log( `FAIL ${dir} ${kind}: ${res.error}` );
		}
	}
}
process.exitCode = ( failed ) ? 1 : 0;
