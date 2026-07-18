/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemv from './../lib/ndarray.js';
const ndarray = dgemv;

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import transpose from './fixtures/transpose.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import transpose_alpha_beta from './fixtures/transpose_alpha_beta.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };

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

// TESTS //

// A = [1 4; 2 5; 3 6] column-major (3x2): strideA1=1, strideA2=3
const A = new Float64Array( [ 1, 2, 3, 4, 5, 6 ] );

test( 'dgemv: basic trans=N', function t() {
	const tc = basic;
	const x = new Float64Array( [ 1, 2 ] );
	const y = new Float64Array( 3 );
	dgemv( 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'basic' );
});

test( 'dgemv: transpose trans=T', function t() {
	const tc = transpose;
	const x = new Float64Array( [ 1, 2, 3 ] );
	const y = new Float64Array( 2 );
	dgemv( 'transpose', 3, 2, 1.0, A, 1, 3, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'transpose' );
});

test( 'dgemv: alpha and beta scaling', function t() {
	const tc = alpha_beta;
	const x = new Float64Array( [ 1, 2 ] );
	const y = new Float64Array( [ 10, 20, 30 ] );
	dgemv( 'no-transpose', 3, 2, 2.0, A, 1, 3, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'alpha_beta' );
});

test( 'dgemv: N=0 quick return', function t() {
	const tc = n_zero;
	const y = new Float64Array( [ 99 ] );
	dgemv( 'no-transpose', 3, 0, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'n_zero' );
});

test( 'dgemv: M=0 quick return', function t() {
	const tc = m_zero;
	const y = new Float64Array( [ 99 ] );
	dgemv( 'no-transpose', 0, 2, 1.0, A, 1, 1, 0, new Float64Array( 2 ), 1, 0, 0.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'm_zero' );
});

test( 'dgemv: non-unit strides incx=2, incy=2', function t() {

	const tc = stride;
	const x = new Float64Array( 20 );
	x[ 0 ] = 1;
	x[ 2 ] = 2;
	const y = new Float64Array( 20 );
	y[ 0 ] = 10;
	y[ 2 ] = 20;
	y[ 4 ] = 30;
	dgemv( 'no-transpose', 3, 2, 1.0, A, 1, 3, 0, x, 2, 0, 1.0, y, 2, 0 );
	assertArrayClose( y.subarray( 0, 6 ), tc.y, 1e-14, 'stride' );
});

test( 'dgemv: transpose with alpha and beta', function t() {
	const tc = transpose_alpha_beta;
	const x = new Float64Array( [ 1, 1, 1 ] );
	const y = new Float64Array( [ 5, 10 ] );
	dgemv( 'transpose', 3, 2, 2.0, A, 1, 3, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'transpose_alpha_beta' );
});

test( 'dgemv: alpha=0 just scales y by beta', function t() {
	const tc = alpha_zero;
	const y = new Float64Array( [ 10, 20, 30 ] );
	dgemv( 'no-transpose', 3, 2, 0.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 2.0, y, 1, 0 ); // eslint-disable-line max-len
	assertArrayClose( y, tc.y, 1e-14, 'alpha_zero' );
});

// ndarray validation tests

test( 'dgemv: ndarray throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dgemv: ndarray throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', -1, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, -1, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 3 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dgemv: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		ndarray( 'no-transpose', 2, 2, 1.0, A, 1, 3, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 3 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

// The blocked kernel has separate four-wide main loops and scalar remainder
// loops in both dot and axpy form; sizes >= 8 with remainders exercise all
// four, in both storage orders.

/**
* Computes reference gemv with plain loops.
*
* @private
* @param {string} trans - transpose mode
* @param {NonNegativeInteger} M - rows of A
* @param {NonNegativeInteger} N - columns of A
* @param {number} alpha - scalar
* @param {Float64Array} A - matrix
* @param {integer} sa1 - stride of first dimension
* @param {integer} sa2 - stride of second dimension
* @param {Float64Array} x - input vector
* @param {number} beta - scalar
* @param {Float64Array} y - output vector (mutated)
* @returns {Float64Array} `y`
*/
function naiveGemv( trans, M, N, alpha, A, sa1, sa2, x, beta, y ) {
	let sum, i, j;
	const leny = ( trans === 'no-transpose' ) ? M : N;
	const lenx = ( trans === 'no-transpose' ) ? N : M;
	for ( i = 0; i < leny; i++ ) {
		sum = 0.0;
		for ( j = 0; j < lenx; j++ ) {
			if ( trans === 'no-transpose' ) {
				sum += A[ ( i * sa1 ) + ( j * sa2 ) ] * x[ j ];
			} else {
				sum += A[ ( j * sa1 ) + ( i * sa2 ) ] * x[ j ];
			}
		}
		y[ i ] = ( alpha * sum ) + ( beta * y[ i ] );
	}
	return y;
}

test( 'dgemv: blocked main loops + remainders (9x7, both trans, both layouts)', function t() {
	let expected, trans, yref, lenx, leny, act, sa1, sa2, A9, x9, y9, tc, i;
	const cases = [
		[ 'no-transpose', 1, 9, 'col' ],
		[ 'transpose', 1, 9, 'col' ],
		[ 'no-transpose', 7, 1, 'row' ],
		[ 'transpose', 7, 1, 'row' ]
	];
	for ( tc = 0; tc < cases.length; tc++ ) {
		trans = cases[ tc ][ 0 ];
		sa1 = cases[ tc ][ 1 ];
		sa2 = cases[ tc ][ 2 ];
		lenx = ( trans === 'no-transpose' ) ? 7 : 9;
		leny = ( trans === 'no-transpose' ) ? 9 : 7;
		A9 = new Float64Array( 63 );
		for ( i = 0; i < 63; i++ ) {
			A9[ i ] = Math.sin( i + 1.0 );
		}
		x9 = new Float64Array( lenx );
		for ( i = 0; i < lenx; i++ ) {
			x9[ i ] = Math.cos( i + 0.5 );
		}
		y9 = new Float64Array( leny );
		for ( i = 0; i < leny; i++ ) {
			y9[ i ] = 1.0 / ( i + 2.0 );
		}
		yref = new Float64Array( y9 );
		expected = naiveGemv( trans, 9, 7, 0.7, A9, sa1, sa2, x9, 0.3, yref );
		act = ndarray( trans, 9, 7, 0.7, A9, sa1, sa2, 0, x9, 1, 0, 0.3, y9, 1, 0 ); // eslint-disable-line max-len
		assertArrayClose( act, expected, 1.0e-12, 'case ' + tc + ' (' + trans + ', ' + cases[ tc ][ 3 ] + ')' );
	}
});
