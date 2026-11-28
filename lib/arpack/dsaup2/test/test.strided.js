/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgetrf from '../../../lapack/dgetrf/lib/base.js';
import dgetrs from '../../../lapack/dgetrs/lib/base.js';
import dsygv from '../../../lapack/dsygv/lib/base.js';
import { importWithDependencies } from '../../../../test/harness/constants.js';
import dsaup2 from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsaup2.f90);
// regenerate with `./test/run_fortran.sh arpack dsaup2`.
const fixtureURL = new URL( '../../../../test/fixtures/dsaup2.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

function lap( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = 2.0;
		if ( i < n - 1 ) {
			a[ i + ( ( i + 1 ) * n ) ] = -1.0;
			a[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	return a;
}

function dense( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 1; i <= n; i++ ) {
		a[ ( i - 1 ) + ( ( i - 1 ) * n ) ] = i;
		if ( i < n ) {
			a[ ( i - 1 ) + ( i * n ) ] = 0.5;
			a[ i + ( ( i - 1 ) * n ) ] = 0.5;
		}
	}
	return a;
}

const INPUTS = {
	'LM_n10_nev3_np3': { n: 10, which: 'LM', nev: 3, np: 3, A: lap( 10 ) },
	'SA_n10_nev4_np4': { n: 10, which: 'SA', nev: 4, np: 4, A: lap( 10 ) },
	'LA_n8_nev2_np4': { n: 8, which: 'LA', nev: 2, np: 4, A: dense( 8 ) }
};

const LD = 12;
const TOL = 1e-10;


// FUNCTIONS //

function run( inp ) {
	const n = inp.n;
	const A = inp.A;
	const kplusp = inp.nev + inp.np;
	const resid = new Float64Array( n );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const V = new Float64Array( LD * kplusp );
	const H = new Float64Array( LD * 2 );
	const Q = new Float64Array( LD * kplusp );
	const ritz = new Float64Array( kplusp );
	const bounds = new Float64Array( kplusp );
	const workl = new Float64Array( 3 * kplusp );
	const workd = new Float64Array( 3 * n );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const nev = new Int32Array( [ inp.nev ] );
	const np = new Int32Array( [ inp.np ] );
	const mxiter = new Int32Array( [ 100 ] );
	const state = {};
	let info = 1;
	let guard = 0;
	while ( guard++ < 100000 ) {
		info = dsaup2( state, ido, 'standard', n, inp.which, nev, np, 0.0, resid, 1, 0, 1, 1, 1, mxiter, V, 1, LD, 0, H, 1, LD, 0, ritz, 1, 0, bounds, 1, 0, Q, 1, LD, 0, workl, 1, 0, ipntr, 1, 0, workd, 1, 0, info );
		if ( ido[ 0 ] === 99 ) {
			break;
		}
		const p = ipntr[ 0 ];
		const q = ipntr[ 1 ];
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else if ( ido[ 0 ] === 2 ) {
			for ( let r = 0; r < n; r++ ) {
				workd[ q + r ] = workd[ p + r ];
			}
		} else {
			break;
		}
	}
	return { ritz, bounds, nconv: nev[ 0 ], mxiter: mxiter[ 0 ], info };
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsaup2: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.ritz.length; i++ ) {
			assert.ok( close( out.ritz[ i ], tc.ritz[ i ] ), 'ritz[' + i + ']: expected ' + tc.ritz[ i ] + ', got ' + out.ritz[ i ] );
		}
		for ( let i = 0; i < tc.bounds.length; i++ ) {
			assert.ok( close( out.bounds[ i ], tc.bounds[ i ] ), 'bounds[' + i + ']' );
		}
	});
}


// PROPERTY TESTS (independent oracle: LAPACK dsygv on the dense pencil) //

/**
* Returns a column-major symmetric tridiagonal matrix with constant diagonal `a` and off-diagonal `b`, scaled by `s`.
*
* @private
* @param {PositiveInteger} n - order
* @param {number} a - diagonal value
* @param {number} b - off-diagonal value
* @param {number} s - scale factor
* @returns {Float64Array} matrix
*/
function tridiag( n, a, b, s ) {
	const out = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		out[ ( i * n ) + i ] = a * s;
		if ( i > 0 ) {
			out[ ( i * n ) + i - 1 ] = b * s;
			out[ ( ( i - 1 ) * n ) + i ] = b * s;
		}
	}
	return out;
}

