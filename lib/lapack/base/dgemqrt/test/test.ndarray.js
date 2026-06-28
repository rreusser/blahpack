/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-lines */

// MODULES //

import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dgemqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parse a JSON line into a fixture case.
*
* @private
* @param {string} line - a JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locate a fixture case by name.
*
* @private
* @param {string} name - case name
* @returns {Object} fixture case
*/
function findCase( name ) {
	return fixture.find( matchByName );

	/**
	* Whether a case has the desired name.
	*
	* @private
	* @param {Object} t - candidate case
	* @returns {boolean} true if names match
	*/
	function matchByName( t ) {
		return t.name === name;
	}
}

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual values
* @param {Array} expected - expected values
* @param {number} tol - relative tolerance
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
* Convert a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - typed array
* @returns {Array} plain array
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
* Construct V/T from the small fixture (M=4, N=3, K=3, NB=2).
*
* @private
* @returns {Object} { V, T } as Float64Arrays in column-major layout
*/
function smallVT() {
	var tc = findCase( 'qr_factors_small' );
	return {
		'V': new Float64Array( tc.v ),
		'T': new Float64Array( tc.t )
	};
}

/**
* Construct V/T from the multi-block fixture (M=10, N=10, K=8, NB=3).
*
* @private
* @returns {Object} { V, T } as Float64Arrays in column-major layout
*/
function blockVT() {
	var tc = findCase( 'qr_factors_block' );
	return {
		'V': new Float64Array( tc.v ),
		'T': new Float64Array( tc.t )
	};
}

/**
* Construct V/T from the single-block fixture (M=5, N=4, K=4, NB=4).
*
* @private
* @returns {Object} { V, T } as Float64Arrays in column-major layout
*/
function singleVT() {
	var tc = findCase( 'qr_factors_single' );
	return {
		'V': new Float64Array( tc.v ),
		'T': new Float64Array( tc.t )
	};
}

/**
* Build an M-by-N column-major identity (square N=M only when M===N).
*
* @private
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
* @returns {Float64Array} identity matrix in column-major form
*/
function eye( m, n, ld ) {
	var k = ( m < n ) ? m : n;
	var C = new Float64Array( ld * n );
	var i;
	for ( i = 0; i < k; i++ ) {
		C[ ( i * ld ) + i ] = 1.0;
	}
	return C;
}

