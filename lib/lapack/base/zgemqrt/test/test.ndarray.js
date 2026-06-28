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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zgemqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
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
* Build a Complex128Array from an interleaved `[re,im,re,im,...]` flat array (length must be `2*N`).
*
* @private
* @param {Array} flat - interleaved real/imag pairs
* @returns {Complex128Array} complex array of length flat.length/2
*/
function makeComplex( flat ) {
	var view;
	var arr;
	var i;

	arr = new Complex128Array( flat.length / 2 );
	view = reinterpret( arr, 0 );
	for ( i = 0; i < flat.length; i++ ) {
		view[ i ] = flat[ i ];
	}
	return arr;
}

/**
* Construct V/T from the small fixture (M=4, N=3, K=3, NB=2).
*
* @private
* @returns {Object} { V, T } as Complex128Arrays in column-major layout
*/
function smallVT() {
	var tc = findCase( 'qr_factors_small' );
	return {
		'V': makeComplex( tc.v ),
		'T': makeComplex( tc.t )
	};
}

/**
* Construct V/T from the multi-block fixture (M=10, N=10, K=8, NB=3).
*
* @private
* @returns {Object} { V, T } as Complex128Arrays in column-major layout
*/
function blockVT() {
	var tc = findCase( 'qr_factors_block' );
	return {
		'V': makeComplex( tc.v ),
		'T': makeComplex( tc.t )
	};
}

/**
* Construct V/T from the single-block fixture (M=5, N=4, K=4, NB=4).
*
* @private
* @returns {Object} { V, T } as Complex128Arrays in column-major layout
*/
function singleVT() {
	var tc = findCase( 'qr_factors_single' );
	return {
		'V': makeComplex( tc.v ),
		'T': makeComplex( tc.t )
	};
}

/**
* Build an M-by-N column-major identity in a Complex128Array.
*
* @private
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
* @returns {Complex128Array} identity matrix in column-major form
*/
function eye( m, n, ld ) {
	var view;
	var C;
	var k;
	var i;

	C = new Complex128Array( ld * n );
	view = reinterpret( C, 0 );
	k = ( m < n ) ? m : n;
	for ( i = 0; i < k; i++ ) {
		view[ 2 * ( ( i * ld ) + i ) ] = 1.0;
	}
	return C;
}

/**
* Fill a column-major M-by-N complex buffer; real part follows the dgemqrt cos pattern, imaginary part uses sin to give a non-trivial complex test.
*
* @private
* @param {Complex128Array} buf - destination buffer (length >= ld*N)
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillCos( buf, m, n, ld ) {
	var view = reinterpret( buf, 0 );
	var idx;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			idx = 2 * ( ( j * ld ) + i );
			view[ idx ] = Math.cos( ( i + 1 ) + ( j + 1 ) ) + 0.5;
			view[ idx + 1 ] = Math.sin( ( ( i + 1 ) * 3 ) - ( j + 1 ) ) * 0.4;
		}
	}
}

/**
* Fill a column-major M-by-N complex buffer with the single-block fixture's C pattern.
*
* @private
* @param {Complex128Array} buf - destination buffer (length >= ld*N)
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillSin( buf, m, n, ld ) {
	var view = reinterpret( buf, 0 );
	var idx;
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			idx = 2 * ( ( j * ld ) + i );
			view[ idx ] = Math.sin( ( i + 1 ) + ( 2 * ( j + 1 ) ) );
			view[ idx + 1 ] = Math.cos( ( ( i + 1 ) * 2 ) - ( j + 1 ) ) * 0.5;
		}
	}
}

/**
* Allocate a column-major 3x4 dense complex test matrix matching the Fortran fixture.
*
* @private
* @returns {Complex128Array} 3x4 column-major matrix
*/
function rect34() {
	var flat = [
		1.0,
		0.0,
		0.0,
		1.0,
		2.0,
		-0.5,
		2.0,
		0.5,
		1.0,
		-0.2,
		-1.0,
		0.3,
		-1.0,
		0.7,
		3.0,
		0.0,
		0.0,
		1.5,
		4.0,
		-0.4,
		-2.0,
		0.6,
		1.0,
		0.1
	];
	return makeComplex( flat );
}

/**
* Allocate a column-major 4x4 dense complex test matrix matching the Fortran fixture.
*
* @private
* @returns {Complex128Array} 4x4 column-major matrix
*/
function dense44() {
	var flat = [
		1.0,
		0.2,
		2.0,
		-0.5,
		-1.0,
		0.8,
		3.0,
		-0.1,
		-2.0,
		0.4,
		1.0,
		0.6,
		4.0,
		-0.7,
		0.0,
		1.0,
		3.0,
		-0.3,
		-1.0,
		0.9,
		2.0,
		0.0,
		1.0,
		-0.4,
		0.0,
		0.5,
		5.0,
		-0.2,
		-2.0,
		0.7,
		4.0,
		0.3
	];
	return makeComplex( flat );
}


