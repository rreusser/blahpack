/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-lines */

// MODULES //

import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zsyconvf from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var raw = fs.readFileSync( path.join( fixtureDir, 'zsyconvf.jsonl' ), 'utf8' ); // eslint-disable-line node/no-sync
var lines = raw.trim().split( '\n' );
var fixture = lines.map( parseLine );

/**
* Parses one JSON line.
*
* @private
* @param {string} line - JSON line
* @returns {Object} parsed object
*/
function parseLine( line ) {
	return JSON.parse( line );
}


// FUNCTIONS //

/**
* Finds a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	var i;
	for ( i = 0; i < fixture.length; i++ ) {
		if ( fixture[ i ].name === name ) {
			return fixture[ i ];
		}
	}
	return null;
}

/**
* Asserts that two scalars are within a relative tolerance.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise close.
*
* @private
* @param {ArrayLike} actual - actual array
* @param {ArrayLike} expected - expected array
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
* Converts Fortran 1-based IPIV to JS 0-based IPIV.
* Positive values: subtract 1. Negative values: preserved (Fortran `-p`
* equals JS `~(p-1)`, same numeric value).
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
			out[ i ] = ipivFortran[ i ];
		}
	}
	return out;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {Collection} arr - input array
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
* Asserts that a JS (0-based) IPIV matches a Fortran (1-based) IPIV fixture.
*
* @private
* @param {Int32Array} jsIPIV - JS 0-based IPIV
* @param {Array} fortranIPIV - Fortran 1-based IPIV
* @param {string} msg - assertion message
*/
function assertIPIVEq( jsIPIV, fortranIPIV, msg ) {
	var expected = convertIPIV( fortranIPIV );
	var i;
	assert.equal( jsIPIV.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < jsIPIV.length; i++ ) {
		assert.equal( jsIPIV[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

/**
* Helper that runs the convert path on a fixture case and asserts the result.
*
* @private
* @param {string} uplo - uplo string
* @param {Object} tc - fixture case
* @param {NonNegativeInteger} N - matrix order
*/
function runConvert( uplo, tc, N ) {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv_trf );
	E = new Complex128Array( N );
	info = zsyconvf( uplo, 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
	assertIPIVEq( IPIV, tc.ipiv_conv, 'ipiv_conv' );
}

/**
* Helper that runs the revert path on a fixture case and asserts the result.
*
* @private
* @param {string} uplo - uplo string
* @param {Object} tcConv - convert fixture case
* @param {Object} tcRev - revert fixture case
* @param {NonNegativeInteger} N - matrix order
*/
function runRevert( uplo, tcConv, tcRev, N ) {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( tcConv.a_converted );
	IPIV = convertIPIV( tcConv.ipiv_conv );
	E = new Complex128Array( tcConv.e );
	info = zsyconvf( uplo, 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tcRev.a_reverted, 1e-14, 'a_reverted' );
	assertIPIVEq( IPIV, tcRev.ipiv_rev, 'ipiv_rev' );
}

test( 'zsyconvf: upper_convert (1x1 pivots)', function t() {
	runConvert( 'upper', findCase( 'upper_convert' ), 4 );
});

test( 'zsyconvf: upper_revert (1x1 pivots)', function t() {
	runRevert( 'upper', findCase( 'upper_convert' ), findCase( 'upper_revert' ), 4 );
});

test( 'zsyconvf: lower_convert (1x1 pivots)', function t() {
	runConvert( 'lower', findCase( 'lower_convert' ), 4 );
});

test( 'zsyconvf: lower_revert (1x1 pivots)', function t() {
	runRevert( 'lower', findCase( 'lower_convert' ), findCase( 'lower_revert' ), 4 );
});

test( 'zsyconvf: n1_upper', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;

	tc = findCase( 'n1_upper' );
	A = new Complex128Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Complex128Array( 1 );
	info = zsyconvf( 'upper', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf: n1_lower', function t() {
	var IPIV;
	var info;
	var tc;
	var A;
	var E;

	tc = findCase( 'n1_lower' );
	A = new Complex128Array( tc.a_factored );
	IPIV = convertIPIV( tc.ipiv );
	E = new Complex128Array( 1 );
	info = zsyconvf( 'lower', 'convert', 1, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.a_converted, 1e-14, 'a_converted' );
	assertArrayClose( toArray( reinterpret( E, 0 ) ), tc.e, 1e-14, 'e' );
});

test( 'zsyconvf: upper_2x2_convert', function t() {
	runConvert( 'upper', findCase( 'upper_2x2_convert' ), 4 );
});

test( 'zsyconvf: upper_2x2_revert', function t() {
	runRevert( 'upper', findCase( 'upper_2x2_convert' ), findCase( 'upper_2x2_revert' ), 4 );
});

test( 'zsyconvf: lower_2x2_convert', function t() {
	runConvert( 'lower', findCase( 'lower_2x2_convert' ), 4 );
});

test( 'zsyconvf: lower_2x2_revert', function t() {
	runRevert( 'lower', findCase( 'lower_2x2_convert' ), findCase( 'lower_2x2_revert' ), 4 );
});

test( 'zsyconvf: upper_swap_convert (2x2 with non-trivial swap)', function t() {
	runConvert( 'upper', findCase( 'upper_swap_convert' ), 4 );
});

test( 'zsyconvf: upper_swap_revert', function t() {
	runRevert( 'upper', findCase( 'upper_swap_convert' ), findCase( 'upper_swap_revert' ), 4 );
});

test( 'zsyconvf: lower_swap_convert (1x1 with non-trivial swap)', function t() {
	runConvert( 'lower', findCase( 'lower_swap_convert' ), 4 );
});

test( 'zsyconvf: lower_swap_revert', function t() {
	runRevert( 'lower', findCase( 'lower_swap_convert' ), findCase( 'lower_swap_revert' ), 4 );
});

test( 'zsyconvf: quick return N=0', function t() {
	var IPIV;
	var info;
	var A;
	var E;

	A = new Complex128Array( 0 );
	E = new Complex128Array( 0 );
	IPIV = new Int32Array( 0 );
	info = zsyconvf( 'upper', 'convert', 0, A, 1, 1, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsyconvf: upper round-trip with artificial 1x1 swap', function t() {
	// Exercises upper convert/revert 1x1 swap loops via a non-trivial IPIV.
	var IPIV;
	var info;
	var Av0;
	var Av;
	var A0;
	var A;
	var E;
	var N;
	var i;

	IPIV = new Int32Array( [ 0, 0, 1, 3 ] );
	N = 4;
	A0 = new Complex128Array( 16 );
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Av0 = reinterpret( A0, 0 );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < N*N; i++ ) {
		Av0[ (2*i) ] = i + 1;
		Av0[ (2*i) + 1 ] = -( i + 1 );
	}
	for ( i = 0; i < 2*N*N; i++ ) {
		Av[ i ] = Av0[ i ];
	}
	info = zsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'convert info' );
	info = zsyconvf( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'revert info' );
	assertArrayClose( toArray( Av ), toArray( Av0 ), 1e-14, 'A round-trip' );
});

test( 'zsyconvf: lower round-trip with artificial 1x1 swap', function t() {
	// Exercises lower convert/revert 1x1 swap loops.
	var IPIV;
	var info;
	var Av0;
	var Av;
	var A0;
	var A;
	var E;
	var N;
	var i;

	IPIV = new Int32Array( [ 0, 3, 2, 3 ] );
	N = 4;
	A0 = new Complex128Array( 16 );
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Av0 = reinterpret( A0, 0 );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < N*N; i++ ) {
		Av0[ (2*i) ] = i + 1;
		Av0[ (2*i) + 1 ] = -( i + 1 );
	}
	for ( i = 0; i < 2*N*N; i++ ) {
		Av[ i ] = Av0[ i ];
	}
	info = zsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'convert info' );
	info = zsyconvf( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'revert info' );
	assertArrayClose( toArray( Av ), toArray( Av0 ), 1e-14, 'A round-trip' );
});

test( 'zsyconvf: upper 2x2 pivot at non-trailing position with swap', function t() {
	// IPIV = [0, 0, -1, 3]: at i=2 (2x2), ip=~-1=0, i<N-1, ip !== i-1 → swap loop entered.
	var IPIV;
	var info;
	var Av;
	var A;
	var E;
	var N;
	var i;

	IPIV = new Int32Array( [ 0, 0, -1, 3 ] );
	N = 4;
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < N*N; i++ ) {
		Av[ (2*i) ] = i + 1;
		Av[ (2*i) + 1 ] = -( i + 1 );
	}
	info = zsyconvf( 'upper', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'convert info' );
});

