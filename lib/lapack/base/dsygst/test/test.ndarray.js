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
* MakeBUpper.
*
* @private
* @returns {*} result
*/
function makeBUpper() {
	const B = new Float64Array([
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
	const B = new Float64Array([
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
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

// TESTS //

test( 'dsygst: itype1_upper', function t() {

	const tc = itype1_upper;
	const A = makeAUpper();
	const B = makeBUpper();
	const info = dsygst( 1, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype1_lower', function t() {

	const tc = itype1_lower;
	const A = makeALower();
	const B = makeBLower();
	const info = dsygst( 1, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype2_upper', function t() {

	const tc = itype2_upper;
	const A = makeAUpper();
	const B = makeBUpper();
	const info = dsygst( 2, 'upper', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype2_lower', function t() {

	const tc = itype2_lower;
	const A = makeALower();
	const B = makeBLower();
	const info = dsygst( 2, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: itype3_lower', function t() {

	const tc = itype3_lower;
	const A = makeALower();
	const B = makeBLower();
	const info = dsygst( 3, 'lower', 3, A, 1, 3, 0, B, 1, 3, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-14, 'A' );
});

test( 'dsygst: n_zero', function t() {

	const tc = n_zero;
	const A = new Float64Array( 1 );
	const B = new Float64Array( 1 );
	const info = dsygst( 1, 'upper', 0, A, 1, 1, 0, B, 1, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dsygst: n_one', function t() {

	const tc = n_one;
	const A = new Float64Array([ 9.0 ]);
	const B = new Float64Array([ 3.0 ]);
	const info = dsygst( 1, 'upper', 1, A, 1, 1, 0, B, 1, 1, 0 );
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
	const N = 70;
	const B = new Float64Array( N * N );
	let i, j;
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
	const N = 70;
	const A = new Float64Array( N * N );
	let i, j;
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
	const N = 70;
	const A = new Float64Array( N * N );
	let i, j;
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

	const tc = blocked_itype1_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = dsygst( 1, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype1 lower N=70', function t() {

	const tc = blocked_itype1_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = dsygst( 1, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype2 upper N=70', function t() {

	const tc = blocked_itype2_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = dsygst( 2, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype2 lower N=70', function t() {

	const tc = blocked_itype2_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = dsygst( 2, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype3 upper N=70', function t() {

	const tc = blocked_itype3_upper_70;
	const N = 70;
	const B = makeBigB( 'upper' );
	const A = makeBigAUpper();
	const info = dsygst( 3, 'upper', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});

test( 'dsygst: blocked itype3 lower N=70', function t() {

	const tc = blocked_itype3_lower_70;
	const N = 70;
	const B = makeBigB( 'lower' );
	const A = makeBigALower();
	const info = dsygst( 3, 'lower', N, A, 1, N, 0, B, 1, N, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( A ), tc.A, 1e-10, 'A' );
});
