/**
* Shared by bin/gen-lwkopt.mjs (records the reference's workspace-query
* optimum) and bin/workspace-optimum.mjs (checks each wrapper's `null`
* allocation against it): CONVENTIONS W6, ticket 0103.
*
* Everything here reads only the specs (spec/<routine>.json, spec/options.json),
* never the Fortran sources (CONVENTIONS T6), so the generator's `--check` and
* the checker both run in CI.
*
* - `routineSet()`: the d/z modules whose spec has a workspace-length argument
*   (role `lwork`). The generator splits it into those whose reference has a
*   workspace query (a test of a workspace length for -1, `LQUERY` or not)
*   and those without.
* - `plan( spec )`: how each Fortran argument enters a query call, or why the
*   routine cannot be swept.
* - `grid( spec )`: the deterministic list of query calls (Fortran name ->
*   value), a sweep of every dimension over a ladder that crosses the blocking
*   thresholds, crossed with every option value.
* - `letters( spec, F )`: an option's Fortran letters and their JS strings.
* - `jsScope`, `evalJs`: evaluate a spec's JS size expressions for a row.
* - `callArgs( spec, pl, row, form, workspace )`: a cache row as the JS
*   argument list of the wrapper (`form` 'strided') or of ndarray.js
*   ('ndarray'), with each workspace from `workspace( param )`.
*/

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { ROOT, moduleDir } from './corpus.mjs';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';

const require = createRequire( import.meta.url );
const specLib = require( '../../lint/lib/spec.cjs' );

// Bump when the grid or the driver changes what a row means; the cache
// records it and `--check` compares.
const GRID_VERSION = 1;

// Dimension ladders, largest first: the first whose grid fits BUDGET calls is
// used (else the last). 33 and 70 cross NB = 32 / 64 and the 1.6x MNTHR
// ratios of the SVD/least-squares drivers; 140 crosses NX = 128.
const LADDERS = [
	[ 0, 1, 2, 5, 33, 70, 140 ],
	[ 0, 1, 5, 33, 70, 140 ],
	[ 0, 1, 33, 70, 140 ],
	[ 0, 5, 33, 140 ],
	[ 1, 33, 140 ]
];
const BUDGET = 800;

// Block sizes the caller chooses (the TSQR/LQ family's MB, NB).
const BLOCKS = [ 1, 8, 40, 150 ];

function nq( v ) {
	return ( v.SIDE === 'L' ) ? v.M : v.N;
}

// Integer/real/logical scalar inputs (and dimensions the reference ties to
// others): candidate values given the row so far (Fortran name -> value;
// options as Fortran letters). A query reads only dimensions and options for
// all of these; the values are ones the argument checks accept.
const SCALARS = {
	'ILO': () => [ 1 ],
	'IHI': ( v, r ) => [ ( /^[dz](ormhr|unmhr)$/.test( r ) ) ? nq( v ) : v.N ],
	'IL': () => [ 1 ],
	'IU': ( v ) => [ v.N ],
	'VL': () => [ 0 ],
	'VU': () => [ 1 ],
	'ABSTOL': () => [ 0 ],
	'RCOND': () => [ -1 ],
	'TOLA': () => [ 0 ],
	'TOLB': () => [ 0 ],
	// dgsvj0/1 (z twins): V has MV rows; the machine constants their caller
	// (dgesvj) passes; TOL > EPS.
	'MV': ( v ) => [ v.N ],
	'EPS': () => [ 1.1102230246251565e-16 ],
	'SFMIN': () => [ 2.2250738585072014e-308 ],
	'TOL': () => [ 1e-8 ],
	// dtgex2: swap the blocks starting at row 1.
	'J1': () => [ 1 ],
	'ITYPE': () => [ 1, 2, 3 ],
	'IJOB': ( v, r ) => ( /tgsen$/.test( r ) ? [ 0, 1, 2, 3, 4, 5 ] : [ 0, 1, 2, 3, 4 ] ),
	'WANTQ': () => [ true, false ],
	'WANTZ': () => [ true, false ],
	'IFST': () => [ 1 ],
	'ILST': ( v ) => [ Math.max( 1, v.N ) ],
	'MB': () => BLOCKS,
	'NB': () => BLOCKS,
	'MB1': () => BLOCKS,
	'NB1': () => BLOCKS,
	'NB2': () => BLOCKS,
	// dorbdb4's P is declared like a dimension.
	'P': null,
	// dorm22: N1 + N2 = NQ.
	'N1': ( v ) => [ Math.floor( nq( v ) / 2 ) ],
	// The dlaqr0/2/3/4 family (and z twins): the active block is the whole
	// matrix (KTOP = ILO = 1, KBOT = IHI = N), Z is updated over all rows,
	// and T/WV get as many columns/rows as the deflation window (NH, NV >= NW).
	// These routines have no INFO checks, so only valid values are given.
	'WANTT': () => [ true, false ],
	'KTOP': () => [ 1 ],
	'ILOZ': () => [ 1 ],
	'IHIZ': ( v ) => [ v.N ],
	'NH': ( v ) => [ Math.max( 1, v.NW ) ],
	'NV': ( v ) => [ Math.max( 1, v.NW ) ],
	// dlaqz4: Schur form / Q / Z wanted; two shifts (one sweep's pair).
	'ILSCHUR': () => [ true, false ],
	'ILQ': () => [ true, false ],
	'ILZ': () => [ true, false ],
	'NSHIFTS': () => [ 2 ]
};

