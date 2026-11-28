/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, max-lines */

// MODULES //

import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsytrfrk from './../lib/ndarray.js';
import zsytrs3 from './../../zsytrs_3/lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zsytrf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const FIXTURES = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture object
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i += 1 ) {
		if ( FIXTURES[ i ].name === name ) {
			return FIXTURES[ i ];
		}
	}
	return null;
}

/**
* Asserts two scalars are approximately equal (mixed relative/absolute).
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts two arrays are element-wise approximately equal.
*
* @private
* @param {ArrayLikeObject} actual - actual array
* @param {ArrayLikeObject} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts Fortran 1-based IPIV to 0-based JS IPIV. Negative entries (2x2 pivots) keep their bitwise-NOT-encoded numeric value (Fortran `-p` and JS `~(p-1)` are the same integer).
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV array
* @returns {Array} 0-based JS IPIV array
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i += 1 ) {
		if ( fipiv[ i ] > 0 ) {
			out.push( fipiv[ i ] - 1 );
		} else {
			out.push( fipiv[ i ] );
		}
	}
	return out;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input typed array
* @returns {Array} plain array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i += 1 ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Builds the 50x50 Fortran fixture input: lower triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build50Lower() {
	let idx, i, j;
	const A = new Complex128Array( 50 * 50 );
	const v = reinterpret( A, 0 );
	for ( j = 1; j <= 50; j += 1 ) {
		for ( i = j; i <= 50; i += 1 ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.2 * Math.cos( i * 0.4 ) ) - ( 0.1 * Math.sin( j * 0.5 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 50.0 + ( j * 0.1 );
		v[ idx + 1 ] = 0.05 * j;
	}
	return A;
}

/**
* Builds the 50x50 Fortran fixture input: upper triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build50Upper() {
	let idx, i, j;
	const A = new Complex128Array( 50 * 50 );
	const v = reinterpret( A, 0 );
	for ( j = 1; j <= 50; j += 1 ) {
		for ( i = 1; i <= j; i += 1 ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.2 * Math.cos( i * 0.4 ) ) - ( 0.1 * Math.sin( j * 0.5 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 50.0 + ( j * 0.1 );
		v[ idx + 1 ] = 0.05 * j;
	}
	return A;
}

/**
* Builds the 33x33 Fortran fixture input: lower triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build33Lower() {
	let idx, i, j;
	const A = new Complex128Array( 33 * 33 );
	const v = reinterpret( A, 0 );
	for ( j = 1; j <= 33; j += 1 ) {
		for ( i = j; i <= 33; i += 1 ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.15 * Math.cos( ( i + j ) * 0.2 ) ) - ( 0.07 * Math.sin( i * 0.6 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 33.0 + ( j * 0.05 );
		v[ idx + 1 ] = 0.04 * j;
	}
	return A;
}

/**
* Builds the 33x33 Fortran fixture input: upper triangle filled with sin/cos, diagonal boosted (complex).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build33Upper() {
	let idx, i, j;
	const A = new Complex128Array( 33 * 33 );
	const v = reinterpret( A, 0 );
	for ( j = 1; j <= 33; j += 1 ) {
		for ( i = 1; i <= j; i += 1 ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			v[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			v[ idx + 1 ] = ( 0.15 * Math.cos( ( i + j ) * 0.2 ) ) - ( 0.07 * Math.sin( i * 0.6 ) ); // eslint-disable-line max-len
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		v[ idx ] = 33.0 + ( j * 0.05 );
		v[ idx + 1 ] = 0.04 * j;
	}
	return A;
}

/**
* Runs a single factorization test case against its fixture.
*
* @private
* @param {string} caseName - fixture case name
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - input matrix (column-major)
* @param {number} tol - element tolerance
*/
function runCase( caseName, uplo, N, A, tol ) {
	const ipiv = new Int32Array( N );
	const e = new Complex128Array( N );
	const tc = findCase( caseName );
	const info = zsytrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, new Complex128Array( 2000 ), 1, 0 ); // the fixtures' LWORK, so the block size is the reference's at every N
	const av = reinterpret( A, 0 );
	const ev = reinterpret( e, 0 );
	assertArrayClose( av, tc.a, tol, caseName + ': a' );
	assertArrayClose( ev, tc.e, tol, caseName + ': e' );
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'zsytrf_rk: 4x4_lower', function t() {
	const A = new Complex128Array([
		4,
		0.5,
		1,
		2,
		3,
		-1,
		0.5,
		0.5,
		0,
		0,
		5,
		-0.5,
		2,
		1,
		1,
		-2,
		0,
		0,
		0,
		0,
		7,
		1,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		-1
	]);
	runCase( '4x4_lower', 'lower', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_upper', function t() {
	const A = new Complex128Array([
		4,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		-0.5,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		1,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		0,
		6,
		-1
	]);
	runCase( '4x4_upper', 'upper', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_indef_lower (forces 2x2 pivots)', function t() {
	const A = new Complex128Array([
		0,
		0,
		1,
		1,
		2,
		-1,
		3,
		0.5,
		0,
		0,
		0,
		0,
		4,
		2,
		5,
		-1,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		1.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	]);
	runCase( '4x4_indef_lower', 'lower', 4, A, 1e-13 );
});

test( 'zsytrf_rk: 4x4_indef_upper (forces 2x2 pivots)', function t() {
	const A = new Complex128Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		-1,
		4,
		2,
		0,
		0,
		0,
		0,
		3,
		0.5,
		5,
		-1,
		6,
		1.5,
		0,
		0
	]);
	runCase( '4x4_indef_upper', 'upper', 4, A, 1e-13 );
});

