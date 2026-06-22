/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, node/no-sync, no-mixed-operators, max-statements-per-line */

// MODULES //

import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgexc from './../lib/ndarray.js';
import ndarrayFn from './../lib/ndarray.js';

var FIXTURES;


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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
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

/**
* Creates an NxN identity matrix in column-major order.
*
* @private
* @param {NonNegativeInteger} N - matrix order
* @returns {Float64Array} identity matrix
*/
function eye( N ) {
	var Q = new Float64Array( N * N );
	var i;
	for ( i = 0; i < N; i++ ) {
		Q[ i + ( i * N ) ] = 1.0;
	}
	return Q;
}

/**
* Loads all test fixtures from the JSONL file.
*
* @private
* @returns {Object} map from test name to fixture data
*/
function loadFixtures() {
	var fixtures = {};
	var lines = readFileSync( resolve( import.meta.dirname, '..', '..', '..', '..', '..', 'test', 'fixtures', 'dtgexc.jsonl' ), 'utf8' ).trim().split( '\n' );
	var i;
	var d;
	for ( i = 0; i < lines.length; i++ ) {
		if ( lines[ i ].trim() === '' ) {
			continue;
		}
		d = JSON.parse( lines[ i ] );
		fixtures[ d.name ] = d;
	}
	return fixtures;
}

FIXTURES = loadFixtures();

/**
* Verifies that a matrix is orthogonal: Q^T * Q = I.
*
* @private
* @param {Float64Array} Q - NxN matrix in column-major order
* @param {number} N - matrix dimension
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyOrthogonal( Q, N, tol, msg ) {
	var val;
	var i;
	var j;
	var k;
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			val = 0.0;
			for ( k = 0; k < N; k++ ) {
				val += Q[ k + ( i * N ) ] * Q[ k + ( j * N ) ];
			}
			assertClose( val, ( i === j ) ? 1.0 : 0.0, tol, msg + '[' + i + ',' + j + ']' );
		}
	}
}

/**
* Verifies that Q^T _ Morig _ Z = Mresult (column-major).
*
* @private
* @param {Float64Array} Morig - original NxN matrix
* @param {Float64Array} Mresult - result NxN matrix
* @param {Float64Array} Q - left orthogonal matrix
* @param {Float64Array} Z - right orthogonal matrix
* @param {number} N - matrix dimension
* @param {number} tol - tolerance
* @param {string} msg - message prefix
*/
function verifyDecomposition( Morig, Mresult, Q, Z, N, tol, msg ) {
	var temp;
	var val;
	var i;
	var j;
	var k;
	var l;

	// Compute Q^T * Morig * Z

	// First: temp = Q^T * Morig
	temp = new Float64Array( N * N );
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			val = 0.0;
			for ( k = 0; k < N; k++ ) {
				// Q^T[i,k] = Q[k,i], Morig[k,j] stored at k + j*N
				val += Q[ k + ( i * N ) ] * Morig[ k + ( j * N ) ];
			}
			temp[ i + ( j * N ) ] = val;
		}
	}
	// Then: result = temp * Z
	for ( i = 0; i < N; i++ ) {
		for ( j = 0; j < N; j++ ) {
			val = 0.0;
			for ( l = 0; l < N; l++ ) {
				val += temp[ i + ( l * N ) ] * Z[ l + ( j * N ) ];
			}
			assertClose( val, Mresult[ i + ( j * N ) ], tol, msg + '[' + i + ',' + j + ']' );
		}
	}
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof dtgexc, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'dtgexc: move 1x1 block forward with Q and Z', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.move_1x1_forward_qz;
	N = 4;

	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=4 → JS 0-based: ifst=0, ilst=3
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgexc: move 1x1 block backward with Q and Z', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.move_1x1_backward_qz;
	N = 4;

	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=4, ILST=1 → JS 0-based: ifst=3, ilst=0
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 3, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgexc: move 2x2 block forward with Q and Z', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.move_2x2_forward_qz;
	N = 4;

	// 2x2 block at (0:1,0:1), stored column-major
	A = new Float64Array([
		1.0,
		-0.5,
		0.0,
		0.0,
		2.0,
		1.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=4 → JS 0-based: ifst=0, ilst=3
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgexc: move 2x2 block backward with Q and Z', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_2x2_backward_qz;
	N = 4;

	// 2x2 block at (2:3,2:3)
	Aorig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		-0.5,
		0.2,
		0.1,
		2.0,
		3.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=3, ILST=1 → JS 0-based: ifst=2, ilst=0
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 2, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );

	// Verify structural properties: Q^T * Aorig * Z = A, Q^T * Borig * Z = B

	// And that Q and Z are orthogonal
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: move 1x1 forward without Q/Z', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.move_1x1_no_qz;
	N = 3;

	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.3,
		0.4,
		3.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.1,
		0.3,
		2.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=3 → JS 0-based: ifst=0, ilst=2
	r = dtgexc( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
});

