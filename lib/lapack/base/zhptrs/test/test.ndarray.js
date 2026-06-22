/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, no-mixed-operators, node/no-sync, stdlib/require-globals */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhptrs from '../lib/ndarray.js';


// FIXTURES //

import upper3x3_1rhs from './fixtures/upper_3x3_1rhs.json' with { type: 'json' };
import lower3x3_2rhs from './fixtures/lower_3x3_2rhs.json' with { type: 'json' };
import n1Fixture from './fixtures/n1.json' with { type: 'json' };
import upper4x4Pivot from './fixtures/upper_4x4_pivot.json' with { type: 'json' };
import lower4x4Pivot from './fixtures/lower_4x4_pivot.json' with { type: 'json' };

var fixtures = {
	'upper_3x3_1rhs': upper3x3_1rhs,
	'lower_3x3_2rhs': lower3x3_2rhs,
	'n1': n1Fixture,
	'upper_4x4_pivot': upper4x4Pivot,
	'lower_4x4_pivot': lower4x4Pivot
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
* Convert Fortran 1-based IPIV to 0-based with bitwise-NOT convention for 2x2 pivots.
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
* Pack a flat double-precision B array from Fortran (LDB=NMAX) into packed N*nrhs.
*
* @private
* @param {Array} flatDoubles - flat array of double-precision values
* @param {integer} N - number of rows
* @param {integer} nrhs - number of right-hand sides
* @param {integer} LDB - leading dimension of B in Fortran
* @returns {Complex128Array} packed B array
*/
function packB( flatDoubles, N, nrhs, LDB ) {
	var out;
	var idx;
	var ov;
	var j;
	var i;
	out = new Complex128Array( N * nrhs );
	ov = reinterpret( out, 0 );
	for ( j = 0; j < nrhs; j++ ) {
		for ( i = 0; i < N; i++ ) {
			idx = 2 * ( i + (j * N) );
			ov[ idx ] = flatDoubles[ 2 * ( i + (j * LDB) ) ];
			ov[ idx + 1 ] = flatDoubles[ (2 * ( i + (j * LDB) )) + 1 ];
		}
	}
	return out;
}

/**
* Build packed AP array from fixture flat doubles.
*
* @private
* @param {Array} flatDoubles - flat array of complex doubles
* @param {integer} nn - number of packed complex elements
* @returns {Complex128Array} packed AP array
*/
function buildAP( flatDoubles, nn ) {
	var out = new Complex128Array( nn );
	var ov = reinterpret( out, 0 );
	var i;
	for ( i = 0; i < 2 * nn; i++ ) {
		ov[ i ] = flatDoubles[ i ];
	}
	return out;
}

/**
* Run a fixture-based test: load factored AP and IPIV, run zhptrs, verify x against fixture.
*
* @private
* @param {string} name - fixture test case name
* @param {string} uplo - 'upper' or 'lower'
*/
function runFixtureTest( name, uplo ) {
	var xExpectedV;
	var xExpected;
	var nrhs;
	var info;
	var IPIV;
	var LDB;
	var AP;
	var Bv;
	var nn;
	var tc;
	var N;
	var B;

	LDB = 6; // NMAX in Fortran test
	tc = fixtures[ name ];
	N = tc.n;
	nrhs = tc.nrhs;
	nn = N * ( N + 1 ) / 2;

	// Build factored AP (packed, nn complex elements)
	AP = buildAP( tc.AP_factored, nn );
	IPIV = convertIPIV( tc.ipiv, N );

	// Pack B (LDB -> N)
	B = packB( tc.b, N, nrhs, LDB );

	info = zhptrs( uplo, N, nrhs, AP, 1, 0, IPIV, 1, 0, B, 1, N, 0 );
	assert.strictEqual( info, 0 );

	// Extract x values from fixture (same LDB packing)
	xExpected = packB( tc.x, N, nrhs, LDB );
	xExpectedV = reinterpret( xExpected, 0 );
	Bv = reinterpret( B, 0 );

	assertArrayClose( toArray( Bv ), toArray( xExpectedV ), 1e-12, name ); // eslint-disable-line max-len
}


// TESTS //

test( 'zhptrs: main export is a function', function t() {
	assert.strictEqual( typeof zhptrs, 'function' );
});

test( 'zhptrs: upper 3x3, 1 RHS', function t() {
	runFixtureTest( 'upper_3x3_1rhs', 'upper' );
});

test( 'zhptrs: lower 3x3, 2 RHS', function t() {
	runFixtureTest( 'lower_3x3_2rhs', 'lower' );
});

test( 'zhptrs: N=1', function t() {
	var info;
	var IPIV;
	var AP;
	var Av;
	var Bv;
	var tc;
	var B;

	tc = fixtures[ 'n1' ];
	AP = new Complex128Array( 1 );
	Av = reinterpret( AP, 0 );
	Av[ 0 ] = tc.AP_factored[ 0 ];
	Av[ 1 ] = tc.AP_factored[ 1 ];
	B = new Complex128Array( 1 );
	Bv = reinterpret( B, 0 );
	Bv[ 0 ] = tc.b[ 0 ];
	Bv[ 1 ] = tc.b[ 1 ];
	IPIV = convertIPIV( tc.ipiv, 1 );
	info = zhptrs( 'upper', 1, 1, AP, 1, 0, IPIV, 1, 0, B, 1, 1, 0 );
	assert.strictEqual( info, 0 );
	assertArrayClose( toArray( Bv ), tc.x, 1e-14, 'n1' );
});

test( 'zhptrs: N=0', function t() {
	var info = zhptrs( 'upper', 0, 1, new Complex128Array( 1 ), 1, 0, new Int32Array( 1 ), 1, 0, new Complex128Array( 1 ), 1, 1, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'zhptrs: nrhs=0 returns 0', function t() {
	var info = zhptrs( 'upper', 3, 0, new Complex128Array( 6 ), 1, 0, new Int32Array( 3 ), 1, 0, new Complex128Array( 3 ), 1, 3, 0 ); // eslint-disable-line max-len
	assert.strictEqual( info, 0 );
});

test( 'zhptrs: upper 4x4 with 2x2 pivots', function t() {
	runFixtureTest( 'upper_4x4_pivot', 'upper' );
});

test( 'zhptrs: lower 4x4 with 2x2 pivots, 2 RHS', function t() {
	runFixtureTest( 'lower_4x4_pivot', 'lower' );
});
