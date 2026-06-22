import __imp0 from './fixtures/upper_3x3_1rhs.json' with { type: 'json' };
import __imp1 from './fixtures/lower_3x3_2rhs.json' with { type: 'json' };
import __imp2 from './fixtures/n1.json' with { type: 'json' };
import __imp3 from './fixtures/upper_4x4_pivot.json' with { type: 'json' };
import __imp4 from './fixtures/lower_4x4_pivot.json' with { type: 'json' };
import __imp5 from './fixtures/upper_4x4_2x2pivot.json' with { type: 'json' };
import __imp6 from './fixtures/lower_3x3_swap.json' with { type: 'json' };
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, node/no-sync */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsptrs from '../lib/ndarray.js';


// FIXTURES //

var fixtures = {
	'upper_3x3_1rhs': __imp0,
	'lower_3x3_2rhs': __imp1,
	'n1': __imp2,
	'upper_4x4_pivot': __imp3,
	'lower_4x4_pivot': __imp4,
	'upper_4x4_2x2pivot': __imp5,
	'lower_3x3_swap': __imp6
};


// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
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
* @param {Array} actual - actual array
* @param {Array} expected - expected array
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
* Converts a typed array to a plain Array.
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

/**
* Converts Fortran 1-based IPIV to 0-based with bitwise-NOT convention for 2x2 pivots.
*
* @private
* @param {Array} ipivFortran - Fortran 1-based pivot indices
* @param {integer} N - number of pivots
* @returns {Int32Array} 0-based pivot indices
*/
function convertIPIV( ipivFortran, N ) {
	var out = new Int32Array( N );
	var i;
	for ( i = 0; i < N; i++ ) {
		if ( ipivFortran[ i ] > 0 ) {
			out[ i ] = ipivFortran[ i ] - 1;
		} else {
			out[ i ] = ~( -ipivFortran[ i ] - 1 );
		}
	}
	return out;
}

/**
* Builds a Complex128Array from a flat array of interleaved doubles.
*
* @private
* @param {Array} flatDoubles - flat array of interleaved re/im pairs
* @param {integer} nComplex - number of complex elements
* @returns {Complex128Array} complex array
*/
function buildComplex( flatDoubles, nComplex ) {
	var out = new Complex128Array( nComplex );
	var ov = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < 2 * nComplex; i++ ) {
		ov[ i ] = flatDoubles[ i ];
	}
	return out;
}

/**
* Runs a fixture-based test: loads factored AP and IPIV, runs zsptrs, and verifies x against fixture.
*
* @private
* @param {string} name - fixture test case name
* @param {string} uplo - `'upper'` or `'lower'`
*/
function runFixtureTest( name, uplo ) {
	var xExpectedV;
	var xExpected;
	var nrhs;
	var info;
	var IPIV;
	var AP;
	var Bv;
	var nn;
	var tc;
	var N;
	var B;

	tc = fixtures[ name ];
	N = tc.n;
	nrhs = tc.nrhs;
	nn = N * ( N + 1 ) / 2;

	// Build factored AP (packed, nn complex elements)
	AP = buildComplex( tc.AP_factored, nn );
	IPIV = convertIPIV( tc.ipiv, N );

	// Build B from fixture (already packed as N*nrhs)
	B = buildComplex( tc.b, N * nrhs );

	info = zsptrs( uplo, N, nrhs, AP, 1, 0, IPIV, 1, 0, B, 1, N, 0 );
	assert.strictEqual( info, 0 );

	// Build expected x
	xExpected = buildComplex( tc.x, N * nrhs );
	xExpectedV = reinterpret( xExpected, 0 );
	Bv = reinterpret( B, 0 );

	assertArrayClose( toArray( Bv ), toArray( xExpectedV ), 1e-12, name );
}


// TESTS //

test( 'zsptrs is a function', function t() {
	assert.strictEqual( typeof zsptrs, 'function' );
});

test( 'zsptrs: upper, 3x3, 1 RHS', function t() {
	runFixtureTest( 'upper_3x3_1rhs', 'upper' );
});

test( 'zsptrs: lower, 3x3, 2 RHS', function t() {
	runFixtureTest( 'lower_3x3_2rhs', 'lower' );
});

test( 'zsptrs: N=1', function t() {
	runFixtureTest( 'n1', 'upper' );
});

test( 'zsptrs: N=0 (quick return)', function t() {
	var IPIV;
	var info;
	var AP;
	var B;

	AP = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	B = new Complex128Array( 1 );
	info = zsptrs( 'upper', 0, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zsptrs: nrhs=0 (quick return)', function t() {
	var IPIV;
	var info;
	var AP;
	var B;

	AP = new Complex128Array( 3 );
	IPIV = new Int32Array( 2 );
	B = new Complex128Array( 1 );
	info = zsptrs( 'upper', 2, 0, AP, 1, 0, IPIV, 1, 0, B, 1, 2, 0 );
	assert.strictEqual( info, 0 );
});

test( 'zsptrs: upper, 4x4, 1 RHS with 2x2 pivots', function t() {
	runFixtureTest( 'upper_4x4_pivot', 'upper' );
});

test( 'zsptrs: lower, 4x4, 2 RHS with 2x2 pivots', function t() {
	runFixtureTest( 'lower_4x4_pivot', 'lower' );
});

test( 'zsptrs: upper, 4x4, 1 RHS with upper 2x2 pivots', function t() {
	runFixtureTest( 'upper_4x4_2x2pivot', 'upper' );
});

test( 'zsptrs: lower, 3x3, 1 RHS with row swap', function t() {
	runFixtureTest( 'lower_3x3_swap', 'lower' );
});
