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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemlqt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'zgemlqt.jsonl' ), 'utf8' ).trim().split( '\n' );
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
	* @returns {boolean} `true` if names match
	*/
	function matchByName( t ) {
		return t.name === name;
	}
}

/**
* Build a `Complex128Array` from an interleaved `[re,im,re,im,...]` array.
*
* @private
* @param {Array} arr - interleaved real/imaginary values
* @returns {Complex128Array} complex array view over a fresh buffer
*/
function toComplex( arr ) {
	var out = new Float64Array( arr.length );
	var i;
	for ( i = 0; i < arr.length; i++ ) {
		out[ i ] = arr[ i ];
	}
	return new Complex128Array( out.buffer );
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
* Asserts that two interleaved complex arrays are element-wise approximately equal.
*
* @private
* @param {Complex128Array} actual - actual values
* @param {Array} expected - expected interleaved values
* @param {number} tol - relative tolerance
* @param {string} msg - assertion message
*/
function assertComplexClose( actual, expected, tol, msg ) {
	var av = reinterpret( actual, 0 );
	var i;
	assert.equal( av.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( av[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build V/T as `Complex128Array` from the small fixture (K=3, Q=4 (left), MB=2).
*
* @private
* @returns {Object} `{ V, T }` complex arrays in column-major layout
*/
function smallVT() {
	var tc = findCase( 'lq_factors_small' );
	return {
		'V': toComplex( tc.v ),
		'T': toComplex( tc.t )
	};
}

/**
* Build V/T as `Complex128Array` from the right-side small fixture (K=3, Q=3, MB=2).
*
* @private
* @returns {Object} `{ V, T }` complex arrays in column-major layout
*/
function rsmallVT() {
	var tc = findCase( 'lq_factors_rsmall' );
	return {
		'V': toComplex( tc.v ),
		'T': toComplex( tc.t )
	};
}

/**
* Build V/T as `Complex128Array` from the multi-block fixture (K=8, Q=10, MB=3).
*
* @private
* @returns {Object} `{ V, T }` complex arrays in column-major layout
*/
function blockVT() {
	var tc = findCase( 'lq_factors_block' );
	return {
		'V': toComplex( tc.v ),
		'T': toComplex( tc.t )
	};
}

/**
* Build V/T as `Complex128Array` from the single-block fixture (K=4, Q=5, MB=4).
*
* @private
* @returns {Object} `{ V, T }` complex arrays in column-major layout
*/
function singleVT() {
	var tc = findCase( 'lq_factors_single' );
	return {
		'V': toComplex( tc.v ),
		'T': toComplex( tc.t )
	};
}

/**
* Build a complex M-by-N column-major identity (square N=M only when M===N).
*
* @private
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
* @returns {Complex128Array} identity matrix in column-major form
*/
function eye( m, n, ld ) {
	var Cv;
	var C;
	var k;
	var i;
	C = new Complex128Array( ld * n );
	Cv = reinterpret( C, 0 );
	k = ( m < n ) ? m : n;
	for ( i = 0; i < k; i++ ) {
		Cv[ ( ( ( i * ld ) + i ) * 2 ) ] = 1.0;
	}
	return C;
}

/**
* Build the dense complex 4x4 test matrix used in the Fortran test.
*
* @private
* @returns {Complex128Array} 4x4 column-major matrix
*/
function dense44() {
	var raw = [
		1.0,
		0.5,
		2.0,
		-0.3,
		-1.0,
		0.4,
		3.0,
		-0.2,
		-2.0,
		0.1,
		1.0,
		0.4,
		4.0,
		-0.5,
		0.0,
		0.3,
		3.0,
		-0.4,
		-1.0,
		0.2,
		2.0,
		0.5,
		1.0,
		-0.1,
		0.0,
		0.3,
		5.0,
		-0.2,
		-2.0,
		0.4,
		4.0,
		0.1
	];
	return toComplex( raw );
}

/**
* Build the dense rectangular complex 4x3 test matrix used in the Fortran test.
*
* @private
* @returns {Complex128Array} 4x3 column-major matrix
*/
function rect43() {
	var raw = [
		1.0,
		0.3,
		0.0,
		0.2,
		2.0,
		-0.1,
		-1.0,
		0.4,
		2.0,
		-0.4,
		1.0,
		0.5,
		-1.0,
		0.2,
		3.0,
		-0.3,
		-1.0,
		0.5,
		3.0,
		-0.2,
		0.0,
		0.4,
		-2.0,
		0.1
	];
	return toComplex( raw );
}

/**
* Fill a column-major complex M-by-N buffer using the same recipe as the multi-block Fortran test.
*
* @private
* @param {Complex128Array} buf - destination buffer (length >= ld*N)
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillCLL( buf, m, n, ld ) {
	var idx;
	var bv = reinterpret( buf, 0 );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			idx = ( ( j * ld ) + i ) * 2;
			bv[ idx ] = Math.cos( ( i + 1 ) + ( j + 1 ) ) + 0.5;
			bv[ idx + 1 ] = 0.3 * Math.sin( ( i + 1 ) + ( 2 * ( j + 1 ) ) );
		}
	}
}

/**
* Fill a column-major complex M-by-N buffer used in the single-block test.
*
* @private
* @param {Complex128Array} buf - destination buffer
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @param {NonNegativeInteger} ld - leading dimension
*/
function fillSingleC( buf, m, n, ld ) {
	var idx;
	var bv = reinterpret( buf, 0 );
	var i;
	var j;
	for ( j = 0; j < n; j++ ) {
		for ( i = 0; i < m; i++ ) {
			idx = ( ( j * ld ) + i ) * 2;
			bv[ idx ] = Math.sin( ( i + 1 ) + ( 2 * ( j + 1 ) ) );
			bv[ idx + 1 ] = 0.2 * Math.cos( ( 2 * ( i + 1 ) ) + ( j + 1 ) );
		}
	}
}


// TESTS //

test( 'zgemlqt: left, no-transpose -> Q*I (small, MB=2, K=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Complex128Array( 4 * 2 );

	// V is K(=3)-by-Q(=4) column-major: strideV1=1, strideV2=3 (LDV=K).
	info = zgemlqt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: left, conjugate-transpose -> Q^H*I (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans' );
	vt = smallVT();
	C = eye( 4, 4, 4 );
	WORK = new Complex128Array( 4 * 2 );
	info = zgemlqt( 'left', 'conjugate-transpose', 4, 4, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: right, no-transpose, rectangular C(4,3) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_rect' );
	vt = rsmallVT();
	C = rect43();
	WORK = new Complex128Array( 4 * 2 );

	// V here is K(=3)-by-Q(=3) column-major: strideV1=1, strideV2=3.
	info = zgemlqt( 'right', 'no-transpose', 4, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: right, conjugate-transpose, rectangular C(4,3) (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_ctrans_rect' );
	vt = rsmallVT();
	C = rect43();
	WORK = new Complex128Array( 4 * 2 );
	info = zgemlqt( 'right', 'conjugate-transpose', 4, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: left, no-transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Complex128Array( 4 * 2 );
	info = zgemlqt( 'left', 'no-transpose', 4, 4, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: left, conjugate-transpose on dense 4x4 (small)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_dense' );
	vt = smallVT();
	C = dense44();
	WORK = new Complex128Array( 4 * 2 );
	info = zgemlqt( 'left', 'conjugate-transpose', 4, 4, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-13, 'c' );
});

test( 'zgemlqt: M=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'm_zero' );
	vt = smallVT();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgemlqt( 'left', 'no-transpose', 0, 4, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgemlqt: N=0 quick return', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'n_zero' );
	vt = smallVT();
	C = new Complex128Array( 1 );
	WORK = new Complex128Array( 1 );
	info = zgemlqt( 'left', 'no-transpose', 4, 0, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
});

test( 'zgemlqt: K=0 quick return (C unchanged)', function t() {
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
	info = zgemlqt( 'left', 'no-transpose', 4, 4, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, Array.prototype.slice.call( reinterpret( Cexp, 0 ) ), 1e-14, 'c unchanged' );
});

test( 'zgemlqt: left, no-transpose (multi-block, M=10, K=8, MB=3)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );

	// V is K(=8)-by-Q(=10) column-major: strideV1=1, strideV2=8.
	info = zgemlqt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: left, conjugate-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemlqt( 'left', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: right, no-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_notrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemlqt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: right, conjugate-transpose (multi-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'right_ctrans_block' );
	vt = blockVT();
	C = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	info = zgemlqt( 'right', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: left, no-transpose (single-block, MB == K)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_notrans_single' );
	vt = singleVT();
	C = new Complex128Array( 25 );
	fillSingleC( C, 5, 5, 5 );
	WORK = new Complex128Array( 5 * 4 );

	// V is K(=4)-by-Q(=5) column-major: strideV1=1, strideV2=4.
	info = zgemlqt( 'left', 'no-transpose', 5, 5, 4, 4, vt.V, 1, 4, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: left, conjugate-transpose (single-block)', function t() {
	var WORK;
	var info;
	var tc;
	var vt;
	var C;

	tc = findCase( 'left_ctrans_single' );
	vt = singleVT();
	C = new Complex128Array( 25 );
	fillSingleC( C, 5, 5, 5 );
	WORK = new Complex128Array( 5 * 4 );
	info = zgemlqt( 'left', 'conjugate-transpose', 5, 5, 4, 4, vt.V, 1, 4, 0, vt.T, 1, 4, 0, C, 1, 5, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertComplexClose( C, tc.c, 1e-12, 'c' );
});

test( 'zgemlqt: round trip Q^H * Q * C === C (left, multi-block)', function t() {
	var Corig;
	var WORK;
	var Cv2;
	var Cv;
	var vt;
	var C;
	var i;

	vt = blockVT();
	C = new Complex128Array( 100 );
	Corig = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	fillCLL( Corig, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	zgemlqt( 'left', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	zgemlqt( 'left', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	Cv = reinterpret( C, 0 );
	Cv2 = reinterpret( Corig, 0 );
	for ( i = 0; i < Cv.length; i++ ) {
		assertClose( Cv[ i ], Cv2[ i ], 1e-11, 'C round trip[' + i + ']' );
	}
});

test( 'zgemlqt: round trip C * Q * Q^H === C (right, multi-block)', function t() {
	var Corig;
	var WORK;
	var Cv2;
	var Cv;
	var vt;
	var C;
	var i;

	vt = blockVT();
	C = new Complex128Array( 100 );
	Corig = new Complex128Array( 100 );
	fillCLL( C, 10, 10, 10 );
	fillCLL( Corig, 10, 10, 10 );
	WORK = new Complex128Array( 10 * 3 );
	zgemlqt( 'right', 'no-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	zgemlqt( 'right', 'conjugate-transpose', 10, 10, 8, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, C, 1, 10, 0, WORK, 1, 0 );
	Cv = reinterpret( C, 0 );
	Cv2 = reinterpret( Corig, 0 );
	for ( i = 0; i < Cv.length; i++ ) {
		assertClose( Cv[ i ], Cv2[ i ], 1e-11, 'C round trip[' + i + ']' );
	}
});

test( 'zgemlqt: validator rejects invalid side', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemlqt( 'L', 'no-transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zgemlqt: validator rejects invalid trans (transpose not allowed)', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad1() {
		zgemlqt( 'left', 'C', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
	assert.throws( function bad2() {
		zgemlqt( 'left', 'transpose', 4, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, TypeError );
});

test( 'zgemlqt: validator rejects negative M, N, K', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad1() {
		zgemlqt( 'left', 'no-transpose', -1, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemlqt( 'left', 'no-transpose', 4, -1, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad3() {
		zgemlqt( 'left', 'no-transpose', 4, 4, -1, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zgemlqt: validator rejects invalid mb', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad() {
		zgemlqt( 'left', 'no-transpose', 4, 4, 3, 0, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemlqt( 'left', 'no-transpose', 4, 4, 3, 5, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});

test( 'zgemlqt: validator rejects K > Q', function t() {
	var WORK = new Complex128Array( 8 );
	var V = new Complex128Array( 12 );
	var T = new Complex128Array( 6 );
	var C = new Complex128Array( 16 );
	assert.throws( function bad1() {
		zgemlqt( 'left', 'no-transpose', 2, 4, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
	assert.throws( function bad2() {
		zgemlqt( 'right', 'no-transpose', 4, 2, 3, 2, V, 1, 3, 0, T, 1, 2, 0, C, 1, 4, 0, WORK, 1, 0 );
	}, RangeError );
});