/**
* Fill a column-major M-by-N buffer using `cos((i+1)+(j+1))+0.5`.
*
* @private
* @param {Float64Array} buf - destination buffer (length >= ld*N)
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillCos( buf, m, n, ld ) {
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			buf[ ( j * ld ) + i ] = Math.cos( ( i + 1 ) + ( j + 1 ) ) + 0.5;
		}
	}
}

/**
* Fill a column-major M-by-N buffer using `sin((i+1)+2*(j+1))`.
*
* @private
* @param {Float64Array} buf - destination buffer (length >= ld*N)
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillSin( buf, m, n, ld ) {
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			buf[ ( j * ld ) + i ] = Math.sin( ( i + 1 ) + ( 2 * ( j + 1 ) ) );
		}
	}
}

/**
* Allocate a column-major 3x4 dense test matrix.
*
* @private
* @returns {Float64Array} 3x4 column-major matrix
*/
function rect34() {
	var C = new Float64Array( 12 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 0.0;
	C[ 2 ] = 2.0;
	C[ 3 ] = 2.0;
	C[ 4 ] = 1.0;
	C[ 5 ] = -1.0;
	C[ 6 ] = -1.0;
	C[ 7 ] = 3.0;
	C[ 8 ] = 0.0;
	C[ 9 ] = 4.0;
	C[ 10 ] = -2.0;
	C[ 11 ] = 1.0;
	return C;
}

/**
* Allocate a column-major 4x4 dense test matrix.
*
* @private
* @returns {Float64Array} 4x4 column-major matrix
*/
function dense44() {
	var C = new Float64Array( 16 );
	C[ 0 ] = 1.0;
	C[ 1 ] = 2.0;
	C[ 2 ] = -1.0;
	C[ 3 ] = 3.0;
	C[ 4 ] = -2.0;
	C[ 5 ] = 1.0;
	C[ 6 ] = 4.0;
	C[ 7 ] = 0.0;
	C[ 8 ] = 3.0;
	C[ 9 ] = -1.0;
	C[ 10 ] = 2.0;
	C[ 11 ] = 1.0;
	C[ 12 ] = 0.0;
	C[ 13 ] = 5.0;
	C[ 14 ] = -2.0;
	C[ 15 ] = 4.0;
	return C;
}


// TESTS //

test( 'dgemqrt: left, no-transpose -> Q*I (small, NB=2, K=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Float64Array( 4 * 2 );
	info = dgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: left, transpose -> Q^T*I (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_trans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Float64Array( 4 * 2 );
	info = dgemqrt( 'left', 'transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: right, no-transpose, rectangular C(3,4) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_rect' );
	vt = smallVT();
	C = rect34();
	WORK = new Float64Array( 3 * 2 );
	info = dgemqrt( 'right', 'no-transpose', 3, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 3, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: right, transpose, rectangular C(3,4) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_trans_rect' );
	vt = smallVT();
	C = rect34();
	WORK = new Float64Array( 3 * 2 );
	info = dgemqrt( 'right', 'transpose', 3, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 3, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: left, no-transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Float64Array( 4 * 2 );
	info = dgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: left, transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_trans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Float64Array( 4 * 2 );
	info = dgemqrt( 'left', 'transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-14, 'c' );
});

test( 'dgemqrt: M=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'm_zero' );
	vt = smallVT();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgemqrt( 'left', 'no-transpose', 0, 4, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgemqrt: N=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'n_zero' );
	vt = smallVT();
	C = new Float64Array( 1 );
	WORK = new Float64Array( 1 );
	info = dgemqrt( 'left', 'no-transpose', 4, 0, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'dgemqrt: K=0 quick return (C unchanged)', function t() {
	var WORK;
	var Cexp;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'k_zero' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	Cexp = eye( 4, 4, 4 );
	WORK = new Float64Array( 4 * 2 );
	info = dgemqrt( 'left', 'no-transpose', 4, 4, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), toArray( Cexp ), 1e-14, 'c unchanged' );
});

test( 'dgemqrt: left, no-transpose (multi-block, M=10, K=8, NB=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_block' );
	vt = blockVT();
	C = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Float64Array( 10 * 3 );
	info = dgemqrt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: left, transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_trans_block' );
	vt = blockVT();
	C = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Float64Array( 10 * 3 );
	info = dgemqrt( 'left', 'transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: right, no-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_block' );
	vt = blockVT();
	C = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Float64Array( 10 * 3 );
	info = dgemqrt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: right, transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_trans_block' );
	vt = blockVT();
	C = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Float64Array( 10 * 3 );
	info = dgemqrt( 'right', 'transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: left, no-transpose (single-block, NB == K)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_single' );
	vt = singleVT();
	C = new Float64Array( 25 );
	fillSin( C, 5, 5, 5 );
	WORK = new Float64Array( 5 * 4 );
	info = dgemqrt( 'left', 'no-transpose', 5, 5, 4, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: left, transpose (single-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_trans_single' );
	vt = singleVT();
	C = new Float64Array( 25 );
	fillSin( C, 5, 5, 5 );
	WORK = new Float64Array( 5 * 4 );
	info = dgemqrt( 'left', 'transpose', 5, 5, 4, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( C ), tc.c, 1e-13, 'c' );
});

test( 'dgemqrt: round trip Q^T * Q * C === C (left, multi-block)', function t() {
	var Corig;
	var WORK;
	var vt;
	var C;

	vt = blockVT();
	C = new Float64Array( 100 );
	Corig = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	Corig.set( C );
	WORK = new Float64Array( 10 * 3 );
	dgemqrt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	dgemqrt( 'left', 'transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assertArrayClose( toArray( C ), toArray( Corig ), 1e-12, 'C round trip' );
});

test( 'dgemqrt: round trip C * Q * Q^T === C (right, multi-block)', function t() {
	var Corig;
	var WORK;
	var vt;
	var C;

	vt = blockVT();
	C = new Float64Array( 100 );
	Corig = new Float64Array( 100 );
	fillCos( C, 10, 10, 10 );
	Corig.set( C );
	WORK = new Float64Array( 10 * 3 );
	dgemqrt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	dgemqrt( 'right', 'transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assertArrayClose( toArray( C ), toArray( Corig ), 1e-12, 'C round trip' );
});

test( 'dgemqrt: validator rejects invalid side', function t() {
	var WORK = new Float64Array( 8 );
	var V = new Float64Array( 12 );
	var T = new Float64Array( 6 );
	var C = new Float64Array( 16 );
	assert.throws( function bad() {
		dgemqrt( 'L', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dgemqrt: validator rejects invalid trans', function t() {
	var WORK = new Float64Array( 8 );
	var V = new Float64Array( 12 );
	var T = new Float64Array( 6 );
	var C = new Float64Array( 16 );
	assert.throws( function bad() {
		dgemqrt( 'left', 'T', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'dgemqrt: validator rejects negative M, N, K', function t() {
	var WORK = new Float64Array( 8 );
	var V = new Float64Array( 12 );
	var T = new Float64Array( 6 );
	var C = new Float64Array( 16 );
	assert.throws( function bad1() {
		dgemqrt( 'left', 'no-transpose', -1, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		dgemqrt( 'left', 'no-transpose', 4, -1, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad3() {
		dgemqrt( 'left', 'no-transpose', 4, 4, -1, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dgemqrt: validator rejects invalid nb', function t() {
	var WORK = new Float64Array( 8 );
	var V = new Float64Array( 12 );
	var T = new Float64Array( 6 );
	var C = new Float64Array( 16 );
	assert.throws( function bad() {
		dgemqrt( 'left', 'no-transpose', 4, 4, 3, 0, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		dgemqrt( 'left', 'no-transpose', 4, 4, 3, 5, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'dgemqrt: validator rejects K > Q', function t() {
	var WORK = new Float64Array( 8 );
	var V = new Float64Array( 12 );
	var T = new Float64Array( 6 );
	var C = new Float64Array( 16 );
	assert.throws( function bad1() {
		dgemqrt( 'left', 'no-transpose', 2, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		dgemqrt( 'right', 'no-transpose', 4, 2, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});