// Dimensions fixed by others rather than swept.
const DERIVED = {
	// dtgsna, dtrevc3: the number of columns of VL/VR, >= M <= N.
	'MM': ( v ) => [ v.N ],
	// dorm22: N2 = NQ - N1.
	// dtgex2: the two diagonal blocks swapped, each 1x1 or 2x2.
	'N1': () => [ 1, 2 ],
	'N2': ( v, r ) => ( /^[dz]tgex2$/.test( r ) ? [ 1, 2 ] : [ nq( v ) - v.N1 ] ),
	// dgsvj0/1: one sweep.
	'NSWEEP': () => [ 1 ],
	// dlaqr0/4 declare IHI, dlaqr2/3 KBOT, like a dimension: the last row of
	// the active block, here the whole matrix.
	'IHI': ( v ) => [ v.N ],
	'KBOT': ( v ) => [ v.N ],
	// dlaqr2/3: the deflation window (>= 1; JW = MIN( NW, KBOT-KTOP+1 )).
	'NW': () => [ 1, 5, 33, 70, 140 ],
	// dlaqz4: the block size its caller asks for (>= 1).
	'NBLOCK_DESIRED': () => [ 1, 5, 33, 70, 140 ]
};

// DERIVED entries that apply only to some routines (dgsvj1's N1 is swept).
const DERIVED_ONLY = {
	'N1': /^[dz]tgex2$/
};

let OPTIONS = null;

function family( routine, F ) {
	if ( OPTIONS === null ) {
		OPTIONS = JSON.parse( fs.readFileSync( path.join( ROOT, 'spec', 'options.json' ), 'utf8' ) ).families;
	}
	return OPTIONS.find( ( f ) => f.params.includes( F ) && ( !f.routines || new RegExp( f.routines ).test( routine ) ) ) || null;
}

/**
* An option's Fortran letters with their JS strings: the spec's enum check
* (what the reference accepts, letter by letter), else the option family
* (spec/options.json; one letter per JS string). Null when neither exists.
*/
function letters( spec, F ) {
	const c = ( spec.checks || [] ).find( ( x ) => x.kind === 'enum' && x.param === F && x.fortranValues && x.values );
	if ( c && c.fortranValues.length === c.values.length ) {
		return c.fortranValues.split( '' ).map( ( L, i ) => ( { 'letter': L, 'js': c.values[ i ] } ) );
	}
	const fam = family( spec.routine, F );
	if ( !fam ) {
		return null;
	}
	const seen = new Set();
	const out = [];
	Object.keys( fam.values ).forEach( ( L ) => {
		if ( !seen.has( fam.values[ L ] ) ) {
			seen.add( fam.values[ L ] );
			out.push( { 'letter': L, 'js': fam.values[ L ] } );
		}
	});
	return out;
}