test( 'zsytrf_rk: n=0 quick return', function t() {
	const ipiv = new Int32Array( 0 );
	const e = new Complex128Array( 0 );
	const A = new Complex128Array( 0 );
	const info = zsytrfrk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, new Complex128Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsytrf_rk: n=1', function t() {
	const A = new Complex128Array( [ 7, 2 ] );
	runCase( 'n_one', 'lower', 1, A, 1e-13 );
});

test( 'zsytrf_rk: singular_lower (info > 0)', function t() {
	const A = new Complex128Array( [ 0, 0, 0, 0, 0, 0, 0, 0 ] );
	runCase( 'singular_lower', 'lower', 2, A, 1e-13 );
});

test( 'zsytrf_rk: 5x5_lower (1x1 + 2x2 pivots)', function t() {
	const A = new Complex128Array([
		4,
		0.2,
		1,
		-0.3,
		-2,
		0.1,
		0.5,
		0,
		1.5,
		0.2,
		0,
		0,
		-3,
		0.5,
		1,
		0.4,
		2,
		-0.1,
		0,
		0.3,
		0,
		0,
		0,
		0,
		5,
		-0.2,
		-1,
		0.3,
		0.5,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		0.5,
		1,
		-0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		-4,
		0
	]);
	runCase( '5x5_lower', 'lower', 5, A, 1e-13 );
});

test( 'zsytrf_rk: 5x5_upper (1x1 + 2x2 pivots)', function t() {
	const A = new Complex128Array([
		4,
		0.2,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		-0.3,
		-3,
		0.5,
		0,
		0,
		0,
		0,
		0,
		0,
		-2,
		0.1,
		1,
		0.4,
		5,
		-0.2,
		0,
		0,
		0,
		0,
		0.5,
		0,
		2,
		-0.1,
		-1,
		0.3,
		2,
		0.5,
		0,
		0,
		1.5,
		0.2,
		0,
		0.3,
		0.5,
		0.1,
		1,
		-0.1,
		-4,
		0
	]);
	runCase( '5x5_upper', 'upper', 5, A, 1e-13 );
});

test( 'zsytrf_rk: 50x50_lower_blocked (LWORK = 2000, as in the fixture, shrinks NB to 40: the blocked zlasyf_rk path, as in the reference)', function t() {
	runCase( '50x50_lower_blocked', 'lower', 50, build50Lower(), 1e-11 );
});

