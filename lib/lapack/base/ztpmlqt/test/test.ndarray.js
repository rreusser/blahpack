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
import ztpmlqt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'ztpmlqt.jsonl' ), 'utf8' ).trim().split( '\n' );
var fixture = rawLines.map( parseLine );


// FUNCTIONS //

/**
* Parses a JSON line into a fixture case.
*
* @private
* @param {string} line - JSON-encoded fixture case
* @returns {Object} parsed fixture case
*/
function parseLine( line ) {
	return JSON.parse( line );
}

/**
* Locates a fixture case by name.
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
* Asserts two numbers are approximately equal.
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
* Asserts that two arrays of doubles are element-wise approximately equal.
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
* Loads V/T fixtures (complex, stored as flat re/im pairs) into Complex128Arrays.
*
* @private
* @param {string} name - case name
* @returns {Object} { V, T } as Complex128Arrays
*/
function loadVT( name ) {
	var Vbuf;
	var Tbuf;
	var tc;
	tc = findCase( name );
	Vbuf = new Float64Array( tc.V );
	Tbuf = new Float64Array( tc.T );
	return {
		'V': new Complex128Array( Vbuf.buffer ),
		'T': new Complex128Array( Tbuf.buffer )
	};
}

/**
* Initializes the small Case A inputs (M=4, N=3, K=3, L=2, MB=2; SIDE='left').
*
* @private
* @returns {Object} matrices A (KxN=3x3) and B (MxN=4x3) in column-major form
*/
function initLeftA() {
	// A column-major: A(i,j) for i=1..3, j=1..3 (matching Fortran init_AB_left), interleaved re/im.
	var Abuf = new Float64Array([
		1.0,
		0.1,
		4.0,
		-0.1,
		7.0,
		0.4,
		2.0,
		-0.2,
		5.0,
		0.2,
		8.0,
		-0.4,
		3.0,
		0.3,
		6.0,
		-0.3,
		9.0,
		0.0
	]);
	var Bbuf = new Float64Array([
		1.0,
		0.2,
		0.5,
		-0.3,
		-1.0,
		0.0,
		2.0,
		0.3,
		-1.0,
		0.1,
		1.5,
		-0.2,
		0.0,
		0.5,
		-2.0,
		-0.4,
		2.0,
		-0.1,
		-2.5,
		0.4,
		3.0,
		-0.1,
		1.0,
		0.2
	]);
	return {
		'A': new Complex128Array( Abuf.buffer ),
		'B': new Complex128Array( Bbuf.buffer )
	};
}

