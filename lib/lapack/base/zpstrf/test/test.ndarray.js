/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpstrf from './../lib/ndarray.js';
import zpstf2 from './../../zpstf2/lib/base.js';

// FIXTURES //

import upper_3x3 from './fixtures/upper_3x3.json' with { type: 'json' };
import lower_3x3 from './fixtures/lower_3x3.json' with { type: 'json' };
import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import rank_deficient_upper from './fixtures/rank_deficient_upper.json' with { type: 'json' };
import rank_deficient_lower from './fixtures/rank_deficient_lower.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import rank_deficient_4x4_upper from './fixtures/rank_deficient_4x4_upper.json' with { type: 'json' };
import rank_deficient_4x4_lower from './fixtures/rank_deficient_4x4_lower.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
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
* Runs a test case against the Fortran fixture.
*
* @private
* @param {string} uplo - 'upper' or 'lower'
* @param {number} N - matrix order
* @param {Float64Array} AFlat - interleaved re/im input matrix (column-major)
* @param {Object} tc - test case from fixture
*/
function runTestCase( uplo, N, AFlat, tc ) {
	let i;

	const A = new Complex128Array( AFlat );
	const PIV = new Int32Array( N );
	const RANK = new Int32Array( 1 );
	const WORK = new Float64Array( 2 * N );

	const info = zpstrf( uplo, N, A, 1, N, 0, PIV, 1, 0, RANK, -1.0, WORK );

	assert.equal( info, tc.info, 'info' );
	assert.equal( RANK[ 0 ], tc.rank, 'rank' );

	// Compare A (factorized matrix as interleaved re/im)
	const Av = reinterpret( A, 0 );
	assertArrayClose( Av, new Float64Array( tc.a ), 1e-14, 'A' );

	// Compare PIV (Fortran is 1-based, JS is 0-based)
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV[ i ], tc.piv[ i ] - 1, 'piv[' + i + ']' );
	}
}

/**
* Creates a deterministic N-by-N Hermitian positive semi-definite complex matrix.
*
* @private
* @param {number} N - matrix dimension
* @param {number} rank - rank of the matrix
* @returns {Complex128Array} complex array
*/
function randomHPSD( N, rank ) {
	let br, bi, cr, ci, ar, ai, i, j, k;

	const A = new Complex128Array( N * N );
	const Av = reinterpret( A, 0 );

	// Build B (rank x N) with deterministic values...
	const B = new Float64Array( rank * N * 2 );
	for ( i = 0; i < rank * N; i++ ) {
		B[ i * 2 ] = ( ( ( i * 7 ) + 3 ) % 13 ) - 6;
		B[ ( i * 2 ) + 1 ] = ( ( ( i * 11 ) + 5 ) % 9 ) - 4;
	}

	// A = B^H * B (col-major)...
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			cr = 0.0;
			ci = 0.0;
			for ( k = 0; k < rank; k++ ) {
				br = B[ ( ( i * rank ) + k ) * 2 ];
				bi = -B[ ( ( ( i * rank ) + k ) * 2 ) + 1 ];
				ar = B[ ( ( j * rank ) + k ) * 2 ];
				ai = B[ ( ( ( j * rank ) + k ) * 2 ) + 1 ];
				cr += ( br * ar ) - ( bi * ai );
				ci += ( br * ai ) + ( bi * ar );
			}
			Av[ ( ( j * N ) + i ) * 2 ] = cr;
			Av[ ( ( ( j * N ) + i ) * 2 ) + 1 ] = ci;
		}
	}

	// For full-rank, add N*I for strong positive definiteness...
	if ( rank === N ) {
		for ( i = 0; i < N; i++ ) {
			Av[ ( ( ( i * N ) + i ) * 2 ) ] += N;
			Av[ ( ( ( i * N ) + i ) * 2 ) + 1 ] = 0.0;
		}
	}
	return A;
}

// TESTS //