test( 'dtgexc: noop when ifst equals ilst', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.noop_ifst_eq_ilst;
	N = 3;

	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.3,
		0.4,
		3.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.1,
		0.3,
		2.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=2, ILST=2 → JS 0-based: ifst=1, ilst=1
	r = dtgexc( false, false, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 1, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A unchanged' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B unchanged' );
});

test( 'dtgexc: N=1 quick return', function t() {
	var WORK;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	A = new Float64Array([ 5.0 ]);
	B = new Float64Array([ 3.0 ]);
	Q = new Float64Array([ 1.0 ]);
	Z = new Float64Array([ 1.0 ]);
	WORK = new Float64Array( 1 );

	r = dtgexc( true, true, 1, A, 1, 1, 0, B, 1, 1, 0, Q, 1, 1, 0, Z, 1, 1, 0, 0, 0, WORK, 1, 0, 1 );
	assert.strictEqual( r.info, 0, 'info' );
	assert.strictEqual( r.ifst, 0, 'ifst' );
	assert.strictEqual( r.ilst, 0, 'ilst' );
});

test( 'dtgexc: move 1x1 forward in 6x6 matrix', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.move_1x1_forward_6x6;
	N = 6;

	// Column-major 6x6 upper triangular A
	A = new Float64Array( N * N );
	A[ 0 + 0 * N ] = 1.0; A[ 0 + 1 * N ] = 0.5; A[ 0 + 2 * N ] = 0.3; A[ 0 + 3 * N ] = 0.2; A[ 0 + 4 * N ] = 0.1; A[ 0 + 5 * N ] = 0.05;
	A[ 1 + 1 * N ] = 2.0; A[ 1 + 2 * N ] = 0.4; A[ 1 + 3 * N ] = 0.1; A[ 1 + 4 * N ] = 0.2; A[ 1 + 5 * N ] = 0.1;
	A[ 2 + 2 * N ] = 3.0; A[ 2 + 3 * N ] = 0.6; A[ 2 + 4 * N ] = 0.3; A[ 2 + 5 * N ] = 0.15;
	A[ 3 + 3 * N ] = 4.0; A[ 3 + 4 * N ] = 0.5; A[ 3 + 5 * N ] = 0.2;
	A[ 4 + 4 * N ] = 5.0; A[ 4 + 5 * N ] = 0.4;
	A[ 5 + 5 * N ] = 6.0;

	B = new Float64Array( N * N );
	B[ 0 + 0 * N ] = 1.0; B[ 0 + 1 * N ] = 0.2; B[ 0 + 2 * N ] = 0.1; B[ 0 + 3 * N ] = 0.05; B[ 0 + 4 * N ] = 0.03; B[ 0 + 5 * N ] = 0.01;
	B[ 1 + 1 * N ] = 1.5; B[ 1 + 2 * N ] = 0.3; B[ 1 + 3 * N ] = 0.15; B[ 1 + 4 * N ] = 0.1; B[ 1 + 5 * N ] = 0.05;
	B[ 2 + 2 * N ] = 2.0; B[ 2 + 3 * N ] = 0.4; B[ 2 + 4 * N ] = 0.2; B[ 2 + 5 * N ] = 0.1;
	B[ 3 + 3 * N ] = 2.5; B[ 3 + 4 * N ] = 0.3; B[ 3 + 5 * N ] = 0.15;
	B[ 4 + 4 * N ] = 3.0; B[ 4 + 5 * N ] = 0.4;
	B[ 5 + 5 * N ] = 3.5;

	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=2, ILST=5 → JS 0-based: ifst=1, ilst=4
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 4, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgexc: ifst points to second row of 2x2 block (adjusted)', function t() {
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	tc = FIXTURES.ifst_second_row_2x2;
	N = 4;

	// 2x2 block at (0:1,0:1), column-major
	A = new Float64Array([
		1.0,
		-0.5,
		0.0,
		0.0,
		2.0,
		1.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=2, ILST=4 → JS 0-based: ifst=1, ilst=3

	// IFST should be adjusted from 1 to 0 because row 1 is the second row of the 2x2 block
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 1, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	assertArrayClose( toArray( A ), tc.A, 1e-12, 'A' );
	assertArrayClose( toArray( B ), tc.B, 1e-12, 'B' );
	assertArrayClose( toArray( Q ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( toArray( Z ), tc.Z, 1e-12, 'Z' );
});

test( 'dtgexc: move 1x1 forward across 2x2 block (nbnext=2)', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_1x1_fwd_across_2x2;
	N = 4;

	Aorig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		-0.8,
		0.0,
		0.3,
		1.5,
		2.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: move 1x1 backward across 2x2 block (nbnext=2)', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_1x1_bwd_across_2x2;
	N = 4;

	Aorig = new Float64Array([
		2.0,
		-0.8,
		0.0,
		0.0,
		1.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 3, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: move 1x1 forward with nbl=2 adjustment', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_1x1_fwd_nbl2_adjust;
	N = 4;

	Aorig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		-0.8,
		0.2,
		0.1,
		1.5,
		3.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=3 → JS: ifst=0, ilst=2
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 2, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: ilst points to second row of 2x2 block', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.ilst_second_row_2x2;
	N = 4;

	Aorig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		-0.8,
		0.2,
		0.1,
		1.5,
		3.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=4 (second row of 2x2) → JS: ifst=0, ilst=3
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: move 2x2 forward across 2x2 in 6x6', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_2x2_fwd_across_2x2_6x6;
	N = 6;

	Aorig = new Float64Array( N * N );
	Aorig[ 0 + 0 * N ] = 1.0; Aorig[ 0 + 1 * N ] = 2.0; Aorig[ 0 + 2 * N ] = 0.3; Aorig[ 0 + 3 * N ] = 0.2; Aorig[ 0 + 4 * N ] = 0.1; Aorig[ 0 + 5 * N ] = 0.05;
	Aorig[ 1 + 0 * N ] = -0.5; Aorig[ 1 + 1 * N ] = 1.0; Aorig[ 1 + 2 * N ] = 0.4; Aorig[ 1 + 3 * N ] = 0.1; Aorig[ 1 + 4 * N ] = 0.2; Aorig[ 1 + 5 * N ] = 0.1;
	Aorig[ 2 + 2 * N ] = 3.0; Aorig[ 2 + 3 * N ] = 1.5; Aorig[ 2 + 4 * N ] = 0.3; Aorig[ 2 + 5 * N ] = 0.15;
	Aorig[ 3 + 2 * N ] = -0.8; Aorig[ 3 + 3 * N ] = 3.0; Aorig[ 3 + 4 * N ] = 0.2; Aorig[ 3 + 5 * N ] = 0.1;
	Aorig[ 4 + 4 * N ] = 5.0; Aorig[ 4 + 5 * N ] = 0.4;
	Aorig[ 5 + 5 * N ] = 6.0;

	Borig = new Float64Array( N * N );
	Borig[ 0 + 0 * N ] = 1.0; Borig[ 0 + 1 * N ] = 0.2; Borig[ 0 + 2 * N ] = 0.1; Borig[ 0 + 3 * N ] = 0.05; Borig[ 0 + 4 * N ] = 0.03; Borig[ 0 + 5 * N ] = 0.01;
	Borig[ 1 + 1 * N ] = 1.5; Borig[ 1 + 2 * N ] = 0.3; Borig[ 1 + 3 * N ] = 0.15; Borig[ 1 + 4 * N ] = 0.1; Borig[ 1 + 5 * N ] = 0.05;
	Borig[ 2 + 2 * N ] = 2.0; Borig[ 2 + 3 * N ] = 0.4; Borig[ 2 + 4 * N ] = 0.2; Borig[ 2 + 5 * N ] = 0.1;
	Borig[ 3 + 3 * N ] = 2.5; Borig[ 3 + 4 * N ] = 0.3; Borig[ 3 + 5 * N ] = 0.15;
	Borig[ 4 + 4 * N ] = 3.0; Borig[ 4 + 5 * N ] = 0.4;
	Borig[ 5 + 5 * N ] = 3.5;

	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=1, ILST=5 → JS: ifst=0, ilst=4
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 4, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});

test( 'dtgexc: 2x2 block with nearly-real eigenvalues forward (split path)', function t() {
	// Construct a 2x2 block whose eigenvalues are real (a 2x2 block that
	// is in fact reducible). dtgex2 may split it -> nbf becomes 3 ->
	// exercises the "two 1x1 blocks" branch (lines 140-209).
	var Aorig;
	var Borig;
	var WORK;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;
	N = 4;
	// 2x2 block at (0:1,0:1) with eigenvalues 1.0 and 1.0001 (nearly equal real)
	// A: {{1, 0.0001},{0.0001, 1.0001}} has nearly-real eigenvalues; under canonical form
	// canonical form requires det of off-diag negative for complex pair. We use
	// off-diagonal product positive so eigenvalues are real and dtgex2 will split.
	Aorig = new Float64Array([
		1.0,
		0.0001,
		0.0,
		0.0,
		0.0001,
		1.0001,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0,
		0.2,
		0.1,
		0.6,
		4.0
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 0, 3, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, 0, 'info' );
	verifyOrthogonal( Q, N, 1e-10, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-10, 'Z orthogonal' );
});

test( 'dtgexc: 2x2 block with nearly-real eigenvalues backward (split path)', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;
	N = 4;
	Aorig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.0,
		0.3,
		0.4,
		3.0,
		0.0001,
		0.2,
		0.1,
		0.0001,
		3.0001
	]);
	Borig = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.0,
		0.1,
		0.3,
		2.0,
		0.0,
		0.05,
		0.15,
		0.4,
		2.5
	]);
	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 2, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, 0, 'info' );
	verifyOrthogonal( Q, N, 1e-10, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-10, 'Z orthogonal' );
});