/**
* Computes `y = alpha*A*x + beta*y` for a dense column-major `n`-by-`n` matrix.
*
* @private
* @param {PositiveInteger} n - order
* @param {number} alpha - scalar
* @param {Float64Array} A - matrix
* @param {Float64Array} x - input vector
* @param {NonNegativeInteger} ox - offset of `x`
* @param {number} beta - scalar
* @param {Float64Array} y - output vector
* @param {NonNegativeInteger} oy - offset of `y`
*/
function gemv( n, alpha, A, x, ox, beta, y, oy ) {
	const tmp = new Float64Array( n );
	for ( let j = 0; j < n; j++ ) {
		for ( let i = 0; i < n; i++ ) {
			tmp[ i ] += A[ ( j * n ) + i ] * x[ ox + j ];
		}
	}
	for ( let i = 0; i < n; i++ ) {
		y[ oy + i ] = ( alpha * tmp[ i ] ) + ( ( beta === 0.0 ) ? 0.0 : beta * y[ oy + i ] );
	}
}

/**
* Returns all eigenvalues (ascending) of the pencil `(A, B)` computed independently with LAPACK `dsygv`.
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - symmetric matrix
* @param {Float64Array} B - symmetric positive definite matrix
* @returns {Float64Array} eigenvalues
*/
function pencilEigenvalues( n, A, B ) {
	const w = new Float64Array( n );
	const info = dsygv( 1, 'no-vectors', 'upper', n, A.slice(), 1, n, 0, B.slice(), 1, n, 0, w, 1, 0, new Float64Array( 64 * n ), 1, 0 );
	assert.strictEqual( info, 0, 'dsygv succeeds' );
	return w;
}

/**
* Returns the eigenvalues `lambda` of `w` that ARPACK selects with `which` applied to the spectral transform `nu = op( lambda )`, sorted ascending.
*
* @private
* @param {Float64Array} w - eigenvalues of the original pencil
* @param {Function} op - spectral transformation
* @param {string} which - selection code
* @param {PositiveInteger} k - count
* @returns {Array} selected eigenvalues
*/
function wanted( w, op, which, k ) {
	const asc = Array.from( w ).sort( ( a, b ) => op( a ) - op( b ) );
	let out;
	if ( which === 'LM' ) {
		out = Array.from( w ).sort( ( a, b ) => Math.abs( op( b ) ) - Math.abs( op( a ) ) ).slice( 0, k );
	} else if ( which === 'SM' ) {
		out = Array.from( w ).sort( ( a, b ) => Math.abs( op( a ) ) - Math.abs( op( b ) ) ).slice( 0, k );
	} else if ( which === 'LA' ) {
		out = asc.slice( asc.length - k );
	} else if ( which === 'SA' ) {
		out = asc.slice( 0, k );
	} else {
		// 'BE': floor(k/2) from the low end, the rest from the high end.
		out = asc.slice( 0, Math.floor( k / 2 ) ).concat( asc.slice( asc.length - ( k - Math.floor( k / 2 ) ) ) );
	}
	return out.sort( ( a, b ) => a - b );
}

/**
* Maps a Ritz value `nu` of OP back to an eigenvalue `lambda` of the original pencil (as `dseupd` does).
*
* @private
* @param {integer} mode - ARPACK mode
* @param {number} sigma - shift
* @param {number} nu - Ritz value of OP
* @returns {number} eigenvalue
*/
function untransform( mode, sigma, nu ) {
	if ( mode === 3 ) {
		return sigma + ( 1.0 / nu );
	}
	if ( mode === 4 ) {
		return sigma * nu / ( nu - 1.0 );
	}
	if ( mode === 5 ) {
		return sigma * ( nu + 1.0 ) / ( nu - 1.0 );
	}
	return nu;
}