test( 'zsyconvf: lower 2x2 pivot at non-leading position with swap', function t() {
	// IPIV = [0, 1, -1, 3]: at i=2 (2x2), ip=0, i>0, ip !== i+1 → swap loop entered.
	var IPIV;
	var info;
	var Av;
	var A;
	var E;
	var N;
	var i;

	IPIV = new Int32Array( [ 0, 1, -1, 3 ] );
	N = 4;
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < N*N; i++ ) {
		Av[ (2*i) ] = i + 1;
		Av[ (2*i) + 1 ] = -( i + 1 );
	}
	info = zsyconvf( 'lower', 'convert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'convert info' );
});

test( 'zsyconvf: lower revert 2x2 pivot at non-leading position', function t() {
	// IPIV = [0, 1, 2, -1]: lower revert at i=3 2x2, decrements i to 2 (i>0 true).
	var IPIV;
	var info;
	var Av;
	var A;
	var E;
	var N;
	var i;

	IPIV = new Int32Array( [ 0, 1, 2, -1 ] );
	N = 4;
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Av = reinterpret( A, 0 );
	for ( i = 0; i < N*N; i++ ) {
		Av[ (2*i) ] = i + 1;
		Av[ (2*i) + 1 ] = -( i + 1 );
	}
	info = zsyconvf( 'lower', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'zsyconvf: upper revert VALUE path with 2x2', function t() {
	// After permutations IPIV becomes [0,-2,-2,3]; value loop reinserts E[2] into A[1,2].
	var IPIV;
	var info;
	var Ev;
	var Av;
	var ia;
	var A;
	var E;
	var N;

	IPIV = new Int32Array( [ 0, -2, 2, 3 ] );
	N = 4;
	A = new Complex128Array( 16 );
	E = new Complex128Array( 4 );
	Ev = reinterpret( E, 0 );
	Ev[ 4 ] = 7.5;
	Ev[ 5 ] = -1.25;
	info = zsyconvf( 'upper', 'revert', N, A, 1, N, 0, E, 1, 0, IPIV, 1, 0 );
	assert.equal( info, 0, 'info' );
	Av = reinterpret( A, 0 );
	ia = ( 1 + ( 2 * N ) ) * 2;
	assert.equal( Av[ ia ], 7.5, 'A[1,2].re' );
	assert.equal( Av[ ia + 1 ], -1.25, 'A[1,2].im' );
});