// TESTS //

test( 'zgemqrt: left, no-transpose -> Q*I (small, NB=2, K=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Complex128Array( 4 * 2 );
	info = zgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: left, conjugate-transpose -> Q^H*I (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Complex128Array( 4 * 2 );
	info = zgemqrt( 'left', 'conjugate-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: right, no-transpose, rectangular C(3,4) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_rect' );
	vt = smallVT();
	C = rect34();
	WORK = new Complex128Array( 3 * 2 );
	info = zgemqrt( 'right', 'no-transpose', 3, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 3, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: right, conjugate-transpose, rectangular C(3,4) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_ctrans_rect' );
	vt = smallVT();
	C = rect34();
	WORK = new Complex128Array( 3 * 2 );
	info = zgemqrt( 'right', 'conjugate-transpose', 3, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 3, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: left, no-transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Complex128Array( 4 * 2 );
	info = zgemqrt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: left, conjugate-transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Complex128Array( 4 * 2 );
	info = zgemqrt( 'left', 'conjugate-transpose', 4, 4, 3, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-13, 'c' );
});

test( 'zgemqrt: M=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'm_zero' );
	vt = smallVT();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgemqrt( 'left', 'no-transpose', 0, 4, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgemqrt: N=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'n_zero' );
	vt = smallVT();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgemqrt( 'left', 'no-transpose', 4, 0, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgemqrt: K=0 quick return (C unchanged)', function t() {
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
	WORK = new Complex128Array( 4 * 2 );
	info = zgemqrt( 'left', 'no-transpose', 4, 4, 0, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), toArray( reinterpret( Cexp, 0 ) ), 1e-14, 'c unchanged' );
});

test( 'zgemqrt: left, no-transpose (multi-block, M=10, K=8, NB=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemqrt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: left, conjugate-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemqrt( 'left', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: right, no-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemqrt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: right, conjugate-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_ctrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemqrt( 'right', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: left, no-transpose (single-block, NB == K)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_single' );
	vt = singleVT();
	C = new Complex128Array( 25 );
	fillSin( C, 5, 5, 5 );
	WORK = new Complex128Array( 5 * 4 );
	info = zgemqrt( 'left', 'no-transpose', 5, 5, 4, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: left, conjugate-transpose (single-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_single' );
	vt = singleVT();
	C = new Complex128Array( 25 );
	fillSin( C, 5, 5, 5 );
	WORK = new Complex128Array( 5 * 4 );
	info = zgemqrt( 'left', 'conjugate-transpose', 5, 5, 4, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( toArray( reinterpret( C, 0 ) ), tc.c, 1e-12, 'c' );
});

test( 'zgemqrt: round trip Q^H * Q * C === C (left, multi-block)', function t() {
	var Cview;
	var Oview;
	var Corig;
	var WORK;
	var vt;
	var C;

	vt = blockVT();
	C = new Complex128Array( 100 );
	Corig = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	Cview = reinterpret( C, 0 );
	Oview = reinterpret( Corig, 0 );
	Oview.set( Cview );
	WORK = new Complex128Array( 10 * 3 );
	zgemqrt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	zgemqrt( 'left', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assertArrayClose( toArray( Cview ), toArray( Oview ), 1e-11, 'C round trip' );
});

test( 'zgemqrt: round trip C * Q * Q^H === C (right, multi-block)', function t() {
	var Cview;
	var Oview;
	var Corig;
	var WORK;
	var vt;
	var C;

	vt = blockVT();
	C = new Complex128Array( 100 );
	Corig = new Complex128Array( 100 );
	fillCos( C, 10, 10, 10 );
	Cview = reinterpret( C, 0 );
	Oview = reinterpret( Corig, 0 );
	Oview.set( Cview );
	WORK = new Complex128Array( 10 * 3 );
	zgemqrt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	zgemqrt( 'right', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 10, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assertArrayClose( toArray( Cview ), toArray( Oview ), 1e-11, 'C round trip' );
});

test( 'zgemqrt: validator rejects invalid side', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemqrt( 'L', 'no-transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zgemqrt: validator rejects invalid trans', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemqrt( 'left', 'C', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zgemqrt: validator rejects plain `transpose` for unitary operator', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemqrt( 'left', 'transpose', 4, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zgemqrt: validator rejects negative M, N, K', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad1() {
		zgemqrt( 'left', 'no-transpose', -1, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemqrt( 'left', 'no-transpose', 4, -1, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad3() {
		zgemqrt( 'left', 'no-transpose', 4, 4, -1, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zgemqrt: validator rejects invalid nb', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemqrt( 'left', 'no-transpose', 4, 4, 3, 0, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemqrt( 'left', 'no-transpose', 4, 4, 3, 5, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zgemqrt: validator rejects K > Q', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad1() {
		zgemqrt( 'left', 'no-transpose', 2, 4, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemqrt( 'right', 'no-transpose', 4, 2, 3, 2, V, 1, 4, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});