/**
* Drives the full `dsaup2` reverse-communication loop for `A*x = lambda*M*x` (with `M = I` when `bmat` is `'standard'`) in the given ARPACK mode, using dense operators solved with `dgetrf`/`dgetrs`.
*
* @private
* @param {Object} opts - options
* @returns {Object} results
*/
function drive( opts ) {
	const A = opts.A;
	const n = Math.round( Math.sqrt( A.length ) );
	const M = opts.M;
	const mode = opts.mode || 1;
	const bmat = opts.bmat || 'standard';
	const sigma = opts.sigma || 0.0;
	const ishift = ( opts.ishift === void 0 ) ? 1 : opts.ishift;
	const kplusp = opts.nev + opts.np;
	const resid = new Float64Array( n );
	const V = new Float64Array( n * kplusp );
	const H = new Float64Array( kplusp * 2 );
	const Q = new Float64Array( kplusp * kplusp );
	const ritz = new Float64Array( kplusp );
	const bounds = new Float64Array( kplusp );
	const workl = new Float64Array( 3 * kplusp );
	const workd = new Float64Array( 3 * n );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const nev = new Int32Array( [ opts.nev ] );
	const np = new Int32Array( [ opts.np ] );
	const mxiter = new Int32Array( [ opts.mxiter || 300 ] );
	const ipiv = new Int32Array( n );
	const state = {};
	let nshift = 0;
	let info = opts.info || 0;
	if ( opts.resid ) {
		resid.set( opts.resid );
	}

	// Factor F: M (mode 2), A - sigma*I (mode 3, standard), or A - sigma*M (modes 3-5, generalized):
	let F = null;
	if ( mode === 2 ) {
		F = M.slice();
	} else if ( mode >= 3 ) {
		F = A.slice();
		for ( let k = 0; k < n * n; k++ ) {
			F[ k ] -= sigma * ( ( bmat === 'standard' ) ? ( ( k % ( n + 1 ) === 0 ) ? 1.0 : 0.0 ) : M[ k ] );
		}
	}
	if ( F ) {
		assert.strictEqual( dgetrf( n, n, F, 1, n, 0, ipiv, 1, 0 ), 0, 'operator factorization succeeds' );
	}
	const fsolve = ( oy ) => dgetrs( 'no-transpose', n, 1, F, 1, n, 0, ipiv, 1, 0, workd, 1, n, oy );

	for ( let it = 0; it < 100000; it++ ) {
		info = dsaup2( state, ido, bmat, n, opts.which, nev, np, 0.0, resid, 1, 0, mode, 1, ishift, mxiter, V, 1, n, 0, H, 1, kplusp, 0, ritz, 1, 0, bounds, 1, 0, Q, 1, kplusp, 0, workl, 1, 0, ipntr, 1, 0, workd, 1, 0, info );
		const ox = ipntr[ 0 ];
		const oy = ipntr[ 1 ];
		const ob = ipntr[ 2 ];
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			if ( mode === 1 ) {
				gemv( n, 1.0, A, workd, ox, 0.0, workd, oy );
			} else if ( mode === 2 ) {
				gemv( n, 1.0, A, workd, ox, 0.0, workd, oy );
				workd.copyWithin( ox, oy, oy + n );
				fsolve( oy );
			} else if ( mode === 3 && bmat === 'standard' ) {
				workd.copyWithin( oy, ox, ox + n );
				fsolve( oy );
			} else if ( mode === 3 || mode === 4 ) {
				if ( ido[ 0 ] === -1 ) {
					gemv( n, 1.0, ( mode === 3 ) ? M : A, workd, ox, 0.0, workd, oy );
				} else {
					workd.copyWithin( oy, ob, ob + n );
				}
				fsolve( oy );
			} else {
				// Cayley: y = inv(A - sigma*M) * (A + sigma*M) * x
				if ( ido[ 0 ] === -1 ) {
					gemv( n, sigma, M, workd, ox, 0.0, workd, oy );
				} else {
					for ( let i = 0; i < n; i++ ) {
						workd[ oy + i ] = sigma * workd[ ob + i ];
					}
				}
				gemv( n, 1.0, A, workd, ox, 1.0, workd, oy );
				fsolve( oy );
			}
		} else if ( ido[ 0 ] === 2 ) {
			gemv( n, 1.0, ( mode === 4 ) ? A : M, workd, ox, 0.0, workd, oy );
		} else if ( ido[ 0 ] === 3 ) {
			// User-supplied shifts: the unwanted Ritz values (the exact shifts), which dsgets places first in ritz:
			nshift += 1;
			for ( let k = 0; k < np[ 0 ]; k++ ) {
				workl[ k ] = ritz[ k ];
			}
		} else {
			break;
		}
	}
	return {
		'info': info,
		'ido': ido[ 0 ],
		'nconv': nev[ 0 ],
		'np': np[ 0 ],
		'iter': mxiter[ 0 ],
		'nshift': nshift,
		'lambda': Array.from( ritz.subarray( 0, Math.max( nev[ 0 ], 0 ) ) ).map( ( nu ) => untransform( mode, sigma, nu ) ).sort( ( a, b ) => a - b )
	};
}

