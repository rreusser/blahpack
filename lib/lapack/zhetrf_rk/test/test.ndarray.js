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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhetrfrk from './../lib/ndarray.js';
import zhetrs3 from './../../zhetrs_3/lib/ndarray.js';


// FIXTURES //

const fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', 'test', 'fixtures' );
const lines = readFileSync( path.join( fixtureDir, 'zhetrf_rk.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line max-len
const FIXTURES = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Finds a test case by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture
*/
function findCase( name ) {
	let i;
	for ( i = 0; i < FIXTURES.length; i++ ) {
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
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts Fortran 1-based IPIV to 0-based JS IPIV. Negative entries (2x2 pivots) keep their bitwise-NOT-encoded numeric value.
*
* @private
* @param {ArrayLikeObject} fipiv - Fortran IPIV array
* @returns {Array} 0-based JS IPIV array
*/
function convertIPIV( fipiv ) {
	const out = [];
	let i;
	for ( i = 0; i < fipiv.length; i++ ) {
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
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Builds the 50x50 Hermitian fixture input (lower triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build50Lower() {
	let idx, i, j;
	const A = new Float64Array( 50 * 50 * 2 );
	for ( j = 1; j <= 50; j++ ) {
		for ( i = j; i <= 50; i++ ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.3 * Math.sin( ( i - j ) * 0.21 );
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 50.0 + ( j * 0.1 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 50x50 Hermitian fixture input (upper triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build50Upper() {
	let idx, i, j;
	const A = new Float64Array( 50 * 50 * 2 );
	for ( j = 1; j <= 50; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			idx = ( ( ( j - 1 ) * 50 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 0.7 ) * Math.cos( j * 0.3 ) ) + ( 0.5 * Math.sin( ( i + j ) * 0.13 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.3 * Math.sin( ( j - i ) * 0.21 );
		}
		idx = ( ( ( j - 1 ) * 50 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 50.0 + ( j * 0.1 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 33x33 Hermitian fixture input (lower triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, lower triangle)
*/
function build33Lower() {
	let idx, i, j;
	const A = new Float64Array( 33 * 33 * 2 );
	for ( j = 1; j <= 33; j++ ) {
		for ( i = j; i <= 33; i++ ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.2 * Math.cos( ( i - j ) * 0.17 );
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 33.0 + ( j * 0.05 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Builds the 33x33 Hermitian fixture input (upper triangle).
*
* @private
* @returns {Complex128Array} input matrix (column-major, upper triangle)
*/
function build33Upper() {
	let idx, i, j;
	const A = new Float64Array( 33 * 33 * 2 );
	for ( j = 1; j <= 33; j++ ) {
		for ( i = 1; i <= j; i++ ) {
			idx = ( ( ( j - 1 ) * 33 ) + ( i - 1 ) ) * 2;
			A[ idx ] = ( Math.sin( i * 1.1 ) * Math.cos( j * 0.5 ) ) + ( 0.3 * Math.sin( i * j * 0.07 ) ); // eslint-disable-line max-len
			A[ idx + 1 ] = 0.2 * Math.cos( ( j - i ) * 0.17 );
		}
		idx = ( ( ( j - 1 ) * 33 ) + ( j - 1 ) ) * 2;
		A[ idx ] = 33.0 + ( j * 0.05 );
		A[ idx + 1 ] = 0.0;
	}
	return new Complex128Array( A.buffer );
}

/**
* Runs a single factorization test case.
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
	const info = zhetrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, new Complex128Array( 2000 ), 1, 0 ); // the fixtures' LWORK, so the block size is the reference's at every N
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a, tol, caseName + ': a' ); // eslint-disable-line max-len
	assertArrayClose( toArray( reinterpret( e, 0 ) ), tc.e, tol, caseName + ': e' ); // eslint-disable-line max-len
	assert.equal( info, tc.info, caseName + ': info' );
	assert.deepEqual( toArray( ipiv ), convertIPIV( tc.ipiv ), caseName + ': ipiv' );
}


// TESTS //

test( 'zhetrf_rk: lower_4x4 Hermitian', function t() {
	// Column-major interleaved (4x4 = 32 float64s = 16 complex elements). Lower triangle stored.
	const a = [
		4,
		0,
		1,
		-2,
		3,
		1,
		0.5,
		-0.5,
		0,
		0,
		5,
		0,
		2,
		-1,
		1,
		2,
		0,
		0,
		0,
		0,
		7,
		0,
		3,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		0
	];
	runCase( 'lower_4x4', 'lower', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: upper_4x4 Hermitian', function t() {
	const a = [
		4,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		2,
		5,
		0,
		0,
		0,
		0,
		0,
		3,
		-1,
		2,
		1,
		7,
		0,
		0,
		0,
		0.5,
		0.5,
		1,
		-2,
		3,
		0,
		6,
		0
	];
	runCase( 'upper_4x4', 'upper', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_lower_4x4 (forces 2x2 pivots)', function t() {
	const a = [
		0,
		0,
		1,
		-1,
		2,
		1,
		3,
		-0.5,
		0,
		0,
		0,
		0,
		4,
		-2,
		5,
		1,
		0,
		0,
		0,
		0,
		0,
		0,
		6,
		-1.5,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0
	];
	runCase( 'indef_lower_4x4', 'lower', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_upper_4x4 (forces 2x2 pivots)', function t() {
	const a = [
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
	];
	runCase( 'indef_upper_4x4', 'upper', 4, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: n=0 quick return', function t() {
	const ipiv = new Int32Array( 0 );
	const A = new Complex128Array( 0 );
	const e = new Complex128Array( 0 );
	const info = zhetrfrk( 'lower', 0, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, new Complex128Array( 1 ), 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zhetrf_rk: n=1 lower', function t() {
	const a = [ 5, 0 ];
	runCase( 'n_one_lower', 'lower', 1, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_upper_5x5', function t() {
	// Upper-triangle column-major: col j has rows 0..j; lower part zero.
	const a = [
		// Col 0
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 1
		2,
		1,
		0.1,
		0,
		0,
		0,
		0,
		0,
		0,
		0,

		// Col 2
		3,
		-1,
		4,
		1,
		0.1,
		0,
		0,
		0,
		0,
		0,

		// Col 3
		5,
		2,
		6,
		-1,
		7,
		1.5,
		0.1,
		0,
		0,
		0,

		// Col 4
		8,
		-0.5,
		9,
		0.5,
		10,
		-1.5,
		11,
		2,
		0.1,
		0
	];
	runCase( 'indef_upper_5x5', 'upper', 5, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: indef_lower_5x5', function t() {
	// Lower-triangle column-major: col j has rows j..N-1; upper part zero.
	const a = [
		// Col 0
		0.1,
		0,
		2,
		-1,
		3,
		1,
		5,
		-2,
		8,
		0.5,

		// Col 1
		0,
		0,
		0.1,
		0,
		4,
		-1,
		6,
		1,
		9,
		-0.5,

		// Col 2
		0,
		0,
		0,
		0,
		0.1,
		0,
		7,
		-1.5,
		10,
		1.5,

		// Col 3
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0,
		11,
		-2,

		// Col 4
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0.1,
		0
	];
	runCase( 'indef_lower_5x5', 'lower', 5, new Complex128Array( a ), 1e-12 );
});

test( 'zhetrf_rk: lower_50x50_blocked (LWORK = 2000, as in the fixture, shrinks NB to 40: the blocked zlahef_rk path, as in the reference)', function t() {
	runCase( 'lower_50x50_blocked', 'lower', 50, build50Lower(), 1e-10 );
});

test( 'zhetrf_rk: upper_50x50_blocked (LWORK = 2000, as in the fixture, shrinks NB to 40: the blocked zlahef_rk path, as in the reference)', function t() {
	runCase( 'upper_50x50_blocked', 'upper', 50, build50Upper(), 1e-10 );
});

test( 'zhetrf_rk: lower_33x33_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	runCase( 'lower_33x33_blocked', 'lower', 33, build33Lower(), 1e-10 );
});

test( 'zhetrf_rk: upper_33x33_blocked (N < NB = 64: unblocked, as in the reference)', function t() {
	runCase( 'upper_33x33_blocked', 'upper', 33, build33Upper(), 1e-10 );
});

test( 'zhetrf_rk: throws RangeError when it gets no WORK', function t() {
	const N = 33;
	assert.throws( function throws() {
		zhetrfrk( 'lower', N, build33Lower(), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, null, 1, 0 );
	}, RangeError );
});

test( 'zhetrf_rk: throws RangeError when it gets an undersized WORK (below the minimum of 1)', function t() {
	const N = 33;
	assert.throws( function throws() {
		zhetrfrk( 'upper', N, build33Upper(), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, new Complex128Array( 0 ), 1, 0 );
	}, RangeError );
	assert.throws( function throws() {
		zhetrfrk( 'upper', N, build33Upper(), 1, N, 0, new Complex128Array( N ), 1, 0, new Int32Array( N ), 1, 0, new Complex128Array( 1 ), 1, 1 );
	}, RangeError );
});


// WORKSPACE REGRESSION (ticket 0100) //

/**
* Builds a dense indefinite Hermitian test matrix (column-major, both triangles filled).
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
			v[ idx + 1 ] = Math.sin( i - j ) * Math.cos( i * j );
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
	info = zhetrfrk( uplo, N, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, W, 1, 0 );
	assert.equal( info, 0, 'info' );
	zhetrs3( uplo, N, 1, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, B, 1, N, 0 );
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

test( 'zhetrf_rk: WORK of the reference minimum (1) past the blocking threshold falls back to the unblocked path (N = 70)', function t() {
	wsCompare( 70, 1 );
});

test( 'zhetrf_rk: an intermediate WORK (N*8) past the blocking threshold shrinks the block size (N = 70)', function t() {
	wsCompare( 70, 70 * 8 );
});

test( 'zhetrf_rk: a WORK just below the optimum (N*64 - 1) shrinks the block size to 63 (N = 70)', function t() {
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

test( 'zhetrf_rk: between the old block size (32) and the reference NB = ILAENV( 1 ) = 64, the optimal WORK takes the unblocked path, as in the reference, leaving WORK untouched (N = 50)', function t() {
	wsUntouched( 50, 50 * 64 );
});
