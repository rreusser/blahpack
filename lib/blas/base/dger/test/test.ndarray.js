/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dger from './../lib/ndarray.js';

// FIXTURES //

import basic from './fixtures/basic.json' with { type: 'json' };
import alpha_two from './fixtures/alpha_two.json' with { type: 'json' };
import add_existing from './fixtures/add_existing.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import stride_x from './fixtures/stride_x.json' with { type: 'json' };
import neg_stride_y from './fixtures/neg_stride_y.json' with { type: 'json' };

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
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

// For col-major LDA=3, M=3, N=2: strideA1=1, strideA2=3
test( 'dger: basic 3x2', function t() {
	var tc = basic;
	var A = new Float64Array( 6 );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 1.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dger: alpha=2', function t() {
	var tc = alpha_two;
	var A = new Float64Array( 6 );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 2.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dger: add to existing', function t() {
	var tc;
	var A;
	var x;
	var y;

	tc = add_existing;
	A = new Float64Array( 6 );
	A[ 0 ] = 10.0;
	A[ 4 ] = 20.0;
	x = new Float64Array( [ 1, 2, 3 ] );
	y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 1.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dger: alpha=0', function t() {
	var tc;
	var A;
	var x;
	var y;

	tc = alpha_zero;
	A = new Float64Array( 6 );
	A[ 0 ] = 99.0;
	x = new Float64Array( [ 1, 2, 3 ] );
	y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 0.0, x, 1, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dger: M=0', function t() {
	var A = new Float64Array( [ 99 ] );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5 ] );
	dger( 0, 2, 1.0, x, 1, 0, y, 1, 0, A, 1, 1, 0 );

	// A should be unchanged
	if ( A[ 0 ] !== 99.0 ) {
		throw new Error( 'A changed when M=0' );
	}
});

test( 'dger: stride_x=2', function t() {
	var tc = stride_x;
	var A = new Float64Array( 6 );
	var x = new Float64Array( [ 1, 0, 2, 0, 3 ] );
	var y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 1.0, x, 2, 0, y, 1, 0, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});

test( 'dger: negative stride y', function t() {
	var tc = neg_stride_y;
	var A = new Float64Array( 6 );
	var x = new Float64Array( [ 1, 2, 3 ] );
	var y = new Float64Array( [ 4, 5 ] );
	dger( 3, 2, 1.0, x, 1, 0, y, -1, 1, A, 1, 3, 0 );
	assertArrayClose( A, tc.A, 1e-14, 'A' );
});