/**
* Asserts that computed eigenvalues match the expected eigenvalues to 1e-10 relative.
*
* @private
* @param {Array} got - computed
* @param {Array} expected - expected
*/
function assertValues( got, expected ) {
	assert.strictEqual( got.length, expected.length, 'number of converged Ritz values' );
	for ( let i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( got[ i ] - expected[ i ] ) <= 1e-10 * Math.max( 1.0, Math.abs( expected[ i ] ) ), 'lambda[' + i + '] = ' + got[ i ] + ' matches ' + expected[ i ] );
	}
}

const NM = 12;
const DENSE = dense( NM );
const LAP = tridiag( NM, 2.0, -1.0, 1.0 );
const MASS = tridiag( NM, 4.0, 1.0, 1.0 / 6.0 );
const EYE = tridiag( NM, 1.0, 0.0, 1.0 );
const W_DENSE = pencilEigenvalues( NM, DENSE, EYE );
const W_STD = pencilEigenvalues( NM, LAP, EYE );
const W_GEN = pencilEigenvalues( NM, LAP, MASS );
const IDENT = ( x ) => x;

for ( const which of [ 'LM', 'SM', 'LA', 'SA', 'BE' ] ) for ( const nev of [ 3, 4 ] ) {
	test( 'dsaup2: mode 1, which = ' + which + ', nev = ' + nev + ' converges to the wanted eigenvalues (vs dsygv)', function t() {
		const out = drive({
			'A': DENSE,
			'which': which,
			'nev': nev,
			'np': 4
		});
		assert.strictEqual( out.info, 0, 'info is 0' );
		assert.strictEqual( out.ido, 99, 'ido is 99' );
		assert.strictEqual( out.nconv, nev, 'all wanted Ritz values converged' );
		assertValues( out.lambda, wanted( W_DENSE, IDENT, which, nev ) );
	});
}

const MODES = [
	{ 'name': 'mode 3 (standard shift-invert)', 'mode': 3, 'bmat': 'standard', 'sigma': 0.6, 'M': EYE, 'w': W_STD, 'op': ( x ) => 1.0 / ( x - 0.6 ) },
	{ 'name': 'mode 2 (generalized regular inverse)', 'mode': 2, 'bmat': 'generalized', 'sigma': 0.0, 'M': MASS, 'w': W_GEN, 'op': IDENT },
	{ 'name': 'mode 3 (generalized shift-invert)', 'mode': 3, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'w': W_GEN, 'op': ( x ) => 1.0 / ( x - 1.0 ) },
	{ 'name': 'mode 4 (buckling)', 'mode': 4, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'w': W_GEN, 'op': ( x ) => x / ( x - 1.0 ) },
	{ 'name': 'mode 5 (Cayley)', 'mode': 5, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'w': W_GEN, 'op': ( x ) => ( x + 1.0 ) / ( x - 1.0 ) }
];

for ( const mc of MODES ) {
	test( 'dsaup2: ' + mc.name + ' converges to the eigenvalues of A*x = lambda*M*x nearest the transform (vs dsygv)', function t() {
		const out = drive({
			'A': LAP,
			'M': mc.M,
			'mode': mc.mode,
			'bmat': mc.bmat,
			'sigma': mc.sigma,
			'which': 'LM',
			'nev': 3,
			'np': 5
		});
		assert.strictEqual( out.info, 0, 'info is 0' );
		assert.strictEqual( out.nconv, 3, 'all wanted Ritz values converged' );
		assertValues( out.lambda, wanted( mc.w, mc.op, 'LM', 3 ) );
	});
}