test( 'zsytrf_rk: 50x50_upper_blocked (LWORK = 2000, as in the fixture, shrinks NB to 40: the blocked zlasyf_rk path, as in the reference)', function t() {
	runCase( '50x50_upper_blocked', 'upper', 50, build50Upper(), 1e-11 );
});

test( 'zsytrf_rk: 33x33_lower_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	runCase( '33x33_lower_blocked', 'lower', 33, build33Lower(), 1e-11 );
});

test( 'zsytrf_rk: 33x33_upper_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	runCase( '33x33_upper_blocked', 'upper', 33, build33Upper(), 1e-11 );
});

test( 'zsytrf_rk: throws RangeError when WORK is null', function t() {
	const N = 33;
	assert.throws( function throws() {
		zsytrfrk( 'lower', N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'zsytrf_rk: throws RangeError when WORK is too short from its offset (below the minimum of 1)', function t() {
	const N = 33;
	assert.throws( function throws() {
		zsytrfrk( 'upper', N, new Complex128Array( N * N ), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, new Complex128Array( 1 ), 1, 1 );
	}, RangeError );
});

test( 'zsytrf_rk: throws RangeError for non-unit strideWork', function t() {
	const N = 2;
	assert.throws( function throws() {
		zsytrfrk( 'lower', N, new Complex128Array( [ 4.0, 0.0, 1.0, 0.5, 1.0, 0.5, 3.0, 0.0 ] ), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, new Complex128Array( N ), 2, 0 );
	}, RangeError );
});


// WORKSPACE REGRESSION (ticket 0100) //

/**
* Builds a dense indefinite symmetric test matrix (column-major, both triangles filled).
*
* ## Notes
*
* -   The matrix needs heavy rook pivoting (many 2x2 pivots with `p != k`), so the blocked path exercises the panel kernel's copy of column K into column P (ticket 0102).
*
* @private
* @param {NonNegativeInteger} N - order
* @returns {Complex128Array} matrix
*/
function wsMatrix( N ) {
	const A = new Complex128Array( N * N );
	const v = reinterpret( A, 0 );
	let idx, i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + ( j * N ) );
			v[ idx ] = Math.sin( ( ( i + 1 ) * ( j + 1 ) ) + i + j );
			v[ idx + 1 ] = Math.cos( ( i * j ) + i + j );
		}
	}
	return A;
}

/**
* Returns the normwise relative residual `||A*x - b|| / ( ||A|| * ||x|| )` (infinity norms) for a full column-major `A`.
*
* @private
* @param {Float64Array} a - matrix (real view)
* @param {Float64Array} x - solution (real view)
* @param {Float64Array} b - right-hand side (real view)
* @param {NonNegativeInteger} N - order
* @returns {number} relative residual
*/
function wsResidual( a, x, b, N ) {
	let rr, ri, xm, am, rm, s, i, j, k;
	rm = 0.0;
	xm = 0.0;
	am = 0.0;
	for ( i = 0; i < N; i++ ) {
		rr = -b[ 2 * i ];
		ri = -b[ ( 2 * i ) + 1 ];
		s = 0.0;
		for ( j = 0; j < N; j++ ) {
			k = 2 * ( i + ( j * N ) );
			rr += ( a[ k ] * x[ 2 * j ] ) - ( a[ k + 1 ] * x[ ( 2 * j ) + 1 ] );
			ri += ( a[ k ] * x[ ( 2 * j ) + 1 ] ) + ( a[ k + 1 ] * x[ 2 * j ] );
			s += Math.abs( a[ k ] ) + Math.abs( a[ k + 1 ] );
		}
		am = Math.max( am, s );
		rm = Math.max( rm, Math.abs( rr ) + Math.abs( ri ) );
		xm = Math.max( xm, Math.abs( x[ 2 * i ] ) + Math.abs( x[ ( 2 * i ) + 1 ] ) );
	}
	return rm / ( am * xm );
}

/**
* Factors the test matrix with a WORK of the given length, solves `A*x = b` with the matching solver, and returns the solution and its residual.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
* @returns {Object} solution (real view), relative residual, and the (real view of the) NaN-poisoned WORK after the factorization
*/
function wsSolve( uplo, N, lwork ) {
	const A0 = wsMatrix( N );
	const a = reinterpret( A0, 0 );
	const A = new Complex128Array( a );
	const B = new Complex128Array( N );
	const b = reinterpret( B, 0 );
	const e = new Complex128Array( N );
	const ipiv = new Int32Array( N );
	let info, b0, W, w, i;
	for ( i = 0; i < N; i++ ) {
		b[ 2 * i ] = 1.0 + ( i / N );
		b[ ( 2 * i ) + 1 ] = 0.5 - ( i / N );
	}
	b0 = b.slice();
	W = new Complex128Array( lwork );
	w = reinterpret( W, 0 );
	for ( i = 0; i < w.length; i++ ) {
		w[ i ] = NaN; // poisoned: a read of unwritten WORK would spoil the solution
	}
	info = zsytrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, W, 1, 0 );
	assert.equal( info, 0, 'info' );
	zsytrs3( uplo, N, 1, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, B, 1, N, 0 );
	return {
		'x': b,
		'residual': wsResidual( a, b, b0, N ),
		'work': w
	};
}

