/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsymv from './../lib/ndarray.js';
const ndarray = dsymv;

// FIXTURES //

import upper_basic from './fixtures/upper_basic.json' with { type: 'json' };
import lower_basic from './fixtures/lower_basic.json' with { type: 'json' };
import alpha_beta from './fixtures/alpha_beta.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import stride from './fixtures/stride.json' with { type: 'json' };
import lower_stride_alpha_beta from './fixtures/lower_stride_alpha_beta.json' with { type: 'json' };
import negative_stride from './fixtures/negative_stride.json' with { type: 'json' };

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

test( 'dsymv: upper_basic (uplo=U, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	const tc = upper_basic;

	// Symmetric matrix upper triangle stored in column-major:

	// Full: [[1,2,3,4],[2,5,6,7],[3,6,8,9],[4,7,9,10]]
	const A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	]);
	const x = new Float64Array([ 1, 2, 3, 4 ]);
	const y = new Float64Array([ 0, 0, 0, 0 ]);

	dsymv( 'upper', 4, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: lower_basic (uplo=L, N=4, alpha=1, beta=0, unit strides)', function t() { // eslint-disable-line max-len
	const tc = lower_basic;

	// Lower triangle stored in column-major:
	const A = new Float64Array([
		1,
		2,
		3,
		4,
		0,
		5,
		6,
		7,
		0,
		0,
		8,
		9,
		0,
		0,
		0,
		10
	]);
	const x = new Float64Array([ 1, 2, 3, 4 ]);
	const y = new Float64Array([ 0, 0, 0, 0 ]);

	dsymv( 'lower', 4, 1.0, A, 1, 4, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: alpha_beta (uplo=U, alpha=2, beta=0.5)', function t() {
	const tc = alpha_beta;
	const A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		5,
		0,
		0,
		3,
		6,
		8,
		0,
		4,
		7,
		9,
		10
	]);
	const x = new Float64Array([ 1, 2, 3, 4 ]);
	const y = new Float64Array([ 10, 20, 30, 40 ]);

	dsymv( 'upper', 4, 2.0, A, 1, 4, 0, x, 1, 0, 0.5, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: n_zero (quick return)', function t() {
	const tc = n_zero;
	const A = new Float64Array([ 1 ]);
	const x = new Float64Array([ 1 ]);
	const y = new Float64Array([ 99 ]);

	dsymv( 'upper', 0, 1.0, A, 1, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: n_one (N=1, alpha=2, beta=3)', function t() {
	const tc = n_one;
	const A = new Float64Array([ 3 ]);
	const x = new Float64Array([ 5 ]);
	const y = new Float64Array([ 7 ]);

	// y = 2*3*5 + 3*7 = 30 + 21 = 51
	dsymv( 'upper', 1, 2.0, A, 1, 1, 0, x, 1, 0, 3.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: alpha_zero (alpha=0, just scales y by beta)', function t() {
	const tc = alpha_zero;
	const A = new Float64Array([ 1, 0, 0, 0, 2, 5, 0, 0, 3, 6, 8, 0, 4, 7, 9, 10 ]);
	const x = new Float64Array([ 1, 2, 3, 4 ]);
	const y = new Float64Array([ 10, 20, 30, 40 ]);

	dsymv( 'upper', 4, 0.0, A, 1, 4, 0, x, 1, 0, 2.0, y, 1, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: stride (uplo=U, N=3, incx=2, incy=2)', function t() {
	const tc = stride;

	// Fortran upper triangle, LDA=3, N=3:

	// diagonal: A(1,1)=1, A(2,2)=2, A(3,3)=3, off-diags all 0

	// Column-major storage: [1,0,0, 0,2,0, 0,0,3]
	const A = new Float64Array([
		1,
		0,
		0,
		0,
		2,
		0,
		0,
		0,
		3
	]);
	const x = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);
	const y = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);

	dsymv( 'upper', 3, 1.0, A, 1, 3, 0, x, 2, 0, 1.0, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: lower_stride_alpha_beta (uplo=L, N=3, incx=2, incy=2, alpha=2, beta=0.5)', function t() { // eslint-disable-line max-len
	const tc = lower_stride_alpha_beta;

	// Fortran lower triangle, LDA=3, N=3:

	// A(1,1)=1, A(2,1)=2, A(3,1)=3, A(2,2)=0, A(3,2)=4, A(3,3)=0

	// Symmetric: [[1,2,3],[2,0,4],[3,4,0]]

	// Column-major storage: [1,2,3, 0,0,4, 0,0,0]
	const A = new Float64Array([
		1,
		2,
		3,
		0,
		0,
		4,
		0,
		0,
		0
	]);
	const x = new Float64Array([ 1, 0, 2, 0, 3, 0 ]);
	const y = new Float64Array([ 10, 0, 20, 0, 30, 0 ]);

	dsymv( 'lower', 3, 2.0, A, 1, 3, 0, x, 2, 0, 0.5, y, 2, 0 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: negative_stride (uplo=U, N=3, incx=-1, incy=-1)', function t() {
	const tc = negative_stride;

	// Upper triangle: [[1,2,3],[2,4,5],[3,5,6]]
	const A = new Float64Array([
		1,
		0,
		0,
		2,
		4,
		0,
		3,
		5,
		6
	]);
	const x = new Float64Array([ 1, 2, 3 ]);
	const y = new Float64Array([ 0, 0, 0 ]);

	// With incx=-1, Fortran KX = 1-(N-1)*(-1) = 3 → 0-based: offsetX = 2, strideX = -1 // eslint-disable-line max-len
	dsymv( 'upper', 3, 1.0, A, 1, 3, 0, x, -1, 2, 0.0, y, -1, 2 );
	assertArrayClose( y, tc.y, 1e-14, 'y' );
});

test( 'dsymv: returns y', function t() {

	const A = new Float64Array([ 1 ]);
	const x = new Float64Array([ 1 ]);
	const y = new Float64Array([ 0 ]);
	const result = dsymv( 'upper', 1, 1.0, A, 1, 1, 0, x, 1, 0, 0.0, y, 1, 0 );
	assert.equal( result, y );
});

test( 'dsymv: alpha=0 and beta=1 quick return does not modify y', function t() {
	const A = new Float64Array([ 1, 2, 2, 3 ]);
	const x = new Float64Array([ 1, 2 ]);
	const y = new Float64Array([ 99, 88 ]);

	dsymv( 'upper', 2, 0.0, A, 1, 2, 0, x, 1, 0, 1.0, y, 1, 0 );
	assert.equal( y[ 0 ], 99 );
	assert.equal( y[ 1 ], 88 );
});

// ndarray validation tests

test( 'dsymv: ndarray throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		ndarray( 'invalid', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dsymv: ndarray throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', -1, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsymv: ndarray throws RangeError for zero strideX', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 0, 0, 0.0, new Float64Array( 2 ), 1, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'dsymv: ndarray throws RangeError for zero strideY', function t() {
	assert.throws( function throws() {
		ndarray( 'upper', 2, 1.0, new Float64Array( 4 ), 1, 2, 0, new Float64Array( 2 ), 1, 0, 0.0, new Float64Array( 2 ), 0, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

// The blocked kernel has a four-wide main pass (rectangular sweep + 4x4
// diagonal corner) and a scalar remainder in both triangle orientations;
// N = 9 exercises all of them, and the four uplo/layout cases below cover
// both normalized kernels.

/**
* Computes reference symv with plain loops, reading only the stored triangle.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of A
* @param {number} alpha - scalar
* @param {Float64Array} A - matrix (stored triangle)
* @param {integer} sa1 - stride of first dimension
* @param {integer} sa2 - stride of second dimension
* @param {Float64Array} x - input vector
* @param {number} beta - scalar
* @param {Float64Array} y - output vector (mutated)
* @returns {Float64Array} `y`
*/
function naiveSymv( uplo, N, alpha, A, sa1, sa2, x, beta, y ) {
	let sum, lo, hi, i, j;
	for ( i = 0; i < N; i++ ) {
		sum = 0.0;
		for ( j = 0; j < N; j++ ) {
			lo = Math.min( i, j );
			hi = Math.max( i, j );
			if ( uplo === 'upper' ) {
				sum += A[ ( lo * sa1 ) + ( hi * sa2 ) ] * x[ j ];
			} else {
				sum += A[ ( hi * sa1 ) + ( lo * sa2 ) ] * x[ j ];
			}
		}
		y[ i ] = ( alpha * sum ) + ( beta * y[ i ] );
	}
	return y;
}

test( 'dsymv: blocked main pass + corner + remainder (N=9, both uplo, both layouts)', function t() {
	let expected, uplo, yref, act, sa1, sa2, A9, x9, y9, tc, i;
	const cases = [
		[ 'upper', 1, 9, 'col' ],
		[ 'upper', 9, 1, 'row' ],
		[ 'lower', 1, 9, 'col' ],
		[ 'lower', 9, 1, 'row' ]
	];
	for ( tc = 0; tc < cases.length; tc++ ) {
		uplo = cases[ tc ][ 0 ];
		sa1 = cases[ tc ][ 1 ];
		sa2 = cases[ tc ][ 2 ];
		A9 = new Float64Array( 81 );
		for ( i = 0; i < 81; i++ ) {
			A9[ i ] = Math.sin( i + 1.0 );
		}
		x9 = new Float64Array( 9 );
		for ( i = 0; i < 9; i++ ) {
			x9[ i ] = Math.cos( i + 0.5 );
		}
		y9 = new Float64Array( 9 );
		for ( i = 0; i < 9; i++ ) {
			y9[ i ] = 1.0 / ( i + 2.0 );
		}
		yref = new Float64Array( y9 );
		expected = naiveSymv( uplo, 9, 0.7, A9, sa1, sa2, x9, 0.3, yref );
		act = ndarray( uplo, 9, 0.7, A9, sa1, sa2, 0, x9, 1, 0, 0.3, y9, 1, 0 ); // eslint-disable-line max-len
		assertArrayClose( act, expected, 1.0e-12, 'case ' + tc + ' (' + uplo + ', ' + cases[ tc ][ 3 ] + ')' );
	}
});