test( 'dsaup2: ishift = 0 requests user shifts (ido = 3); supplying the exact shifts converges to the same eigenvalues', function t() {
	const out = drive({
		'A': DENSE,
		'which': 'LA',
		'nev': 3,
		'np': 4,
		'ishift': 0
	});
	assert.strictEqual( out.info, 0, 'info is 0' );
	assert.ok( out.nshift > 0, 'ido = 3 was requested (' + out.nshift + ' times)' );
	assert.strictEqual( out.nshift, out.iter - 1, 'one shift request per restart' );
	assert.strictEqual( out.nconv, 3, 'all wanted Ritz values converged' );
	assertValues( out.lambda, wanted( W_DENSE, IDENT, 'LA', 3 ) );
});

for ( const np of [ 6, 3 ] ) {
	test( 'dsaup2: nev = 1 with ncv = ' + ( np + 1 ) + ' (stagnation guard widens nev) converges to the smallest eigenvalue', function t() {
		const out = drive({
			'A': DENSE,
			'which': 'SM',
			'nev': 1,
			'np': np
		});
		assert.strictEqual( out.info, 0, 'info is 0' );
		assert.strictEqual( out.nconv, 1, 'the wanted Ritz value converged' );
		assertValues( out.lambda, wanted( W_DENSE, IDENT, 'SM', 1 ) );
	});
}

test( 'dsaup2: returns info = 1 when the iteration limit is reached', function t() {
	const out = drive({
		'A': DENSE,
		'which': 'SM',
		'nev': 3,
		'np': 4,
		'mxiter': 1
	});
	assert.strictEqual( out.info, 1, 'info is 1' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );

	// As in the reference, the loop exits once ITER > MXITER, and MXITER returns ITER:
	assert.strictEqual( out.iter, 2, 'mxiter returns the number of iterations taken' );
	assert.ok( out.nconv < 3, 'fewer than nev Ritz values converged (' + out.nconv + ')' );
});

test( 'dsaup2: returns info = -9 for a zero user-supplied starting vector', function t() {
	const out = drive({
		'A': DENSE,
		'which': 'LM',
		'nev': 3,
		'np': 4,
		'info': 1,
		'resid': new Float64Array( NM )
	});
	assert.strictEqual( out.info, -9, 'info is -9' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	assert.strictEqual( out.iter, 300, 'mxiter is untouched' );
});

test( 'dsaup2: returns info = 2 when no shifts can be applied (starting vector in an invariant subspace)', function t() {
	// A = diag(1..10); resid = e1 + e2 spans an invariant subspace, so the Lanczos tridiagonal splits and the two unwanted Ritz values (1 and 2) have zero Ritz estimates:
	const n = 10;
	const D = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		D[ i * ( n + 1 ) ] = i + 1;
	}
	const resid = new Float64Array( n );
	resid[ 0 ] = 1.0;
	resid[ 1 ] = 1.0;
	const out = drive({
		'A': D,
		'which': 'LA',
		'nev': 1,
		'np': 2,
		'info': 1,
		'resid': resid
	});
	assert.strictEqual( out.info, 2, 'info is 2' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	assert.strictEqual( out.nconv, 0, 'no Ritz value converged' );
	assert.strictEqual( out.iter, 1, 'stopped after the first iteration' );
});


// CALLEE-FAILURE TESTS //

/**
* Imports `dsaup2` with the given callees replaced (test/harness/constants.js `importWithDependencies`).
*
* @private
* @param {Object<string, Function>} deps - replacement callees
* @returns {Promise<Function>} dsaup2
*/
async function dsaup2With( deps ) {
	const m = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), deps );
	return m.default;
}