test( 'zpstrf: upper_3x3', function t() {
	const tc = upper_3x3;
	const A = new Float64Array([
		10.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		1.0,
		8.0,
		0.0,
		0.0,
		0.0,
		3.0,
		-2.0,
		1.0,
		1.0,
		6.0,
		0.0
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'zpstrf: lower_3x3', function t() {
	const tc = lower_3x3;
	const A = new Float64Array([
		10.0,
		0.0,
		2.0,
		-1.0,
		3.0,
		2.0,
		0.0,
		0.0,
		8.0,
		0.0,
		1.0,
		-1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		6.0,
		0.0
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'zpstrf: upper_4x4', function t() {
	const tc = upper_4x4;
	const A = new Float64Array([
		20.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		2.0,
		15.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		3.0,
		-1.0,
		4.0,
		2.0,
		18.0,
		0.0,
		0.0,
		0.0,
		2.0,
		3.0,
		1.0,
		-1.0,
		5.0,
		1.0,
		12.0,
		0.0
	]);
	runTestCase( 'upper', 4, A, tc );
});

test( 'zpstrf: lower_4x4', function t() {
	const tc = lower_4x4;
	const A = new Float64Array([
		20.0,
		0.0,
		1.0,
		-2.0,
		3.0,
		1.0,
		2.0,
		-3.0,
		0.0,
		0.0,
		15.0,
		0.0,
		4.0,
		-2.0,
		1.0,
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		18.0,
		0.0,
		5.0,
		-1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		12.0,
		0.0
	]);
	runTestCase( 'lower', 4, A, tc );
});

test( 'zpstrf: rank_deficient_upper', function t() {
	const tc = rank_deficient_upper;
	const A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		-1.0,
		2.0,
		0.0,
		0.0,
		0.0,
		2.0,
		1.0,
		1.0,
		3.0,
		5.0,
		0.0
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'zpstrf: rank_deficient_lower', function t() {
	const tc = rank_deficient_lower;
	const A = new Float64Array([
		1.0,
		0.0,
		1.0,
		1.0,
		2.0,
		-1.0,
		0.0,
		0.0,
		2.0,
		0.0,
		1.0,
		-3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		5.0,
		0.0
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'zpstrf: n_zero', function t() {
	const WORK = new Float64Array( 2 );
	const RANK = new Int32Array( 1 );
	const PIV = new Int32Array( 1 );
	const A = new Complex128Array( 1 );

	const info = zpstrf( 'upper', 0, A, 1, 1, 0, PIV, 1, 0, RANK, -1.0, WORK );
	assert.equal( info, 0 );
});

test( 'zpstrf: n_one', function t() {
	const tc = n_one;
	const A = new Float64Array([ 9.0, 0.0 ]);
	runTestCase( 'upper', 1, A, tc );
});

test( 'zpstrf: rank_deficient_4x4_upper', function t() {
	const tc = rank_deficient_4x4_upper;
	const A = new Float64Array([
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		0.0,
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		5.0,
		-1.0,
		4.0,
		-1.0,
		9.0,
		0.0,
		0.0,
		0.0,
		1.0,
		-1.0,
		0.0,
		-2.0,
		2.0,
		-2.0,
		2.0,
		0.0
	]);
	runTestCase( 'upper', 4, A, tc );
});

test( 'zpstrf: rank_deficient_4x4_lower', function t() {
	const tc = rank_deficient_4x4_lower;
	const A = new Float64Array([
		3.0,
		0.0,
		2.0,
		0.0,
		5.0,
		1.0,
		1.0,
		1.0,
		0.0,
		0.0,
		3.0,
		0.0,
		4.0,
		1.0,
		0.0,
		2.0,
		0.0,
		0.0,
		0.0,
		0.0,
		9.0,
		0.0,
		2.0,
		2.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		2.0,
		0.0
	]);
	runTestCase( 'lower', 4, A, tc );
});

test( 'zpstrf: large upper (blocked path) matches zpstf2', function t() {
	const WORK1 = new Float64Array( 160 );
	const WORK2 = new Float64Array( 160 );
	const RANK1 = new Int32Array( 1 );
	const RANK2 = new Int32Array( 1 );
	const PIV1 = new Int32Array( 80 );
	const PIV2 = new Int32Array( 80 );
	let i;

	const N = 80;
	const A1 = randomHPSD( N, N );
	const A2 = new Complex128Array( A1 );
	const info1 = zpstrf( 'upper', N, A1, 1, N, 0, PIV1, 1, 0, RANK1, -1.0, WORK1 );
	const info2 = zpstf2( 'upper', N, A2, 1, N, 0, PIV2, 1, 0, RANK2, -1.0, WORK2 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assert.equal( RANK1[ 0 ], RANK2[ 0 ] );
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV1[ i ], PIV2[ i ], 'piv[' + i + ']' );
	}
	const Av1 = reinterpret( A1, 0 );
	const Av2 = reinterpret( A2, 0 );
	assertArrayClose( Av1, Av2, 1e-10, 'large upper blocked vs unblocked' );
});

test( 'zpstrf: large lower (blocked path) matches zpstf2', function t() {
	const WORK1 = new Float64Array( 160 );
	const WORK2 = new Float64Array( 160 );
	const RANK1 = new Int32Array( 1 );
	const RANK2 = new Int32Array( 1 );
	const PIV1 = new Int32Array( 80 );
	const PIV2 = new Int32Array( 80 );
	let i;

	const N = 80;
	const A1 = randomHPSD( N, N );
	const A2 = new Complex128Array( A1 );
	const info1 = zpstrf( 'lower', N, A1, 1, N, 0, PIV1, 1, 0, RANK1, -1.0, WORK1 );
	const info2 = zpstf2( 'lower', N, A2, 1, N, 0, PIV2, 1, 0, RANK2, -1.0, WORK2 );
	assert.equal( info1, 0 );
	assert.equal( info2, 0 );
	assert.equal( RANK1[ 0 ], RANK2[ 0 ] );
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV1[ i ], PIV2[ i ], 'piv[' + i + ']' );
	}
	const Av1 = reinterpret( A1, 0 );
	const Av2 = reinterpret( A2, 0 );
	assertArrayClose( Av1, Av2, 1e-10, 'large lower blocked vs unblocked' );
});

test( 'zpstrf: large rank-deficient upper (blocked path)', function t() {
	const WORK1 = new Float64Array( 160 );
	const WORK2 = new Float64Array( 160 );
	const RANK1 = new Int32Array( 1 );
	const RANK2 = new Int32Array( 1 );
	const PIV1 = new Int32Array( 80 );
	const PIV2 = new Int32Array( 80 );
	let i;

	const N = 80;
	const rank = 40;
	const A1 = randomHPSD( N, rank );
	const A2 = new Complex128Array( A1 );
	const info1 = zpstrf( 'upper', N, A1, 1, N, 0, PIV1, 1, 0, RANK1, -1.0, WORK1 );
	const info2 = zpstf2( 'upper', N, A2, 1, N, 0, PIV2, 1, 0, RANK2, -1.0, WORK2 );
	assert.equal( info1, 1 );
	assert.equal( info2, 1 );
	assert.equal( RANK1[ 0 ], RANK2[ 0 ] );
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV1[ i ], PIV2[ i ], 'piv[' + i + ']' );
	}
	const Av1 = reinterpret( A1, 0 );
	const Av2 = reinterpret( A2, 0 );
	assertArrayClose( Av1, Av2, 1e-10, 'large rank-deficient upper' );
});

test( 'zpstrf: large rank-deficient lower (blocked path)', function t() {
	const WORK1 = new Float64Array( 160 );
	const WORK2 = new Float64Array( 160 );
	const RANK1 = new Int32Array( 1 );
	const RANK2 = new Int32Array( 1 );
	const PIV1 = new Int32Array( 80 );
	const PIV2 = new Int32Array( 80 );
	let i;

	const N = 80;
	const rank = 40;
	const A1 = randomHPSD( N, rank );
	const A2 = new Complex128Array( A1 );
	const info1 = zpstrf( 'lower', N, A1, 1, N, 0, PIV1, 1, 0, RANK1, -1.0, WORK1 );
	const info2 = zpstf2( 'lower', N, A2, 1, N, 0, PIV2, 1, 0, RANK2, -1.0, WORK2 );
	assert.equal( info1, 1 );
	assert.equal( info2, 1 );
	assert.equal( RANK1[ 0 ], RANK2[ 0 ] );
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV1[ i ], PIV2[ i ], 'piv[' + i + ']' );
	}
	const Av1 = reinterpret( A1, 0 );
	const Av2 = reinterpret( A2, 0 );
	assertArrayClose( Av1, Av2, 1e-10, 'large rank-deficient lower' );
});