test( 'dtgexc: move 2x2 backward across 2x2 in 6x6', function t() {
	var Aorig;
	var Borig;
	var WORK;
	var tc;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;
	var i;

	tc = FIXTURES.move_2x2_bwd_across_2x2_6x6;
	N = 6;

	Aorig = new Float64Array( N * N );
	Aorig[ 0 + 0 * N ] = 1.0; Aorig[ 0 + 1 * N ] = 0.5; Aorig[ 0 + 2 * N ] = 0.3; Aorig[ 0 + 3 * N ] = 0.2; Aorig[ 0 + 4 * N ] = 0.1; Aorig[ 0 + 5 * N ] = 0.05;
	Aorig[ 1 + 1 * N ] = 2.0; Aorig[ 1 + 2 * N ] = 0.4; Aorig[ 1 + 3 * N ] = 0.1; Aorig[ 1 + 4 * N ] = 0.2; Aorig[ 1 + 5 * N ] = 0.1;
	Aorig[ 2 + 2 * N ] = 3.0; Aorig[ 2 + 3 * N ] = 1.5; Aorig[ 2 + 4 * N ] = 0.3; Aorig[ 2 + 5 * N ] = 0.15;
	Aorig[ 3 + 2 * N ] = -0.8; Aorig[ 3 + 3 * N ] = 3.0; Aorig[ 3 + 4 * N ] = 0.2; Aorig[ 3 + 5 * N ] = 0.1;
	Aorig[ 4 + 4 * N ] = 5.0; Aorig[ 4 + 5 * N ] = 2.0;
	Aorig[ 5 + 4 * N ] = -0.3; Aorig[ 5 + 5 * N ] = 5.0;

	Borig = new Float64Array( N * N );
	Borig[ 0 + 0 * N ] = 1.0; Borig[ 0 + 1 * N ] = 0.2; Borig[ 0 + 2 * N ] = 0.1; Borig[ 0 + 3 * N ] = 0.05; Borig[ 0 + 4 * N ] = 0.03; Borig[ 0 + 5 * N ] = 0.01;
	Borig[ 1 + 1 * N ] = 1.5; Borig[ 1 + 2 * N ] = 0.3; Borig[ 1 + 3 * N ] = 0.15; Borig[ 1 + 4 * N ] = 0.1; Borig[ 1 + 5 * N ] = 0.05;
	Borig[ 2 + 2 * N ] = 2.0; Borig[ 2 + 3 * N ] = 0.4; Borig[ 2 + 4 * N ] = 0.2; Borig[ 2 + 5 * N ] = 0.1;
	Borig[ 3 + 3 * N ] = 2.5; Borig[ 3 + 4 * N ] = 0.3; Borig[ 3 + 5 * N ] = 0.15;
	Borig[ 4 + 4 * N ] = 3.0; Borig[ 4 + 5 * N ] = 0.4;
	Borig[ 5 + 5 * N ] = 3.5;

	A = new Float64Array( N * N );
	B = new Float64Array( N * N );
	for ( i = 0; i < N * N; i++ ) {
		A[ i ] = Aorig[ i ];
		B[ i ] = Borig[ i ];
	}
	Q = eye( N );
	Z = eye( N );
	WORK = new Float64Array( 4 * N + 16 );

	// Fortran: IFST=5, ILST=1 → JS: ifst=4, ilst=0
	r = dtgexc( true, true, N, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, 4, 0, WORK, 1, 0, WORK.length );
	assert.strictEqual( r.info, tc.info, 'info' );
	assert.strictEqual( r.ifst, tc.ifst - 1, 'ifst' );
	assert.strictEqual( r.ilst, tc.ilst - 1, 'ilst' );
	verifyOrthogonal( Q, N, 1e-12, 'Q orthogonal' );
	verifyOrthogonal( Z, N, 1e-12, 'Z orthogonal' );
	verifyDecomposition( Aorig, A, Q, Z, N, 1e-12, 'Q^T*Aorig*Z = A' );
	verifyDecomposition( Borig, B, Q, Z, N, 1e-12, 'Q^T*Borig*Z = B' );
});
