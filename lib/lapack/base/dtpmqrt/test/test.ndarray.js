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
import dtpmqrt from './../lib/ndarray.js';


// FIXTURES //

var fixtureDir = path.join( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures' );
var rawLines = readFileSync( path.join( fixtureDir, 'dtpmqrt.jsonl' ), 'utf8' ).trim().split( '\n' );
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
* Initializes the small Case A inputs (M=4, N=3, K=3, L=2, NB=2; SIDE='left').
*
* @private
* @returns {Object} matrices A (KxN=3x3) and B (MxN=4x3) in column-major form
*/
function initLeftA() {
	var A = new Float64Array([
		1.0,
		4.0,
		7.0,
		2.0,
		5.0,
		8.0,
		3.0,
		6.0,
		9.0
	]);
	var B = new Float64Array([
		1.0,
		0.5,
		-1.0,
		2.0,
		-1.0,
		1.5,
		0.0,
		-2.0,
		2.0,
		-2.5,
		3.0,
		1.0
	]);
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case B inputs (M=3, N=4, K=4, L=2, NB=2; SIDE='right').
*
* @private
* @returns {Object} matrices A (M-by-K=3x4) and B (M-by-N=3x4) in column-major form
*/
function initRightB() {
	var A = new Float64Array( 12 );
	var B = new Float64Array( 12 );
	var i;
	var j;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ ( j * 3 ) + i ] = 1.0 + ( i + 1 ) + ( 0.1 * ( j + 1 ) );
			B[ ( j * 3 ) + i ] = -1.0 + ( 0.5 * ( i + 1 ) ) + ( j + 1 );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case C inputs (M=8, N=6, K=6, L=3, NB=3; SIDE='left', blocked).
*
* @private
* @returns {Object} matrices A (KxN=6x6) and B (MxN=8x6) in column-major form
*/
function initLeftC() {
	var A = new Float64Array( 36 );
	var B = new Float64Array( 48 );
	var i;
	var j;
	for ( j = 0; j < 6; j++ ) {
		for ( i = 0; i < 6; i++ ) {
			A[ ( j * 6 ) + i ] = Math.sin( ( ( i + 1 ) * 2 ) + ( j + 1 ) );
		}
	}
	for ( j = 0; j < 6; j++ ) {
		for ( i = 0; i < 8; i++ ) {
			B[ ( j * 8 ) + i ] = Math.cos( ( i + 1 ) + ( ( j + 1 ) * 2 ) ) + 0.5;
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case D inputs for SIDE='left' (M=5, N=4, K=3, L=0, NB=2).
*
* @private
* @returns {Object} matrices A (KxN=3x4) and B (MxN=5x4) in column-major form
*/
function initLeftD() {
	var A = new Float64Array( 12 );
	var B = new Float64Array( 20 );
	var i;
	var j;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ ( j * 3 ) + i ] = ( i + 1 ) + ( 0.5 * ( j + 1 ) );
		}
		for ( i = 0; i < 5; i++ ) {
			B[ ( j * 5 ) + i ] = -( i + 1 ) + ( j + 1 );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case D inputs for SIDE='right' (M=3, N=4, K=3, L=0, NB=2).
*
* @private
* @returns {Object} matrices A (M-by-K=3x3) and B (M-by-N=3x4) in column-major form
*/
function initRightD() {
	var A = new Float64Array( 9 );
	var B = new Float64Array( 12 );
	var i;
	var j;
	for ( j = 0; j < 3; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ ( j * 3 ) + i ] = ( i + 1 ) + ( 0.5 * ( j + 1 ) );
		}
	}
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			B[ ( j * 3 ) + i ] = -( i + 1 ) + ( j + 1 );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case E inputs (M=3, N=2, K=3, L=K=3, NB=2; SIDE='left', triangular V).
*
* @private
* @returns {Object} matrices A (KxN=3x2) and B (MxN=3x2) in column-major form
*/
function initLeftE() {
	var A = new Float64Array( 6 );
	var B = new Float64Array( 6 );
	var i;
	var j;
	for ( j = 0; j < 2; j++ ) {
		for ( i = 0; i < 3; i++ ) {
			A[ ( j * 3 ) + i ] = 1.0 + ( i + 1 ) + ( 0.3 * ( j + 1 ) );
			B[ ( j * 3 ) + i ] = -2.0 + ( 0.5 * ( i + 1 ) ) + ( j + 1 );
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Initializes Case F inputs (M=5, N=4, K=4, L=2, NB=4; SIDE='left', single block).
*
* @private
* @returns {Object} matrices A (KxN=4x4) and B (MxN=5x4) in column-major form
*/
function initLeftF() {
	var A = new Float64Array( 16 );
	var B = new Float64Array( 20 );
	var i;
	var j;
	for ( j = 0; j < 4; j++ ) {
		for ( i = 0; i < 4; i++ ) {
			A[ ( j * 4 ) + i ] = Math.sin( ( i + 1 ) + ( ( j + 1 ) * 2 ) );
		}
		for ( i = 0; i < 5; i++ ) {
			B[ ( j * 5 ) + i ] = Math.cos( ( ( i + 1 ) * 2 ) + ( j + 1 ) ) + 0.3;
		}
	}
	return {
		'A': A,
		'B': B
	};
}

/**
* Loads V/T fixtures from a `factors_*` case.
*
* @private
* @param {string} name - case name
* @returns {Object} { V, T } as Float64Arrays
*/
function loadVT( name ) {
	var tc = findCase( name );
	return {
		'V': new Float64Array( tc.V ),
		'T': new Float64Array( tc.T )
	};
}


// TESTS //

test( 'dtpmqrt: SIDE=left, TRANS=no-transpose (Case A: M=4, N=3, K=3, L=2, NB=2)', function t() {
	var inputs = initLeftA();
	var WORK = new Float64Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_A' );
	info = dtpmqrt( 'left', 'no-transpose', 4, 3, 3, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=transpose (Case A)', function t() {
	var inputs = initLeftA();
	var WORK = new Float64Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_A' );
	info = dtpmqrt( 'left', 'transpose', 4, 3, 3, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 4, 0, WORK, 1, 0 );
	tc = findCase( 'left_trans_A' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=right, TRANS=no-transpose (Case B: M=3, N=4, K=4, L=2, NB=2)', function t() {
	var inputs = initRightB();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_right_B' );
	info = dtpmqrt( 'right', 'no-transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=right, TRANS=transpose (Case B)', function t() {
	var inputs = initRightB();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_right_B' );
	info = dtpmqrt( 'right', 'transpose', 3, 4, 4, 2, 2, vt.V, 1, 4, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_trans_B' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=no-transpose blocked (Case C: M=8, N=6, K=6, L=3, NB=3)', function t() {
	var inputs = initLeftC();
	var WORK = new Float64Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = dtpmqrt( 'left', 'no-transpose', 8, 6, 6, 3, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-11, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-11, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=transpose blocked (Case C)', function t() {
	var inputs = initLeftC();
	var WORK = new Float64Array( 256 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_C' );
	info = dtpmqrt( 'left', 'transpose', 8, 6, 6, 3, 3, vt.V, 1, 8, 0, vt.T, 1, 3, 0, inputs.A, 1, 6, 0, inputs.B, 1, 8, 0, WORK, 1, 0 );
	tc = findCase( 'left_trans_C' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-11, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-11, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=no-transpose, L=0 (Case D)', function t() {
	var inputs = initLeftD();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = dtpmqrt( 'left', 'no-transpose', 5, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=transpose, L=0 (Case D)', function t() {
	var inputs = initLeftD();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = dtpmqrt( 'left', 'transpose', 5, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_trans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=right, TRANS=no-transpose, L=0 (Case D)', function t() {
	var inputs = initRightD();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = dtpmqrt( 'right', 'no-transpose', 3, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_notrans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=right, TRANS=transpose, L=0 (Case D)', function t() {
	var inputs = initRightD();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_D' );
	info = dtpmqrt( 'right', 'transpose', 3, 4, 3, 0, 2, vt.V, 1, 5, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'right_trans_D' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=no-transpose, L=K (Case E, fully triangular V)', function t() {
	var inputs = initLeftE();
	var WORK = new Float64Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_E' );
	info = dtpmqrt( 'left', 'no-transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=transpose, L=K (Case E)', function t() {
	var inputs = initLeftE();
	var WORK = new Float64Array( 32 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_left_E' );
	info = dtpmqrt( 'left', 'transpose', 3, 2, 3, 3, 2, vt.V, 1, 3, 0, vt.T, 1, 2, 0, inputs.A, 1, 3, 0, inputs.B, 1, 3, 0, WORK, 1, 0 );
	tc = findCase( 'left_trans_E' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=no-transpose, NB=K (Case F: single inner iteration)', function t() {
	var inputs = initLeftF();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = dtpmqrt( 'left', 'no-transpose', 5, 4, 4, 2, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_notrans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: SIDE=left, TRANS=transpose, NB=K (Case F)', function t() {
	var inputs = initLeftF();
	var WORK = new Float64Array( 64 );
	var info;
	var vt;
	var tc;
	vt = loadVT( 'factors_single' );
	info = dtpmqrt( 'left', 'transpose', 5, 4, 4, 2, 4, vt.V, 1, 5, 0, vt.T, 1, 4, 0, inputs.A, 1, 4, 0, inputs.B, 1, 5, 0, WORK, 1, 0 );
	tc = findCase( 'left_trans_F' );
	assert.equal( info, 0, 'info' );
	assertArrayClose( inputs.A, tc.A, 1e-12, 'A' );
	assertArrayClose( inputs.B, tc.B, 1e-12, 'B' );
});

test( 'dtpmqrt: quick return when M=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Float64Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Float64Array( 4 );
	T = new Float64Array( 4 );
	A = new Float64Array( 4 );
	B = new Float64Array( 4 );
	Acopy = Float64Array.from( A );
	Bcopy = Float64Array.from( B );
	info = dtpmqrt( 'left', 'no-transpose', 0, 3, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( A, Acopy, 0, 'A unchanged' );
	assertArrayClose( B, Bcopy, 0, 'B unchanged' );
});

test( 'dtpmqrt: quick return when N=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Float64Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Float64Array( 4 );
	T = new Float64Array( 4 );
	A = new Float64Array( 4 );
	B = new Float64Array( 4 );
	Acopy = Float64Array.from( A );
	Bcopy = Float64Array.from( B );
	info = dtpmqrt( 'left', 'no-transpose', 4, 0, 3, 2, 2, V, 1, 1, 0, T, 1, 2, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( A, Acopy, 0, 'A unchanged' );
	assertArrayClose( B, Bcopy, 0, 'B unchanged' );
});

test( 'dtpmqrt: quick return when K=0', function t() {
	var Acopy;
	var Bcopy;
	var WORK = new Float64Array( 4 );
	var info;
	var V;
	var T;
	var A;
	var B;
	V = new Float64Array( 4 );
	T = new Float64Array( 4 );
	A = new Float64Array( 4 );
	B = new Float64Array( 4 );
	Acopy = Float64Array.from( A );
	Bcopy = Float64Array.from( B );
	info = dtpmqrt( 'left', 'no-transpose', 4, 3, 0, 0, 1, V, 1, 1, 0, T, 1, 1, 0, A, 1, 1, 0, B, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayClose( A, Acopy, 0, 'A unchanged' );
	assertArrayClose( B, Bcopy, 0, 'B unchanged' );
});