/**
* Initializes Case B inputs (M=3, N=4, K=4, L=2, MB=2; SIDE='right').
*
* @private
* @returns {Object} matrices A (M-by-K=3x4) and B (M-by-N=3x4) in column-major form
*/
function initRightB() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 12 );
	B = new Complex128Array( 12 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 4; jj++ ) {
		for ( ii = 0; ii < 3; ii++ ) {
			off = ( ( jj * 3 ) + ii ) * 2;
			Ar[ off ] = 1.0 + ( ii + 1 ) + ( 0.1 * ( jj + 1 ) );
			Ar[ off + 1 ] = 0.05 * ( ( ii + 1 ) - ( jj + 1 ) );
			Br[ off ] = -1.0 + ( 0.5 * ( ii + 1 ) ) + ( jj + 1 );
			Br[ off + 1 ] = 0.05 * ( ( ii + 1 ) + ( jj + 1 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case C inputs (M=8, N=6, K=6, L=3, MB=3; SIDE='left', blocked).
*
* @private
* @returns {Object} matrices A (KxN=6x6) and B (MxN=8x6) in column-major form
*/
function initLeftC() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 36 );
	B = new Complex128Array( 48 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 6; jj++ ) {
		for ( ii = 0; ii < 6; ii++ ) {
			off = ( ( jj * 6 ) + ii ) * 2;
			Ar[ off ] = Math.sin( ( ( ii + 1 ) * 2 ) + ( jj + 1 ) );
			Ar[ off + 1 ] = 0.1 * Math.cos( ( ii + 1 ) + ( ( jj + 1 ) * 3 ) );
		}
	}
	for ( jj = 0; jj < 6; jj++ ) {
		for ( ii = 0; ii < 8; ii++ ) {
			off = ( ( jj * 8 ) + ii ) * 2;
			Br[ off ] = Math.cos( ( ii + 1 ) + ( ( jj + 1 ) * 2 ) ) + 0.5;
			Br[ off + 1 ] = 0.15 * Math.sin( ( ( ii + 1 ) * 3 ) + ( jj + 1 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case D inputs for SIDE='left' (M=5, N=4, K=3, L=0, MB=2).
*
* @private
* @returns {Object} matrices A (KxN=3x4) and B (MxN=5x4) in column-major form
*/
function initLeftD() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 12 );
	B = new Complex128Array( 20 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 4; jj++ ) {
		for ( ii = 0; ii < 3; ii++ ) {
			off = ( ( jj * 3 ) + ii ) * 2;
			Ar[ off ] = ( ii + 1 ) + ( 0.5 * ( jj + 1 ) );
			Ar[ off + 1 ] = 0.1 * ( ( ii + 1 ) - ( jj + 1 ) );
		}
		for ( ii = 0; ii < 5; ii++ ) {
			off = ( ( jj * 5 ) + ii ) * 2;
			Br[ off ] = -( ii + 1 ) + ( jj + 1 );
			Br[ off + 1 ] = 0.1 * ( ( ii + 1 ) + ( jj + 1 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case D inputs for SIDE='right' (M=3, N=5, K=3, L=0, MB=2).
*
* @private
* @returns {Object} matrices A (M-by-K=3x3) and B (M-by-N=3x5) in column-major form
*/
function initRightD() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 9 );
	B = new Complex128Array( 15 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 3; jj++ ) {
		for ( ii = 0; ii < 3; ii++ ) {
			off = ( ( jj * 3 ) + ii ) * 2;
			Ar[ off ] = ( ii + 1 ) + ( 0.5 * ( jj + 1 ) );
			Ar[ off + 1 ] = 0.1 * ( ( ii + 1 ) - ( jj + 1 ) );
		}
	}
	for ( jj = 0; jj < 5; jj++ ) {
		for ( ii = 0; ii < 3; ii++ ) {
			off = ( ( jj * 3 ) + ii ) * 2;
			Br[ off ] = -( ii + 1 ) + ( jj + 1 );
			Br[ off + 1 ] = 0.1 * ( ( ii + 1 ) + ( jj + 1 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case E inputs (M=3, N=2, K=3, L=K=3, MB=2; SIDE='left', triangular V).
*
* @private
* @returns {Object} matrices A (KxN=3x2) and B (MxN=3x2) in column-major form
*/
function initLeftE() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 6 );
	B = new Complex128Array( 6 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 2; jj++ ) {
		for ( ii = 0; ii < 3; ii++ ) {
			off = ( ( jj * 3 ) + ii ) * 2;
			Ar[ off ] = 1.0 + ( ii + 1 ) + ( 0.3 * ( jj + 1 ) );
			Ar[ off + 1 ] = 0.1 * ( ( ii + 1 ) + ( jj + 1 ) );
			Br[ off ] = -2.0 + ( 0.5 * ( ii + 1 ) ) + ( jj + 1 );
			Br[ off + 1 ] = 0.05 * ( ( ii + 1 ) - ( jj + 1 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case F inputs (M=5, N=4, K=4, L=2, MB=4; SIDE='left', single block).
*
* @private
* @returns {Object} matrices A (KxN=4x4) and B (MxN=5x4) in column-major form
*/
function initLeftF() {
	var off;
	var Ar;
	var Br;
	var ii;
	var jj;
	var A;
	var B;
	A = new Complex128Array( 16 );
	B = new Complex128Array( 20 );
	Ar = reinterpret( A, 0 );
	Br = reinterpret( B, 0 );
	for ( jj = 0; jj < 4; jj++ ) {
		for ( ii = 0; ii < 4; ii++ ) {
			off = ( ( jj * 4 ) + ii ) * 2;
			Ar[ off ] = Math.sin( ( ii + 1 ) + ( ( jj + 1 ) * 2 ) );
			Ar[ off + 1 ] = 0.1 * Math.cos( ( ( ii + 1 ) * 3 ) + ( jj + 1 ) );
		}
		for ( ii = 0; ii < 5; ii++ ) {
			off = ( ( jj * 5 ) + ii ) * 2;
			Br[ off ] = Math.cos( ( ( ii + 1 ) * 2 ) + ( jj + 1 ) ) + 0.3;
			Br[ off + 1 ] = 0.1 * Math.sin( ( ii + 1 ) + ( ( jj + 1 ) * 3 ) );
		}
	}
	return {
		'A': A,
		'B': B
	};
}


// TESTS //

test( 'ztpmlqt: SIDE=left, TRANS=no-transpose (Case A: M=4, N=3, K=3, L=2, MB=2)', function t() {
	var inputs = initLeftA();
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_A' );
	info = ztpmlqt( 'left', 'no-transpose', 4, 3, 3, 2, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=conjugate-transpose (Case A)', function t() {
	var inputs = initLeftA();
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_A' );
	info = ztpmlqt( 'left', 'conjugate-transpose', 4, 3, 3, 2, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=right, TRANS=no-transpose (Case B: M=3, N=4, K=4, L=2, MB=2)', function t() {
	var inputs = initRightB();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_right_B' );
	info = ztpmlqt( 'right', 'no-transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=right, TRANS=conjugate-transpose (Case B)', function t() {
	var inputs = initRightB();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_right_B' );
	info = ztpmlqt( 'right', 'conjugate-transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_ctrans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=no-transpose blocked (Case C: M=8, N=6, K=6, L=3, MB=3)', function t() {
	var inputs = initLeftC();
	var WORK = new Complex128Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = ztpmlqt( 'left', 'no-transpose', 8, 6, 6, 3, 3, vt.V, 1, 6, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-11, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-11, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=conjugate-transpose blocked (Case C)', function t() {
	var inputs = initLeftC();
	var WORK = new Complex128Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = ztpmlqt( 'left', 'conjugate-transpose', 8, 6, 6, 3, 3, vt.V, 1, 6, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-11, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-11, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=no-transpose, L=0 (Case D)', function t() {
	var inputs = initLeftD();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = ztpmlqt( 'left', 'no-transpose', 5, 4, 3, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=conjugate-transpose, L=0 (Case D)', function t() {
	var inputs = initLeftD();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = ztpmlqt( 'left', 'conjugate-transpose', 5, 4, 3, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=right, TRANS=no-transpose, L=0 (Case D)', function t() {
	var inputs = initRightD();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = ztpmlqt( 'right', 'no-transpose', 3, 5, 3, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=right, TRANS=conjugate-transpose, L=0 (Case D)', function t() {
	var inputs = initRightD();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = ztpmlqt( 'right', 'conjugate-transpose', 3, 5, 3, 0, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_ctrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=no-transpose, L=K (Case E, fully triangular V)', function t() {
	var inputs = initLeftE();
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_E' );
	info = ztpmlqt( 'left', 'no-transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=conjugate-transpose, L=K (Case E)', function t() {
	var inputs = initLeftE();
	var WORK = new Complex128Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_E' );
	info = ztpmlqt( 'left', 'conjugate-transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=no-transpose, MB=K (Case F: single inner iteration)', function t() {
	var inputs = initLeftF();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = ztpmlqt( 'left', 'no-transpose', 5, 4, 4, 2, 4, vt.V, 1, 4, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: SIDE=left, TRANS=conjugate-transpose, MB=K (Case F)', function t() {
	var inputs = initLeftF();
	var WORK = new Complex128Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = ztpmlqt( 'left', 'conjugate-transpose', 5, 4, 4, 2, 4, vt.V, 1, 4, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_ctrans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( inputs.A, 0 ), tc.A, 1e-12, 'A' );
	assertArrayClose( reinterpret( inputs.B, 0 ), tc.B, 1e-12, 'B' );
});

test( 'ztpmlqt: quick return when M=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = Float64Array.from( reinterpret( A, 0 ) );
	Bcopy = Float64Array.from( reinterpret( B, 0 ) );
	info = ztpmlqt( 'left', 'no-transpose', 0, 3, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});

test( 'ztpmlqt: quick return when N=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = Float64Array.from( reinterpret( A, 0 ) );
	Bcopy = Float64Array.from( reinterpret( B, 0 ) );
	info = ztpmlqt( 'left', 'no-transpose', 4, 0, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});

test( 'ztpmlqt: quick return when K=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Complex128Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Complex128Array( 4 );
	T = new Complex128Array( 4 );
	A = new Complex128Array( 4 );
	B = new Complex128Array( 4 );
	Acopy = Float64Array.from( reinterpret( A, 0 ) );
	Bcopy = Float64Array.from( reinterpret( B, 0 ) );
	info = ztpmlqt( 'left', 'no-transpose', 4, 3, 0, 0, 1, V, 1, 1, 0, T, 1, 1, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( reinterpret( A, 0 ), Acopy, 0, 'A unchanged' );
	assertArrayClose( reinterpret( B, 0 ), Bcopy, 0, 'B unchanged' );
});