/**
* How each Fortran argument enters a query call:
*
* - `flag`: swept over its letters; `dim`: swept over the ladder;
* - `derived`/`scalar`: from DERIVED / SCALARS; `inc`: 1;
* - `ld`: max( 1, rows of its matrix ), evaluated from the spec's JS rows
*   expression (else the largest dimension of the row);
* - `select`: a logical SELECT vector, swept over the number of leading
*   `.TRUE.` entries (0, 1, N/2, N): dtrsen/dtgsen count the selected
*   eigenvalues in their query, so it reads this data; the matrices are zero,
*   so no 2x2 block pairs a selected eigenvalue with its neighbour;
* - `lwork`: -1 (the query), and the workspace it names is reported;
* - `array`, `out`, `function`, `info`: buffers, outputs, a dummy SELECT
*   function, INFO.
*
* Returns { params: [ { p, kind, ... } ], queries: [ workspace names ] }, or
* { error } naming what the sweep cannot handle.
*/
function plan( spec ) {
	const out = [];
	const queries = [];
	for ( const p of spec.params ) {
		const F = p.fortran;
		const e = { 'p': p, 'kind': null };
		if ( p.role === 'flag' ) {
			if ( p.intent !== 'in' ) {
				return { 'error': 'option ' + F + ' is not an input' };
			}
			e.kind = 'flag';
			e.letters = letters( spec, F );
			if ( !e.letters || !e.letters.length ) {
				return { 'error': 'no Fortran letters known for option ' + F };
			}
		} else if ( p.role === 'dim' ) {
			e.kind = ( F in DERIVED && !( F in DERIVED_ONLY && !DERIVED_ONLY[ F ].test( spec.routine ) ) ) ? 'derived' : 'dim';
		} else if ( p.role === 'scalar' && p.dtype === 'function' ) {
			e.kind = 'function';
		} else if ( p.role === 'scalar' && p.intent === 'out' ) {
			e.kind = 'out';
		} else if ( p.role === 'scalar' ) {
			if ( !( F in SCALARS ) ) {
				return { 'error': 'no sweep values for scalar input ' + F };
			}
			e.kind = ( SCALARS[ F ] === null ) ? 'dim' : 'scalar';
		} else if ( p.role === 'inc' ) {
			// dorbdb5/6's INCX1, INCX2: unit strides.
			e.kind = 'inc';
		} else if ( p.role === 'ld' ) {
			e.kind = 'ld';
		} else if ( p.role === 'lwork' ) {
			e.kind = 'lwork';
			queries.push( p.of );
		} else if ( p.role === 'info' ) {
			e.kind = 'info';
		} else if ( p.role === 'vector' && p.dtype === 'bool' && p.intent !== 'out' ) {
			if ( F !== 'SELECT' ) {
				return { 'error': 'logical input vector ' + F + ' is not SELECT' };
			}
			e.kind = 'select';
		} else if ( [ 'matrix', 'banded', 'vector', 'index', 'workspace', 'packed' ].includes( p.role ) ) {
			e.kind = 'array';
		} else {
			return { 'error': 'unhandled parameter ' + F + ' (role ' + p.role + ', dtype ' + p.dtype + ')' };
		}
		out.push( e );
	}
	if ( !queries.length ) {
		return { 'error': 'no workspace-length argument' };
	}
	return { 'params': out, 'queries': queries };
}

/**
* The JS scope of a row: each spec param's JS name -> its value (options as
* JS strings), for evaluating the spec's JS size expressions.
*/
function jsScope( spec, pl, row ) {
	const s = {};
	pl.params.forEach( ( e ) => {
		const F = e.p.fortran;
		if ( !( F in row ) ) {
			return;
		}
		if ( e.kind === 'flag' ) {
			const m = e.letters.find( ( x ) => x.letter === row[ F ] );
			s[ e.p.name ] = m ? m.js : row[ F ];
		} else {
			s[ e.p.name ] = row[ F ];
		}
	});
	return s;
}

const fnMemo = new Map();

/**
* Evaluates a spec JS expression (`max( 1, M )`, `side === 'left' ? M : N`)
* in `scope`; NaN when it is absent or names something the row lacks.
*/
function evalJs( expr, scope ) {
	if ( typeof expr !== 'string' || !expr ) {
		return NaN;
	}
	const names = Object.keys( scope ).sort();
	const key = expr + '\0' + names.join( ',' );
	let fn = fnMemo.get( key );
	if ( fn === void 0 ) {
		try {
			fn = new Function( 'max', 'min', 'ceil', 'floor', ...names, '"use strict"; return ( ' + expr + ' );' ); // eslint-disable-line no-new-func
		} catch ( e ) {
			fn = null;
		}
		fnMemo.set( key, fn );
	}
	if ( !fn ) {
		return NaN;
	}
	try {
		const v = fn( Math.max, Math.min, Math.ceil, Math.floor, ...names.map( ( n ) => scope[ n ] ) );
		return ( typeof v === 'number' && Number.isFinite( v ) ) ? v : NaN;
	} catch ( e ) {
		return NaN;
	}
}

