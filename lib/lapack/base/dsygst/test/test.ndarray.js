/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygst from './../lib/ndarray.js';
import dpotrf from '../../dpotrf/lib/base.js';

// FIXTURES //

import itype1_upper from './fixtures/itype1_upper.json' with { type: 'json' };
import itype1_lower from './fixtures/itype1_lower.json' with { type: 'json' };
import itype2_upper from './fixtures/itype2_upper.json' with { type: 'json' };
import itype2_lower from './fixtures/itype2_lower.json' with { type: 'json' };
import itype3_lower from './fixtures/itype3_lower.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import blocked_itype1_upper_70 from './fixtures/blocked_itype1_upper_70.json' with { type: 'json' };
import blocked_itype1_lower_70 from './fixtures/blocked_itype1_lower_70.json' with { type: 'json' };
import blocked_itype2_upper_70 from './fixtures/blocked_itype2_upper_70.json' with { type: 'json' };
import blocked_itype2_lower_70 from './fixtures/blocked_itype2_lower_70.json' with { type: 'json' };
import blocked_itype3_upper_70 from './fixtures/blocked_itype3_upper_70.json' with { type: 'json' };
import blocked_itype3_lower_70 from './fixtures/blocked_itype3_lower_70.json' with { type: 'json' };

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
* MakeBUpper.
*
* @private
* @returns {*} result
*/
function makeBUpper() {
	var B = new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		0.0,
		1.0,
		3.0
	]);
	dpotrf( 'upper', 3, B, 1, 3, 0 );
	return B;
}

/**
* MakeBLower.
*
* @private
* @returns {*} result
*/
function makeBLower() {
	var B = new Float64Array([
		4.0,
		2.0,
		0.0,
		0.0,
		5.0,
		1.0,
		0.0,
		0.0,
		3.0
	]);
	dpotrf( 'lower', 3, B, 1, 3, 0 );
	return B;
}

/**
* MakeAUpper.
*
* @private
* @returns {*} result
*/
function makeAUpper( ) {
	return new Float64Array([
		4.0,
		0.0,
		0.0,
		2.0,
		5.0,
		0.0,
		1.0,
		3.0,
		6.0
	]);
}

/**
* MakeALower.
*
* @private
* @returns {*} result
*/
function makeALower( ) {
	return new Float64Array([
		4.0,
		2.0,
		1.0,
		0.0,
		5.0,
		3.0,
		0.0,
		0.0,
		6.0
	]);
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	var out = [];
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsygst: itype1_upper', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype1_upper;
	A = makeAUpper();
	B = makeBUpper();
	info = dsygst( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype1_lower', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype1_lower;
	A = makeALower();
	B = makeBLower();
	info = dsygst( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype2_upper', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype2_upper;
	A = makeAUpper();
	B = makeBUpper();
	info = dsygst( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype2_lower', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype2_lower;
	A = makeALower();
	B = makeBLower();
	info = dsygst( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype3_lower', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = itype3_lower;
	A = makeALower();
	B = makeBLower();
	info = dsygst( 3, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: n_zero', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_zero;
	A = new Float64Array( 1 );
	B = new Float64Array( 1 );
	info = dsygst( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dsygst: n_one', function t() {
	var info;
	var tc;
	var A;
	var B;

	tc = n_one;
	A = new Float64Array([ 9.0 ]);
	B = new Float64Array([ 3.0 ]);
	info = dsygst( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
	assertClose( A[ 0 ], tc.A11, 1e-14, 'A11' );
});

// Helper to build N=70 diagonally dominant SPD matrix B (column-major flat)
/**
* MakeBigB.
*
* @private
* @param {*} uplo - uplo
* @returns {*} result
*/
function makeBigB( uplo ) {
	var N = 70;
	var B = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			if ( i === j ) {
				B[ j * N + i ] = N + 1.0;
			} else if ( Math.abs( i - j ) === 1 ) {
				B[ j * N + i ] = 0.5;
			}
		}
	}
	dpotrf( uplo, N, B, 1, N, 0 );
	return B;
}

// Helper to build N=70 symmetric A in upper storage (column-major flat)
/**
* MakeBigAUpper.
*
* @private
* @returns {*} result
*/
function makeBigAUpper() {
	var N = 70;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i <= j; i++ ) {
			if ( i === j ) {
				A[ j * N + i ] = 2 * N + ( i + 1 );
			} else {
				A[ j * N + i ] = 0.1 * ( ( i + 1 ) + ( j + 1 ) );
			}
		}
	}
	return A;
}

// Helper to build N=70 symmetric A in lower storage (column-major flat)
/**
* MakeBigALower.
*
* @private
* @returns {*} result
*/
function makeBigALower() {
	var N = 70;
	var A = new Float64Array( N * N );
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j; i < N; i++ ) {
			if ( i === j ) {
				A[ j * N + i ] = 2 * N + ( i + 1 );
			} else {
				A[ j * N + i ] = 0.1 * ( ( i + 1 ) + ( j + 1 ) );
			}
		}
	}
	return A;
}

test( 'dsygst: blocked itype1 upper N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype1_upper_70;
	N = 70;
	B = makeBigB( 'upper' );
	A = makeBigAUpper();
	info = dsygst( 1, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype1 lower N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype1_lower_70;
	N = 70;
	B = makeBigB( 'lower' );
	A = makeBigALower();
	info = dsygst( 1, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype2 upper N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype2_upper_70;
	N = 70;
	B = makeBigB( 'upper' );
	A = makeBigAUpper();
	info = dsygst( 2, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype2 lower N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype2_lower_70;
	N = 70;
	B = makeBigB( 'lower' );
	A = makeBigALower();
	info = dsygst( 2, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype3 upper N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype3_upper_70;
	N = 70;
	B = makeBigB( 'upper' );
	A = makeBigAUpper();
	info = dsygst( 3, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype3 lower N=70', function t() {
	var info;
	var tc;
	var N;
	var B;
	var A;

	tc = blocked_itype3_lower_70;
	N = 70;
	B = makeBigB( 'lower' );
	A = makeBigALower();
	info = dsygst( 3, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});