/**
* Asserts that a WORK of length `lwork` gives a solution with a small residual that agrees with the optimal-WORK solution.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
*/
function wsCompare( N, lwork ) {
	const uplos = [ 'upper', 'lower' ];
	let opt, got, d, s, u, i;
	for ( u = 0; u < uplos.length; u++ ) {
		opt = wsSolve( uplos[ u ], N, N * 64 );
		got = wsSolve( uplos[ u ], N, lwork );
		assert.ok( opt.residual < 1e-11, uplos[ u ] + ': optimal-WORK residual ' + opt.residual );
		assert.ok( got.residual < 1e-11, uplos[ u ] + ': lwork=' + lwork + ' residual ' + got.residual );
		d = 0.0;
		s = 0.0;
		for ( i = 0; i < 2 * N; i++ ) {
			d = Math.max( d, Math.abs( got.x[ i ] - opt.x[ i ] ) );
			s = Math.max( s, Math.abs( opt.x[ i ] ) );
		}
		assert.ok( d / s < 1e-8, uplos[ u ] + ': solution differs from the optimal-WORK one by ' + ( d / s ) );
	}
}

test( 'zsytrf_rk: WORK of the reference minimum (1) past the blocking threshold falls back to the unblocked path (N = 70)', function t() {
	wsCompare( 70, 1 );
});

test( 'zsytrf_rk: an intermediate WORK (N*8) past the blocking threshold shrinks the block size (N = 70)', function t() {
	wsCompare( 70, 70 * 8 );
});

test( 'zsytrf_rk: a WORK just below the optimum (N*64 - 1) shrinks the block size to 63 (N = 70)', function t() {
	wsCompare( 70, ( 70 * 64 ) - 1 );
});

/**
* Asserts that factoring the test matrix with a NaN-poisoned WORK of length `lwork` takes the unblocked path: the unblocked kernel uses no workspace, so WORK is left untouched, and the solution's residual is small.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {PositiveInteger} lwork - WORK length
*/
function wsUntouched( N, lwork ) {
	const uplos = [ 'upper', 'lower' ];
	let got, u, i;
	for ( u = 0; u < uplos.length; u++ ) {
		got = wsSolve( uplos[ u ], N, lwork );
		assert.ok( got.residual < 1e-11, uplos[ u ] + ': residual ' + got.residual );
		for ( i = 0; i < got.work.length; i++ ) {
			assert.ok( Number.isNaN( got.work[ i ] ), uplos[ u ] + ': WORK[ ' + i + ' ] was written' );
		}
	}
}

test( 'zsytrf_rk: between the old block size (32) and the reference NB = ILAENV( 1 ) = 64, the optimal WORK takes the unblocked path, as in the reference, leaving WORK untouched (N = 50)', function t() {
	wsUntouched( 50, 50 * 64 );
});

test( 'zsytrf_rk: a WORK of N*7, below the reference NBMIN = ILAENV( 2 ) = 8, takes the unblocked path, leaving WORK untouched (N = 70)', function t() {
	wsUntouched( 70, 70 * 7 );
});