function maxDim( pl, row ) {
	let m = 1;
	pl.params.forEach( ( e ) => {
		if ( ( e.kind === 'dim' || e.kind === 'derived' ) && typeof row[ e.p.fortran ] === 'number' ) {
			m = Math.max( m, row[ e.p.fortran ] );
		}
	});
	return m;
}

/**
* The leading dimension of each matrix for a row: max( 1, rows ), rows from
* the spec's JS expression, else the row's largest dimension.
*/
function leadingDims( spec, pl, row ) {
	const scope = jsScope( spec, pl, row );
	const out = {};
	pl.params.forEach( ( e ) => {
		if ( e.kind !== 'ld' ) {
			return;
		}
		const m = spec.params.find( ( q ) => q.fortran === e.p.of || q.name === e.p.of );
		let rows = m && m.rows ? evalJs( m.rows.js, scope ) : NaN;
		if ( Number.isNaN( rows ) ) {
			rows = maxDim( pl, row );
		}
		out[ e.p.fortran ] = Math.max( 1, rows );
	});
	return out;
}

function expand( spec, pl, ladder ) {
	const r = spec.routine;
	let rows = [ {} ];
	const step = ( fn ) => {
		const next = [];
		rows.forEach( ( v ) => fn( v ).forEach( ( x ) => next.push( x ) ) );
		rows = next;
	};
	const set = ( v, k, x ) => Object.assign( {}, v, { [ k ]: x } );
	pl.params.filter( ( e ) => e.kind === 'flag' ).forEach( ( e ) => step( ( v ) => e.letters.map( ( L ) => set( v, e.p.fortran, L.letter ) ) ) );
	pl.params.filter( ( e ) => e.kind === 'dim' ).forEach( ( e ) => step( ( v ) => ladder.map( ( n ) => set( v, e.p.fortran, n ) ) ) );
	pl.params.filter( ( e ) => e.kind === 'scalar' || e.kind === 'derived' ).forEach( ( e ) => {
		const fn = ( e.kind === 'scalar' ) ? SCALARS[ e.p.fortran ] : DERIVED[ e.p.fortran ];
		step( ( v ) => fn( v, r ).map( ( x ) => set( v, e.p.fortran, x ) ) );
	});
	pl.params.filter( ( e ) => e.kind === 'inc' ).forEach( ( e ) => step( ( v ) => [ set( v, e.p.fortran, 1 ) ] ) );
	pl.params.filter( ( e ) => e.kind === 'select' ).forEach( ( e ) => step( ( v ) => {
		const n = v.N;
		return [ ...new Set( [ 0, Math.min( 1, n ), Math.floor( n / 2 ), n ] ) ].map( ( k ) => set( v, e.p.fortran, k ) );
	}) );
	return rows.map( ( v ) => Object.assign( v, leadingDims( spec, pl, v ) ) );
}

/**
* The query calls for a routine, deterministic from its spec:
* { args: [ Fortran names, in argument order ], calls: [ [ values ] ], ladder, hash }.
*/
function grid( spec ) {
	const pl = plan( spec );
	if ( pl.error ) {
		return { 'error': pl.error };
	}
	let rows = null;
	let ladder = null;
	for ( const L of LADDERS ) {
		ladder = L;
		rows = expand( spec, pl, L );
		if ( rows.length <= BUDGET ) {
			break;
		}
	}
	const args = pl.params.filter( ( e ) => [ 'flag', 'dim', 'derived', 'scalar', 'inc', 'ld', 'select' ].includes( e.kind ) ).map( ( e ) => e.p.fortran );
	const calls = rows.map( ( v ) => args.map( ( a ) => v[ a ] ) );
	const hash = createHash( 'sha256' ).update( JSON.stringify( { 'v': GRID_VERSION, 'args': args, 'queries': pl.queries, 'calls': calls } ) ).digest( 'hex' ).slice( 0, 16 );
	return { 'plan': pl, 'args': args, 'queries': pl.queries, 'calls': calls, 'ladder': ladder, 'hash': hash };
}