/**
* Runs the mode-1 reverse-communication loop of the given `dsaup2` on `DENSE` with a user-supplied starting vector.
*
* @private
* @param {Function} fcn - dsaup2 implementation
* @returns {Object} results
*/
function driveWith( fcn ) {
	const kplusp = 7;
	const resid = new Float64Array( NM ).fill( 1.0 );
	const workd = new Float64Array( 3 * NM );
	const ipntr = new Int32Array( 3 );
	const ido = new Int32Array( 1 );
	const nev = new Int32Array( [ 3 ] );
	const np = new Int32Array( [ 4 ] );
	const mxiter = new Int32Array( [ 300 ] );
	const state = {};
	let info = 1;
	for ( let it = 0; it < 10000; it++ ) {
		info = fcn( state, ido, 'standard', NM, 'LM', nev, np, 0.0, resid, 1, 0, 1, 1, 1, mxiter, new Float64Array( NM * kplusp ), 1, NM, 0, new Float64Array( 2 * kplusp ), 1, kplusp, 0, new Float64Array( kplusp ), 1, 0, new Float64Array( kplusp ), 1, 0, new Float64Array( kplusp * kplusp ), 1, kplusp, 0, new Float64Array( 3 * kplusp ), 1, 0, ipntr, 1, 0, workd, 1, 0, info );
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			gemv( NM, 1.0, DENSE, workd, ipntr[ 0 ], 0.0, workd, ipntr[ 1 ] );
		} else {
			break;
		}
	}
	return {
		'info': info,
		'ido': ido[ 0 ],
		'np': np[ 0 ],
		'iter': mxiter[ 0 ]
	};
}

test( 'dsaup2: returns info = -9999 with np = size of the factorization when the initial Lanczos factorization cannot be built', async function t() {
	// dsaitr reports (info = 2) that it built only a length-2 factorization:
	const fcn = await dsaup2With({
		'./../../dsaitr/lib/base.js': function dsaitrFails( st, ido ) {
			ido[ 0 ] = 99;
			return 2;
		}
	});
	const out = driveWith( fcn );
	assert.strictEqual( out.info, -9999, 'info is -9999' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	assert.strictEqual( out.np, 2, 'np returns the size of the current factorization' );
	assert.strictEqual( out.iter, 0, 'mxiter returns the iterations taken' );
});

test( 'dsaup2: returns info = -9999 when the factorization cannot be extended during the first update', async function t() {
	let calls = 0;
	const fcn = await dsaup2With({
		'./../../dsaitr/lib/base.js': function dsaitrFailsSecond( st, ido ) {
			calls += 1;
			ido[ 0 ] = 99;
			return ( calls === 1 ) ? 0 : 5;
		}
	});
	const out = driveWith( fcn );
	assert.strictEqual( calls, 2, 'dsaitr was called twice' );
	assert.strictEqual( out.info, -9999, 'info is -9999' );
	assert.strictEqual( out.np, 5, 'np returns the size of the current factorization' );
	assert.strictEqual( out.iter, 1, 'mxiter returns the iterations taken' );
});

test( 'dsaup2: returns info = -8 when the tridiagonal eigenvalue computation (dseigt) fails', async function t() {
	const fcn = await dsaup2With({
		'./../../dseigt/lib/base.js': function dseigtFails( ...args ) {
			args[ args.length - 1 ][ 0 ] = 1; // ierr
		}
	});
	const out = driveWith( fcn );
	assert.strictEqual( out.info, -8, 'info is -8' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	assert.strictEqual( out.iter, 300, 'mxiter is untouched' );
});

test( 'dsaup2: a workl shorter than 3*(nev+np) throws a RangeError (ticket 0077)', function t() {
	const n = 10;
	const nev = new Int32Array( [ 2 ] );
	const np = new Int32Array( [ 2 ] );
	const k = 4;
	assert.throws( function f() {
		dsaup2( {}, new Int32Array( 1 ), 'standard', n, 'LM', nev, np, 0.0, new Float64Array( n ), 1, 0, 1, 1, 1, new Int32Array( [ 10 ] ), new Float64Array( n * k ), 1, n, 0, new Float64Array( k * 2 ), 1, k, 0, new Float64Array( k ), 1, 0, new Float64Array( k ), 1, 0, new Float64Array( k * k ), 1, k, 0, new Float64Array( ( 3 * k ) - 1 ), 1, 0, new Int32Array( 11 ), 1, 0, new Float64Array( 3 * n ), 1, 0, 0 );
	}, /workl array must have at least 12 elements/ );
});
