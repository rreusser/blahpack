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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsaupd from './../../dsaupd/lib/strided.js';
import dgetrf from '../../../lapack/dgetrf/lib/base.js';
import dgetrs from '../../../lapack/dgetrs/lib/base.js';
import dsygv from '../../../lapack/dsygv/lib/base.js';
import dseupd from './../lib/strided.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dseupd.f90);
// the driver runs the full dsaupd + dseupd pipeline on the 1-D Laplacian and
// records both the exact post-convergence inputs consumed by dseupd and its
// outputs. Regenerate with `./test/run_fortran.sh arpack dseupd`.
const fixtureURL = new URL( '../../../../test/fixtures/dseupd.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

const TOL = 1e-10;


// TESTS //

// `select` is a logical array: the documented `Uint8Array` must behave as
// a plain boolean `Array` does (the reordering path reads it back).
const SELECT = {
	'Array': ( n ) => new Array( n ).fill( false ),
	'Uint8Array': ( n ) => new Uint8Array( n )
};

for ( const tc of cases ) for ( const kind of Object.keys( SELECT ) ) {
	test( 'dseupd: ' + tc.name + ' (select: ' + kind + ')', function t() {
		const n = tc.n;
		const nev = tc.nev;
		const ncv = tc.ncv;
		const lworkl = tc.lworkl;
		const nconv = tc.nconv;
		const rvec = tc.name.indexOf( '_rvec' ) !== -1;
		const which = tc.name.slice( 0, 2 ).toUpperCase();
		const ldv = n;
		const ldz = n;

		const v = Float64Array.from( tc.v );
		const workl = Float64Array.from( tc.workl );
		const workd = Float64Array.from( tc.workd );
		const resid = Float64Array.from( tc.resid );
		const iparam = tc.iparam.slice();
		const ipntr = tc.ipntr.slice();
		const select = SELECT[ kind ]( ncv );
		const d = new Float64Array( nev );
		const z = new Float64Array( n * nev );

		const info = dseupd( rvec, 'all', select, 1, 0, d, 1, 0, z, 1, ldz, 0, tc.sigma, 'standard', n, which, nev, tc.tol, resid, 1, 0, ncv, v, 1, ldv, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl );

		assert.strictEqual( info, tc.info, 'info matches' );

		// Ritz values: expect bit-for-bit (or within 1e-10) agreement.
		for ( let i = 0; i < nconv; i++ ) {
			assert.ok( Math.abs( d[ i ] - tc.d[ i ] ) <= TOL * Math.max( Math.abs( tc.d[ i ] ), 1.0 ), 'd[' + i + '] matches (got ' + d[ i ] + ', expected ' + tc.d[ i ] + ')' );
		}

		// Ritz vectors: match sign-for-sign, allowing a per-column global sign
		// flip (a legitimate eigenvector freedom).
		if ( rvec && tc.z ) {
			for ( let c = 0; c < nconv; c++ ) {
				let dPlus = 0;
				let dMinus = 0;
				for ( let r = 0; r < n; r++ ) {
					const got = z[ ( c * ldz ) + r ];
					const exp = tc.z[ ( c * n ) + r ];
					dPlus = Math.max( dPlus, Math.abs( got - exp ) );
					dMinus = Math.max( dMinus, Math.abs( got + exp ) );
				}
				assert.ok( Math.min( dPlus, dMinus ) <= TOL, 'z column ' + c + ' matches up to sign (min diff ' + Math.min( dPlus, dMinus ) + ')' );
			}
		}
	});
}


// FUNCTIONS //

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
* Runs the full `dsaupd` reverse-communication loop for `A*x = lambda*M*x` (with `M = I` when `bmat` is `'standard'`) in the given ARPACK mode, then calls `dseupd`.
*
* @private
* @param {Object} opts - options
* @returns {Object} results
*/
function solve( opts ) {
	const n = opts.A.length === 0 ? 0 : Math.round( Math.sqrt( opts.A.length ) );
	const A = opts.A;
	const M = opts.M;
	const mode = opts.mode;
	const sigma = opts.sigma;
	const nev = opts.nev;
	const ncv = opts.ncv;
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const bmat = opts.bmat;
	const iparam = new Int32Array( 11 );
	const ipntr = new Int32Array( 14 );
	const ido = new Int32Array( 1 );
	const resid = new Float64Array( n );
	const v = new Float64Array( n * ncv );
	const workd = new Float64Array( 3 * n );
	const workl = new Float64Array( lworkl );
	const ipiv = new Int32Array( n );
	const state = {};
	let info;

	iparam[ 0 ] = 1;
	iparam[ 2 ] = 300;
	iparam[ 6 ] = mode;

	// Factor the operator matrix F: M (mode 2), A - sigma*I (mode 3, standard) or A - sigma*M (modes 3, 4, 5, generalized).
	let F = null;
	if ( mode === 2 ) {
		F = M.slice();
	} else if ( mode >= 3 ) {
		F = A.slice();
		for ( let k = 0; k < n * n; k++ ) {
			F[ k ] -= sigma * ( ( bmat === 'standard' ) ? ( ( k % ( n + 1 ) === 0 ) ? 1.0 : 0.0 ) : M[ k ] );
		}
		assert.strictEqual( dgetrf( n, n, F, 1, n, 0, ipiv, 1, 0 ), 0, 'operator factorization succeeds' );
	}
	if ( mode === 2 ) {
		assert.strictEqual( dgetrf( n, n, F, 1, n, 0, ipiv, 1, 0 ), 0, 'M factorization succeeds' );
	}
	const fsolve = ( oy ) => dgetrs( 'no-transpose', n, 1, F, 1, n, 0, ipiv, 1, 0, workd, 1, n, oy );

	for ( let it = 0; it < 10000; it++ ) {
		info = dsaupd( state, ido, bmat, n, opts.which, nev, 0.0, resid, 1, 0, ncv, v, 1, n, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, 0 );
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
			} else if ( mode === 3 ) {
				if ( ido[ 0 ] === -1 ) {
					gemv( n, 1.0, M, workd, ox, 0.0, workd, oy );
				} else {
					workd.copyWithin( oy, ob, ob + n );
				}
				fsolve( oy );
			} else if ( mode === 4 ) {
				if ( ido[ 0 ] === -1 ) {
					gemv( n, 1.0, A, workd, ox, 0.0, workd, oy );
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
		} else {
			break;
		}
	}
	assert.strictEqual( info, 0, 'dsaupd converged' );
	assert.ok( iparam[ 4 ] >= nev, 'dsaupd reports nconv >= nev' );

	const nconv = iparam[ 4 ];
	const d = new Float64Array( nconv );
	const z = new Float64Array( n * nconv );
	const select = new Uint8Array( ncv );
	info = dseupd( opts.rvec, opts.howmny || 'all', select, 1, 0, d, 1, 0, z, 1, n, 0, sigma, bmat, n, opts.which, nev, state.tol, resid, 1, 0, ncv, v, 1, n, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl );
	return {
		'info': info,
		'nconv': nconv,
		'd': d,
		'z': z
	};
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
* Returns the `k` eigenvalues `lambda` of `w` whose spectral transform `nu = op( lambda )` has the largest magnitude (ARPACK `which = 'LM'` on OP), sorted ascending.
*
* @private
* @param {Float64Array} w - eigenvalues of the original pencil
* @param {Function} op - spectral transformation
* @param {PositiveInteger} k - count
* @returns {Array} selected eigenvalues
*/
function largestTransformed( w, op, k ) {
	return Array.from( w ).sort( ( a, b ) => Math.abs( op( b ) ) - Math.abs( op( a ) ) ).slice( 0, k ).sort( ( a, b ) => a - b );
}

/**
* Asserts that the Ritz pairs `(d, z)` satisfy `A*z = d*M*z` and `Z^T*B*Z = I`.
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - matrix
* @param {Float64Array} M - matrix
* @param {Float64Array} B - inner-product matrix
* @param {Object} out - results from `solve`
*/
function assertRitzPairs( n, A, M, B, out ) {
	const az = new Float64Array( n );
	const mz = new Float64Array( n );
	const nconv = out.nconv;
	for ( let j = 0; j < nconv; j++ ) {
		gemv( n, 1.0, A, out.z, j * n, 0.0, az, 0 );
		gemv( n, 1.0, M, out.z, j * n, 0.0, mz, 0 );
		let res = 0.0;
		for ( let i = 0; i < n; i++ ) {
			res = Math.max( res, Math.abs( az[ i ] - ( out.d[ j ] * mz[ i ] ) ) );
		}
		assert.ok( res <= 1e-9 * Math.max( 1.0, Math.abs( out.d[ j ] ) ), 'residual of Ritz pair ' + j + ' is small (' + res + ')' );
		for ( let k = 0; k < nconv; k++ ) {
			gemv( n, 1.0, B, out.z, k * n, 0.0, mz, 0 );
			let dot = 0.0;
			for ( let i = 0; i < n; i++ ) {
				dot += out.z[ ( j * n ) + i ] * mz[ i ];
			}
			assert.ok( Math.abs( dot - ( ( j === k ) ? 1.0 : 0.0 ) ) <= 1e-9, 'Ritz vectors ' + j + ',' + k + ' are B-orthonormal (' + dot + ')' );
		}
	}
}

/**
* Asserts that the computed Ritz values match the expected eigenvalues.
*
* @private
* @param {Float64Array} d - computed
* @param {Array} expected - expected
*/
function assertValues( d, expected ) {
	assert.strictEqual( d.length, expected.length, 'number of Ritz values' );
	for ( let i = 0; i < expected.length; i++ ) {
		assert.ok( Math.abs( d[ i ] - expected[ i ] ) <= 1e-10 * Math.max( 1.0, Math.abs( expected[ i ] ) ), 'd[' + i + '] = ' + d[ i ] + ' matches ' + expected[ i ] );
	}
}


// MODE TESTS //

const NM = 12;
const LAP = tridiag( NM, 2.0, -1.0, 1.0 );
const MASS = tridiag( NM, 4.0, 1.0, 1.0 / 6.0 );
const EYE = tridiag( NM, 1.0, 0.0, 1.0 );
const W_STD = pencilEigenvalues( NM, LAP, EYE );
const W_GEN = pencilEigenvalues( NM, LAP, MASS );

const MODES = [
	{ 'name': 'mode 3 (standard shift-invert)', 'mode': 3, 'bmat': 'standard', 'sigma': 0.6, 'M': EYE, 'B': EYE, 'w': W_STD, 'op': ( x ) => 1.0 / ( x - 0.6 ) },
	{ 'name': 'mode 2 (generalized regular inverse)', 'mode': 2, 'bmat': 'generalized', 'sigma': 0.0, 'M': MASS, 'B': MASS, 'w': W_GEN, 'op': ( x ) => x },
	{ 'name': 'mode 3 (generalized shift-invert)', 'mode': 3, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'B': MASS, 'w': W_GEN, 'op': ( x ) => 1.0 / ( x - 1.0 ) },
	{ 'name': 'mode 4 (buckling)', 'mode': 4, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'B': LAP, 'w': W_GEN, 'op': ( x ) => x / ( x - 1.0 ) },
	{ 'name': 'mode 5 (Cayley)', 'mode': 5, 'bmat': 'generalized', 'sigma': 1.0, 'M': MASS, 'B': MASS, 'w': W_GEN, 'op': ( x ) => ( x + 1.0 ) / ( x - 1.0 ) }
];

for ( const mc of MODES ) for ( const rvec of [ true, false ] ) {
	test( 'dseupd: ' + mc.name + ', rvec=' + rvec + ' recovers the eigenvalues of A*x = lambda*M*x (vs dsygv)', function t() {
		const nev = 3;
		const out = solve({
			'A': LAP,
			'M': mc.M,
			'mode': mc.mode,
			'bmat': mc.bmat,
			'sigma': mc.sigma,
			'which': 'LM',
			'nev': nev,
			'ncv': 8,
			'rvec': rvec
		});
		assert.strictEqual( out.info, 0, 'info is 0' );
		const expected = largestTransformed( mc.w, mc.op, out.nconv );
		assertValues( out.d, expected );
		if ( rvec ) {
			assertRitzPairs( NM, LAP, mc.M, mc.B, out );
		}
	});
}


// ERROR AND EARLY-RETURN TESTS //

/**
* Calls `dseupd` on the `lm_rvec` reference fixture state, with selected arguments overridden.
*
* @private
* @param {Object} o - overrides
* @returns {Object} info and outputs
*/
function callFixture( o ) {
	const tc = cases[ 0 ];
	const a = Object.assign({
		'rvec': true,
		'howmny': 'all',
		'bmat': 'standard',
		'N': tc.n,
		'which': 'LM',
		'nev': tc.nev,
		'ncv': tc.ncv,
		'lworkl': tc.lworkl,
		'nconv': tc.nconv,
		'mode': tc.iparam[ 6 ]
	}, o );
	const v = Float64Array.from( tc.v );
	const workl = Float64Array.from( tc.workl );
	const iparam = tc.iparam.slice();
	const ipntr = tc.ipntr.slice();
	iparam[ 4 ] = a.nconv;
	iparam[ 6 ] = a.mode;
	if ( a.mutate ) {
		a.mutate( workl, ipntr );
	}
	const d = new Float64Array( tc.nev ).fill( -999.0 );
	const z = new Float64Array( tc.n * tc.nev ).fill( -999.0 );
	const info = dseupd( a.rvec, a.howmny, new Uint8Array( tc.ncv ), 1, 0, d, 1, 0, z, 1, tc.n, 0, tc.sigma, a.bmat, a.N, a.which, a.nev, tc.tol, Float64Array.from( tc.resid ), 1, 0, a.ncv, v, 1, tc.n, 0, iparam, 1, 0, ipntr, 1, 0, Float64Array.from( tc.workd ), 1, 0, workl, 1, 0, a.lworkl );
	return {
		'info': info,
		'd': d,
		'z': z
	};
}

test( 'dseupd: nconv = 0 is a quick return with info 0 and outputs untouched', function t() {
	const out = callFixture({
		'nconv': 0
	});
	assert.strictEqual( out.info, 0, 'info is 0' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
	assert.ok( out.z.every( ( x ) => x === -999.0 ), 'z untouched' );
});

const ERRORS = [
	[ 'nconv < 0', { 'nconv': -1 }, -14 ],
	// As in the Fortran, the checks run in sequence and a later one overwrites `ierr`: N <= 0 always also violates `ncv <= N` (or `nev > 0`), so -1 is reported as -3.
	[ 'N <= 0 (reported as -3)', { 'N': 0 }, -3 ],
	[ 'nev <= 0', { 'nev': 0 }, -2 ],
	[ 'ncv <= nev', { 'ncv': 3 }, -3 ],
	[ 'ncv > N', { 'ncv': 11, 'rvec': false }, -3 ],
	[ 'howmny = select with rvec (not implemented)', { 'howmny': 'select' }, -16 ],
	[ 'insufficient lworkl with rvec', { 'lworkl': 10 }, -7 ],
	[ 'mode 0', { 'mode': 0 }, -10 ],
	[ 'mode 6', { 'mode': 6 }, -10 ],
	[ 'mode 1 with generalized bmat', { 'bmat': 'generalized' }, -11 ],
	[ 'nev = 1 with which = BE', { 'nev': 1, 'nconv': 1, 'which': 'BE' }, -12 ]
];

for ( const [ name, o, code ] of ERRORS ) {
	test( 'dseupd: ' + name + ' returns info = ' + code + ' and leaves outputs untouched', function t() {
		const out = callFixture( o );
		assert.strictEqual( out.info, code, 'info is ' + code );
		assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
	});
}

test( 'dseupd: returns -17 when the converged count disagrees with nconv from dsaupd', function t() {
	const tc = cases[ 0 ];
	const out = callFixture({
		'mutate': function mutate( workl, ipntr ) {
			// Inflate every Ritz estimate (workl(ibd), ibd = ipntr(11) + 2*ncv) so none passes the convergence test:
			const ibd = ipntr[ 10 ] + ( 2 * tc.ncv );
			for ( let j = 0; j < tc.ncv; j++ ) {
				workl[ ibd - 1 + j ] = 1.0e10;
			}
		}
	});
	assert.strictEqual( out.info, -17, 'info is -17' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'dseupd: returns -8 when the tridiagonal eigensolver (dsteqr) fails', function t() {
	const tc = cases[ 0 ];
	const out = callFixture({
		'mutate': function mutate( workl, ipntr ) {
			// Poison the Lanczos tridiagonal H (workl(ih), ipntr(5)) so dsteqr cannot converge:
			const ih = ipntr[ 4 ];
			for ( let j = 0; j < 2 * tc.ncv; j++ ) {
				workl[ ih - 1 + j ] = NaN;
			}
		}
	});
	assert.strictEqual( out.info, -8, 'info is -8' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'dseupd: a workd shorter than 2*N throws a RangeError (ticket 0077)', function t() {
	const n = 10;
	const ncv = 4;
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	assert.throws( function f() {
		dseupd( true, 'all', new Uint8Array( ncv ), 1, 0, new Float64Array( 2 ), 1, 0, new Float64Array( n * 2 ), 1, n, 0, 0.0, 'standard', n, 'LM', 2, 0.0, new Float64Array( n ), 1, 0, ncv, new Float64Array( n * ncv ), 1, n, 0, new Int32Array( 11 ), 1, 0, new Int32Array( 11 ), 1, 0, new Float64Array( ( 2 * n ) - 1 ), 1, 0, new Float64Array( lworkl ), 1, 0, lworkl );
	}, /workd array must have at least 20 elements/ );
});