/**
* The d/z routines with a module and a spec that has a workspace-length
* argument (role `lwork`), sorted.
*/
function routineSet() {
	return fs.readdirSync( path.join( ROOT, 'spec' ) )
		.filter( ( f ) => /^[dz].*\.json$/.test( f ) )
		.map( ( f ) => f.slice( 0, -5 ) )
		.filter( ( r ) => moduleDir( r ) && fs.existsSync( path.join( moduleDir( r ), 'lib', r + '.js' ) ) )
		.filter( ( r ) => ( specLib.load( r ).params || [] ).some( ( p ) => p.role === 'lwork' ) )
		.sort();
}

const CTOR = {
	'float64': Float64Array,
	'complex128': Complex128Array,
	'int32': Int32Array,
	'bool': Uint8Array
};

function jsArray( p, n ) {
	const C = CTOR[ p.dtype ];
	if ( !C ) {
		throw new Error( 'no JS array type for ' + p.fortran + ' (' + p.dtype + ')' );
	}
	return new C( n );
}

/**
* The JS argument list for one cache row (`vals`: Fortran name -> value):
* the spec's `strided` projection (the wrapper, `form` 'strided') or its
* `ndarray` projection (ndarray.js, `form` 'ndarray'), lint/lib/spec.cjs.
* Column-major, the row's leading dimensions, unit strides, offsets 0,
* zero-filled arrays of the sizes the spec gives, options translated from
* the Fortran letters to the JS strings. Each workspace is
* `workspace( param, ld )` (null for the wrapper's auto-allocation, or an
* array).
*/
function callArgs( spec, pl, vals, form, workspace ) {
	const nd = ( form === 'ndarray' );
	const scope = jsScope( spec, pl, vals );
	const big = maxDim( pl, vals );
	const kinds = new Map( pl.params.map( ( e ) => [ e.p.fortran, e ] ) );
	const size = ( expr, fallback ) => {
		const n = evalJs( expr, scope );
		return Math.max( 1, Number.isNaN( n ) ? fallback : n );
	};
	const out = ( !nd && specLib.takesOrder( spec ) ) ? [ 'column-major' ] : [];
	specLib.baseGroups( spec ).forEach( ( g ) => {
		const p = g.param;
		const e = kinds.get( p.fortran );
		if ( g.names.length === 4 ) {
			const ld = ( p.ld && vals[ p.ld ] !== void 0 ) ? vals[ p.ld ] : Math.max( 1, big );
			const a = ( p.role === 'workspace' ) ? workspace( p, ld ) : jsArray( p, ld * size( p.cols && p.cols.js, big ) );
			if ( nd ) {
				out.push( a, 1, ld, 0 );
			} else {
				out.push( a, ld );
			}
		} else if ( g.names.length === 3 ) {
			if ( p.role === 'workspace' ) {
				out.push( workspace( p ) );
				if ( nd ) {
					out.push( 1, 0 );
				}
				return;
			}
			const a = jsArray( p, size( p.length && p.length.js, 2 * big + 10 ) );
			if ( e.kind === 'select' ) {
				a.fill( 1, 0, Math.min( a.length, vals[ p.fortran ] ) );
			}
			if ( nd ) {
				out.push( a, 1, 0 );
			} else if ( p.role === 'packed' && p.format === 'packed' ) {
				out.push( a );
			} else {
				out.push( a, 1 );
			}
		} else if ( g.names.length === 2 ) {
			out.push( jsArray( p, 1 ) );
			if ( nd ) {
				out.push( 0 );
			}
		} else if ( g.names.length === 1 ) {
			switch ( e.kind ) {
			case 'flag':
				out.push( scope[ p.name ] );
				break;
			case 'dim':
			case 'derived':
			case 'scalar': {
				// A scalar index the JS takes 0-based is marked `base: 0` (S10).
				const x = vals[ p.fortran ] - ( ( p.base === 0 ) ? 1 : 0 );
				out.push( ( p.intent === 'in' ) ? x : jsArray( p, 1 ).fill( x ) );
				break;
			}
			case 'out':
				out.push( jsArray( p, 1 ) );
				break;
			case 'function':
				out.push( () => false );
				break;
			case 'info':
				out.push( 0 );
				break;
			default:
				throw new Error( 'no ' + form + ' argument for ' + p.fortran + ' (' + e.kind + ')' );
			}
		}
	});
	return out;
}

const CACHE_FILE = path.join( ROOT, 'data', 'fortran-lwkopt.json' );

export { GRID_VERSION, CACHE_FILE, specLib, plan, grid, letters, jsScope, evalJs, maxDim, routineSet, jsArray, callArgs };
