/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsytrd from './../lib/ndarray.js';

// FIXTURES //

import upper_4x4 from './fixtures/upper_4x4.json' with { type: 'json' };
import lower_4x4 from './fixtures/lower_4x4.json' with { type: 'json' };
import n_one_upper from './fixtures/n_one_upper.json' with { type: 'json' };
import n_one_lower from './fixtures/n_one_lower.json' with { type: 'json' };
import upper_35x35 from './fixtures/upper_35x35.json' with { type: 'json' };
import lower_35x35 from './fixtures/lower_35x35.json' with { type: 'json' };

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
* Build the 4x4 SPD test matrix in column-major order.
*/
function matrix4x4() {
	// 4x4 symmetric:
	//  4  1  2  1
	//  1  5  1  2
	//  2  1  6  1
	//  1  2  1  7
	var A = new Float64Array( 16 );
	A[ 0 ] = 4.0; A[ 1 ] = 1.0; A[ 2 ] = 2.0; A[ 3 ] = 1.0;
	A[ 4 ] = 1.0; A[ 5 ] = 5.0; A[ 6 ] = 1.0; A[ 7 ] = 2.0;
	A[ 8 ] = 2.0; A[ 9 ] = 1.0; A[ 10 ] = 6.0; A[ 11 ] = 1.0;
	A[ 12 ] = 1.0; A[ 13 ] = 2.0; A[ 14 ] = 1.0; A[ 15 ] = 7.0;
	return A;
}

/**
* Build the 35x35 test matrix (same as Fortran test).
*/
function matrix35x35() {
	var A = new Float64Array( 35 * 35 );
	var i;
	var j;
	for ( j = 0; j < 35; j++ ) {
		for ( i = 0; i < 35; i++ ) {
			if ( i === j ) {
				A[ i + j * 35 ] = ( i + 1 ) + 35.0;
			} else {
				A[ i + j * 35 ] = 0.1 * ( ( ( i + 1 ) * ( j + 1 ) + ( i + 1 ) + ( j + 1 ) ) % 7 ) / 7.0; // eslint-disable-line max-len
			}
		}
	}
	// Ensure symmetric (upper triangle mirrors lower)
	for ( j = 0; j < 35; j++ ) {
		for ( i = j + 1; i < 35; i++ ) {
			A[ i + j * 35 ] = A[ j + i * 35 ];
		}
	}
	return A;
}

/**
* Extract d (diagonal), e (off-diagonal), tau arrays from dsytrd results.
*/
function extractResults( N, d, e, TAU ) {
	return {
		'd': Array.prototype.slice.call( d, 0, N ),
		'e': Array.prototype.slice.call( e, 0, N - 1 ),
		'tau': Array.prototype.slice.call( TAU, 0, N - 1 )
	};
}

// TESTS //

test( 'dsytrd: upper_4x4 (unblocked path)', function t() {
	var WORK;
	var info;
	var TAU;
	var res;
	var tc;
	var d;
	var e;
	var A;

	tc = upper_4x4;
	TAU = new Float64Array( 3 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	A = matrix4x4();
	WORK = new Float64Array( 1 );
	info = dsytrd('upper', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	res = extractResults( 4, d, e, TAU );
	assertArrayClose( res.d, tc.d, 1e-14, 'd' );
	assertArrayClose( res.e, tc.e, 1e-14, 'e' );
	assertArrayClose( res.tau, tc.tau, 1e-14, 'tau' );
});

test( 'dsytrd: lower_4x4 (unblocked path)', function t() {
	var WORK;
	var info;
	var TAU;
	var res;
	var tc;
	var d;
	var e;
	var A;

	tc = lower_4x4;
	TAU = new Float64Array( 3 );
	d = new Float64Array( 4 );
	e = new Float64Array( 3 );
	A = matrix4x4();
	WORK = new Float64Array( 1 );
	info = dsytrd('lower', 4, A, 1, 4, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	res = extractResults( 4, d, e, TAU );
	assertArrayClose( res.d, tc.d, 1e-14, 'd' );
	assertArrayClose( res.e, tc.e, 1e-14, 'e' );
	assertArrayClose( res.tau, tc.tau, 1e-14, 'tau' );
});

test( 'dsytrd: n_one_upper', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var d;
	var e;
	var A;

	tc = n_one_upper;
	TAU = new Float64Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	A = new Float64Array( [ 3.0 ] );
	WORK = new Float64Array( 1 );
	info = dsytrd('upper', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'dsytrd: n_one_lower', function t() {
	var WORK;
	var info;
	var TAU;
	var tc;
	var d;
	var e;
	var A;

	tc = n_one_lower;
	TAU = new Float64Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	A = new Float64Array( [ 5.0 ] );
	WORK = new Float64Array( 1 );
	info = dsytrd('lower', 1, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertClose( d[ 0 ], tc.d1, 1e-14, 'd1' );
});

test( 'dsytrd: n_zero', function t() {
	var WORK;
	var info;
	var TAU;
	var A;
	var d;
	var e;

	A = new Float64Array( 1 );
	d = new Float64Array( 1 );
	e = new Float64Array( 1 );
	TAU = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dsytrd('upper', 0, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytrd: upper_35x35 (blocked path)', function t() {
	var WORK;
	var info;
	var TAU;
	var res;
	var tc;
	var d;
	var e;
	var A;

	tc = upper_35x35;
	TAU = new Float64Array( 34 );
	d = new Float64Array( 35 );
	e = new Float64Array( 34 );
	A = matrix35x35();
	WORK = new Float64Array( 1 );
	info = dsytrd('upper', 35, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	res = extractResults( 35, d, e, TAU );
	assertArrayClose( res.d, tc.d, 1e-12, 'd' );
	assertArrayClose( res.e, tc.e, 1e-12, 'e' );
	assertArrayClose( res.tau, tc.tau, 1e-12, 'tau' );
});

test( 'dsytrd: lower_35x35 (blocked path)', function t() {
	var WORK;
	var info;
	var TAU;
	var res;
	var tc;
	var d;
	var e;
	var A;

	tc = lower_35x35;
	TAU = new Float64Array( 34 );
	d = new Float64Array( 35 );
	e = new Float64Array( 34 );
	A = matrix35x35();
	WORK = new Float64Array( 1 );
	info = dsytrd('lower', 35, A, 1, 35, 0, d, 1, 0, e, 1, 0, TAU, 1, 0 );
	assert.equal( info, 0, 'info' );
	res = extractResults( 35, d, e, TAU );
	assertArrayClose( res.d, tc.d, 1e-12, 'd' );
	assertArrayClose( res.e, tc.e, 1e-12, 'e' );
	assertArrayClose( res.tau, tc.tau, 1e-12, 'tau' );
});
