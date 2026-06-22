/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zpstf2 from './../lib/ndarray.js';

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
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
	var i;
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
	var RANK;
	var WORK;
	var info;
	var PIV;
	var Av;
	var A;
	var i;

	A = new Complex128Array( AFlat );
	PIV = new Int32Array( N );
	RANK = new Int32Array( 1 );
	WORK = new Float64Array( 2 * N );

	info = zpstf2( uplo, N, A, 1, N, 0, PIV, 1, 0, RANK, -1.0, WORK );

	assert.equal( info, tc.info, 'info' );
	assert.equal( RANK[ 0 ], tc.rank, 'rank' );

	// Compare A (factorized matrix as interleaved re/im)
	Av = reinterpret( A, 0 );
	assertArrayClose( Av, new Float64Array( tc.a ), 1e-14, 'A' );

	// Compare PIV (Fortran is 1-based, JS is 0-based)
	for ( i = 0; i < N; i++ ) {
		assert.equal( PIV[ i ], tc.piv[ i ] - 1, 'piv[' + i + ']' );
	}
}

// TESTS //

test( 'zpstf2: upper_3x3', function t() {
	var tc = upper_3x3;

	// Upper storage of Hermitian 3x3: A(1,1)=10, A(1,2)=(2+i), A(2,2)=8,

	// A(1,3)=(3-2i), A(2,3)=(1+i), A(3,3)=6

	// Column-major, interleaved re/im:
	var A = new Float64Array([
		// Col 0
		10.0,
		0.0,  // (0,0)
		0.0,
		0.0,   // (1,0) — not stored
		0.0,
		0.0,   // (2,0) — not stored

		// Col 1
		2.0,
		1.0,   // (0,1)
		8.0,
		0.0,   // (1,1)
		0.0,
		0.0,   // (2,1) — not stored

		// Col 2
		3.0,
		-2.0,  // (0,2)
		1.0,
		1.0,   // (1,2)
		6.0,
		0.0    // (2,2)
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'zpstf2: lower_3x3', function t() {
	var tc = lower_3x3;

	// Lower storage: A(1,1)=10, A(2,1)=(2-i), A(3,1)=(3+2i),

	// A(2,2)=8, A(3,2)=(1-i), A(3,3)=6
	var A = new Float64Array([
		// Col 0
		10.0,
		0.0,   // (0,0)
		2.0,
		-1.0,   // (1,0)
		3.0,
		2.0,    // (2,0)

		// Col 1
		0.0,
		0.0,    // (0,1) — not stored
		8.0,
		0.0,    // (1,1)
		1.0,
		-1.0,   // (2,1)

		// Col 2
		0.0,
		0.0,    // (0,2) — not stored
		0.0,
		0.0,    // (1,2) — not stored
		6.0,
		0.0     // (2,2)
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'zpstf2: upper_4x4', function t() {
	var tc = upper_4x4;
	var A = new Float64Array([
		// Col 0
		20.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,

		// Col 1
		1.0,
		2.0,
		15.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,

		// Col 2
		3.0,
		-1.0,
		4.0,
		2.0,
		18.0,
		0.0,
		0.0,
		0.0,

		// Col 3
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

test( 'zpstf2: lower_4x4', function t() {
	var tc = lower_4x4;
	var A = new Float64Array([
		// Col 0
		20.0,
		0.0,
		1.0,
		-2.0,
		3.0,
		1.0,
		2.0,
		-3.0,

		// Col 1
		0.0,
		0.0,
		15.0,
		0.0,
		4.0,
		-2.0,
		1.0,
		1.0,

		// Col 2
		0.0,
		0.0,
		0.0,
		0.0,
		18.0,
		0.0,
		5.0,
		-1.0,

		// Col 3
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

test( 'zpstf2: rank_deficient_upper', function t() {
	var tc = rank_deficient_upper;

	// rank-1 matrix v*v^H, v=[1, (1+i), (2-i)]
	var A = new Float64Array([
		// Col 0
		1.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,

		// Col 1
		1.0,
		-1.0,
		2.0,
		0.0,
		0.0,
		0.0,

		// Col 2
		2.0,
		1.0,
		1.0,
		3.0,
		5.0,
		0.0
	]);
	runTestCase( 'upper', 3, A, tc );
});

test( 'zpstf2: rank_deficient_lower', function t() {
	var tc = rank_deficient_lower;

	// Same matrix, lower storage
	var A = new Float64Array([
		// Col 0
		1.0,
		0.0,
		1.0,
		1.0,
		2.0,
		-1.0,

		// Col 1
		0.0,
		0.0,
		2.0,
		0.0,
		1.0,
		-3.0,

		// Col 2
		0.0,
		0.0,
		0.0,
		0.0,
		5.0,
		0.0
	]);
	runTestCase( 'lower', 3, A, tc );
});

test( 'zpstf2: n_zero', function t() {
	var RANK;
	var WORK;
	var info;
	var PIV;
	var A;

	RANK = new Int32Array( 1 );
	WORK = new Float64Array( 0 );
	PIV = new Int32Array( 0 );
	A = new Complex128Array( 0 );
	info = zpstf2( 'upper', 0, A, 1, 0, 0, PIV, 1, 0, RANK, -1.0, WORK );
	assert.equal( info, 0, 'info' );
});

test( 'zpstf2: n_one', function t() {
	var tc = n_one;
	var A = new Float64Array([ 9.0, 0.0 ]);
	runTestCase( 'upper', 1, A, tc );
});

test( 'zpstf2: rank_deficient_4x4_upper', function t() {
	var tc = rank_deficient_4x4_upper;

	// rank-2 matrix
	var A = new Float64Array([
		// Col 0
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,

		// Col 1
		2.0,
		0.0,
		3.0,
		0.0,
		0.0,
		0.0,
		0.0,
		0.0,

		// Col 2
		5.0,
		-1.0,
		4.0,
		-1.0,
		9.0,
		0.0,
		0.0,
		0.0,

		// Col 3
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

test( 'zpstf2: rank_deficient_4x4_lower', function t() {
	var tc = rank_deficient_4x4_lower;

	// Same matrix, lower storage
	var A = new Float64Array([
		// Col 0
		3.0,
		0.0,
		2.0,
		0.0,
		5.0,
		1.0,
		1.0,
		1.0,

		// Col 1
		0.0,
		0.0,
		3.0,
		0.0,
		4.0,
		1.0,
		0.0,
		2.0,

		// Col 2
		0.0,
		0.0,
		0.0,
		0.0,
		9.0,
		0.0,
		2.0,
		2.0,

		// Col 3
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
