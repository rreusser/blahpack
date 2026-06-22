/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsyconv from './../lib/ndarray.js';

// FIXTURES //

import upper_convert from './fixtures/upper_convert.json' with { type: 'json' };
import upper_revert from './fixtures/upper_revert.json' with { type: 'json' };
import lower_convert from './fixtures/lower_convert.json' with { type: 'json' };
import lower_revert from './fixtures/lower_revert.json' with { type: 'json' };
import n1_upper from './fixtures/n1_upper.json' with { type: 'json' };
import n1_lower from './fixtures/n1_lower.json' with { type: 'json' };
import upper_2x2_convert from './fixtures/upper_2x2_convert.json' with { type: 'json' };
import upper_2x2_revert from './fixtures/upper_2x2_revert.json' with { type: 'json' };
import lower_2x2_convert from './fixtures/lower_2x2_convert.json' with { type: 'json' };
import lower_2x2_revert from './fixtures/lower_2x2_revert.json' with { type: 'json' };

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
* Convert Fortran 1-based IPIV to JS 0-based IPIV.
* Positive values: subtract 1 (e.g. 2 -> 1).
* Negative values: use bitwise NOT encoding for 0-based index
*   Fortran -p means 1-based row p, so 0-based row is p-1, encoded as ~(p-1).
*   Since ~(p-1) = -p, the encoding is the same numeric value as Fortran.
*
* @private
* @param {Array} ipivFortran - Fortran 1-based IPIV array
* @returns {Int32Array} 0-based IPIV
*/
function convertIPIV( ipivFortran ) {
	var out = new Int32Array( ipivFortran.length );
	var i;
	for ( i = 0; i < ipivFortran.length; i++ ) {
		if ( ipivFortran[ i ] >= 0 ) {
			out[ i ] = ipivFortran[ i ] - 1;
		} else {
			// Fortran -p (1-based row p) -> JS ~(p-1) = -p (same value)
			out[ i ] = ipivFortran[ i ];
		}
	}
	return out;
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

test( 'dsyconv: upper_convert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;

	tc = upper_convert;
	N = 4;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	info = dsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: upper_revert (all 1x1 pivots)', function t() {
	var tcConv;
	var tcRev;
	var IPIV;
	var info;
	var N;
	var A;
	var E;

	tcConv = upper_convert;
	tcRev = upper_revert;
	N = 4;
	A = new Float64Array( tcConv.a_converted );
	IPIV = convertIPIV( tcConv.ipiv_trf );
	E = new Float64Array( tcConv.e );
	info = dsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'dsyconv: lower_convert (all 1x1 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;

	tc = lower_convert;
	N = 4;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	info = dsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: lower_revert (all 1x1 pivots)', function t() {
	var tcConv;
	var tcRev;
	var IPIV;
	var info;
	var N;
	var A;
	var E;

	tcConv = lower_convert;
	tcRev = lower_revert;
	N = 4;
	A = new Float64Array( tcConv.a_converted );
	IPIV = convertIPIV( tcConv.ipiv_trf );
	E = new Float64Array( tcConv.e );
	info = dsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'dsyconv: n1_upper', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;

	tc = n1_upper;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Float64Array( 1 );
	info = dsyconv( 'upper', 'convert', 1, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: n1_lower', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;

	tc = n1_lower;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Float64Array( 1 );
	info = dsyconv( 'lower', 'convert', 1, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: upper_2x2_convert (with 2x2 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;

	tc = upper_2x2_convert;
	N = 4;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	info = dsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: upper_2x2_revert (with 2x2 pivots)', function t() {
	var tcConv;
	var tcRev;
	var IPIV;
	var info;
	var N;
	var A;
	var E;

	tcConv = upper_2x2_convert;
	tcRev = upper_2x2_revert;
	N = 4;
	A = new Float64Array( tcConv.a_converted );
	IPIV = convertIPIV( tcConv.ipiv_trf );
	E = new Float64Array( tcConv.e );
	info = dsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'dsyconv: lower_2x2_convert (with 2x2 pivots)', function t() {
	var IPIV;
	var info;
	var tc;
	var N;
	var A;
	var E;

	tc = lower_2x2_convert;
	N = 4;
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	info = dsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( E ), tc.e, 1e-14, 'e' );
});

test( 'dsyconv: lower_2x2_revert (with 2x2 pivots)', function t() {
	var tcConv;
	var tcRev;
	var IPIV;
	var info;
	var N;
	var A;
	var E;

	tcConv = lower_2x2_convert;
	tcRev = lower_2x2_revert;
	N = 4;
	A = new Float64Array( tcConv.a_converted );
	IPIV = convertIPIV( tcConv.ipiv_trf );
	E = new Float64Array( tcConv.e );
	info = dsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( A ), tcRev.a_reverted, 1e-14, 'a_reverted' );
});

test( 'dsyconv: N=0 returns immediately', function t() {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Float64Array( 0 );
	IPIV = new Int32Array( 0 );
	E = new Float64Array( 0 );
	info = dsyconv( 'upper', 'convert', 0, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info upper convert' );
	info = dsyconv( 'lower', 'revert', 0, A, 1, 1, 0, IPIV, 1, 0, E, 1, 0 );
	assert.equal( info, 0, 'info lower revert' );
});

test( 'dsyconv: round-trip upper convert then revert restores A', function t() {
	var Aorig;
	var IPIV;
	var tc;
	var N;
	var A;
	var E;

	tc = upper_2x2_convert;
	N = 4;
	Aorig = new Float64Array( tc.a_factored );
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	dsyconv( 'upper', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	dsyconv( 'upper', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assertArrayClose( toArray( A ), toArray( Aorig ), 1e-14, 'round-trip' );
});

test( 'dsyconv: round-trip lower convert then revert restores A', function t() {
	var Aorig;
	var IPIV;
	var tc;
	var N;
	var A;
	var E;

	tc = lower_2x2_convert;
	N = 4;
	Aorig = new Float64Array( tc.a_factored );
	A = new Float64Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Float64Array( N );
	dsyconv( 'lower', 'convert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	dsyconv( 'lower', 'revert', N, A, 1, N, 0, IPIV, 1, 0, E, 1, 0 );
	assertArrayClose( toArray( A ), toArray( Aorig ), 1e-14, 'round-trip' );
});
