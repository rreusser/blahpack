/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import path from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dsytrs3 from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' ); // eslint-disable-line max-len
var lines = readFileSync( path.join( fixtureDir, 'dsytrs_3.jsonl' ), 'utf8' ).trim().split( '\n' ); // eslint-disable-line node/no-sync, max-len
var fixture = lines.map( function parse( line ) {
	return JSON.parse( line );
});


// FUNCTIONS //

/**
* Find a fixture by name.
*
* @private
* @param {string} name - test case name
* @returns {Object} fixture entry
*/
function findCase( name ) {
	return fixture.find( function find( t ) {
		return t.name === name;
	});
}

/**
* Converts a Fortran 1-based IPIV array into the JS convention used by `dsytrf_rk`/`dsytrs3`: positive 0-based indices for 1x1 blocks and bitwise-NOT-encoded indices for 2x2 blocks.
*
* @private
* @param {Array<number>} ipivF - Fortran 1-based pivot array
* @returns {Int32Array} JS-convention pivot array
*/
function convertIpiv( ipivF ) {
	var out;
	var i;
	out = new Int32Array( ipivF.length );
	for ( i = 0; i < ipivF.length; i++ ) {
		// 1x1 (positive Fortran value): subtract 1 to get 0-based row.
		// 2x2 (negative Fortran value): -kp_f equals ~(kp_f-1), the
		// bitwise-NOT encoding of the 0-based swap row.
		out[ i ] = ( ipivF[ i ] > 0 ) ? ( ipivF[ i ] - 1 ) : ipivF[ i ];
	}
	return out;
}

/**
* Asserts approximate scalar equality.
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
* Asserts approximate element-wise array equality.
*
* @private
* @param {*} actual - actual array
* @param {*} expected - expected array
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
* Run a single fixture-driven test for a square N-by-N system.
*
* @private
* @param {string} uplo - matrix triangle
* @param {NonNegativeInteger} N - order of A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Array<number>} bRhs - initial right-hand side data (column-major, length N*nrhs)
* @param {Object} tc - fixture entry
*/
function runFixture( uplo, N, nrhs, bRhs, tc ) {
	var ipiv;
	var info;
	var A;
	var e;
	var b;

	A = new Float64Array( tc.a );
	e = new Float64Array( tc.e );
	ipiv = convertIpiv( tc.ipiv );
	b = new Float64Array( bRhs );

	info = dsytrs3( uplo, N, nrhs, A, 1, N, 0, e, 1, 0, ipiv, 1, 0, b, 1, N, 0 ); // eslint-disable-line max-len
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( b, tc.b, 1e-12, 'b' );
}


// TESTS //

test( 'dsytrs3: 4x4 lower 1 rhs', function t() {
	runFixture( 'lower', 4, 1, [ 7, 10, 12, 12 ], findCase( '4x4_lower_1rhs' ) );
});

test( 'dsytrs3: 4x4 upper 1 rhs', function t() {
	runFixture( 'upper', 4, 1, [ 7, 10, 12, 12 ], findCase( '4x4_upper_1rhs' ) );
});

test( 'dsytrs3: 4x4 indefinite lower 1 rhs (2x2 pivots)', function t() {
	runFixture( 'lower', 4, 1, [ 6, 10, 12, 14 ], findCase( '4x4_indef_lower_1rhs' ) );
});

test( 'dsytrs3: 4x4 indefinite upper 1 rhs (2x2 pivots)', function t() {
	runFixture( 'upper', 4, 1, [ 6, 10, 12, 14 ], findCase( '4x4_indef_upper_1rhs' ) );
});

test( 'dsytrs3: 3x3 lower 2 rhs', function t() {
	runFixture( 'lower', 3, 2, [ 7, 9, 9, 14, 18, 18 ], findCase( '3x3_lower_2rhs' ) );
});

test( 'dsytrs3: N=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var b;
	var e;
	ipiv = new Int32Array( 1 );
	A = new Float64Array( 1 );
	b = new Float64Array( 1 );
	e = new Float64Array( 1 );
	info = dsytrs3( 'lower', 0, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytrs3: NRHS=0 quick return', function t() {
	var info;
	var ipiv;
	var A;
	var b;
	var e;
	ipiv = new Int32Array( 3 );
	A = new Float64Array( 9 );
	b = new Float64Array( 3 );
	e = new Float64Array( 3 );
	info = dsytrs3( 'lower', 3, 0, A, 1, 3, 0, e, 1, 0, ipiv, 1, 0, b, 1, 3, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dsytrs3: N=1 lower', function t() {
	runFixture( 'lower', 1, 1, [ 8.0 ], findCase( 'n_one_lower' ) );
});

test( 'dsytrs3: 5x5 lower mixed pivots', function t() {
	runFixture( 'lower', 5, 1, [ 14, 16, 7, 1, 17 ], findCase( '5x5_lower_solve' ) );
});

test( 'dsytrs3: 5x5 upper mixed pivots', function t() {
	runFixture( 'upper', 5, 1, [ 14, 16, 7, 1, 17 ], findCase( '5x5_upper_solve' ) );
});

test( 'dsytrs3: validation throws on invalid uplo', function t() {
	var ipiv = new Int32Array( 1 );
	var A = new Float64Array( 1 );
	var b = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	assert.throws( function fn() {
		dsytrs3( 'invalid', 1, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	}, TypeError );
});

test( 'dsytrs3: validation throws on negative N', function t() {
	var ipiv = new Int32Array( 1 );
	var A = new Float64Array( 1 );
	var b = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	assert.throws( function fn() {
		dsytrs3( 'lower', -1, 1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	}, RangeError );
});

test( 'dsytrs3: validation throws on negative nrhs', function t() {
	var ipiv = new Int32Array( 1 );
	var A = new Float64Array( 1 );
	var b = new Float64Array( 1 );
	var e = new Float64Array( 1 );
	assert.throws( function fn() {
		dsytrs3( 'lower', 1, -1, A, 1, 1, 0, e, 1, 0, ipiv, 1, 0, b, 1, 1, 0 );
	}, RangeError );
});
