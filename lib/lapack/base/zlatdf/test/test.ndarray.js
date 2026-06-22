/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgetc2 from './../../zgetc2/lib/base.js';
import zlatdf from './../lib/ndarray.js';

// FIXTURES //

import ijob2_2x2 from './fixtures/ijob2_2x2.json' with { type: 'json' };
import ijob5_2x2 from './fixtures/ijob5_2x2.json' with { type: 'json' };
import ijob2_3x3 from './fixtures/ijob2_3x3.json' with { type: 'json' };
import ijob5_3x3 from './fixtures/ijob5_3x3.json' with { type: 'json' };
import ijob2_4x4 from './fixtures/ijob2_4x4.json' with { type: 'json' };
import ijob5_4x4 from './fixtures/ijob5_4x4.json' with { type: 'json' };

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
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} aOffset - aOffset
* @param {*} aStride - aStride
* @param {*} expected - expected value
* @param {*} n - n
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, aOffset, aStride, expected, n, tol, msg ) {
	var i;
	for ( i = 0; i < n; i++ ) {
		assertClose( actual[ aOffset + ( i * aStride ) ], expected[ i ], tol, msg + '[' + i + ']' ); // eslint-disable-line max-len
	}
}

/**
* Converts an interleaved real array to a Complex128Array.
*
* @private
* @param {Array} arr - interleaved array of re/im pairs
* @returns {Complex128Array} complex array
*/
function toComplex( arr ) {
	return new Complex128Array( arr );
}

// TESTS //

test( 'zlatdf is a function', function t() {
	assert.equal( typeof zlatdf, 'function' );
});

test( 'zlatdf: IJOB=2, 2x2 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob2_2x2;
	Z = toComplex([
		4.0,
		1.0,
		2.0,
		0.5,
		3.0,
		-1.0,
		1.0,
		2.0
	]);
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	zgetc2( 2, Z, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, 0.5, -1.0, 1.0 ]);
	out = zlatdf( 2, 2, Z, 1, 2, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 4, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'zlatdf: IJOB=5, 2x2 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob5_2x2;
	Z = toComplex([
		4.0,
		1.0,
		2.0,
		0.5,
		3.0,
		-1.0,
		1.0,
		2.0
	]);
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	zgetc2( 2, Z, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, 0.5, -1.0, 1.0 ]);
	out = zlatdf( 5, 2, Z, 1, 2, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 4, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'zlatdf: IJOB=2, 3x3 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob2_3x3;
	Z = toComplex([
		5.0,
		1.0,
		7.0,
		0.0,
		6.0,
		-1.0,
		7.0,
		-2.0,
		10.0,
		1.0,
		8.0,
		0.5,
		6.0,
		0.5,
		8.0,
		-1.0,
		10.0,
		2.0
	]);
	IPIV = new Int32Array( 3 );
	JPIV = new Int32Array( 3 );
	zgetc2( 3, Z, 1, 3, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, -0.5, -1.0, 1.0, 0.5, 0.0 ]);
	out = zlatdf( 2, 3, Z, 1, 3, 0, RHS, 1, 0, 1.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 6, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'zlatdf: IJOB=5, 3x3 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob5_3x3;
	Z = toComplex([
		5.0,
		1.0,
		7.0,
		0.0,
		6.0,
		-1.0,
		7.0,
		-2.0,
		10.0,
		1.0,
		8.0,
		0.5,
		6.0,
		0.5,
		8.0,
		-1.0,
		10.0,
		2.0
	]);
	IPIV = new Int32Array( 3 );
	JPIV = new Int32Array( 3 );
	zgetc2( 3, Z, 1, 3, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, -0.5, -1.0, 1.0, 0.5, 0.0 ]);
	out = zlatdf( 5, 3, Z, 1, 3, 0, RHS, 1, 0, 1.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 6, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'zlatdf: IJOB=2, 4x4 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob2_4x4;
	Z = toComplex([
		5.0,
		1.0,
		7.0,
		0.0,
		6.0,
		-1.0,
		5.0,
		0.5,
		7.0,
		-2.0,
		10.0,
		1.0,
		8.0,
		0.5,
		7.0,
		-1.0,
		6.0,
		0.5,
		8.0,
		-1.0,
		10.0,
		2.0,
		9.0,
		1.0,
		5.0,
		-1.0,
		7.0,
		0.5,
		9.0,
		-0.5,
		10.0,
		3.0
	]);
	IPIV = new Int32Array( 4 );
	JPIV = new Int32Array( 4 );
	zgetc2( 4, Z, 1, 4, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, -0.5, -1.0, 1.0, 2.0, 0.0, -0.5, 0.5 ]);
	out = zlatdf( 2, 4, Z, 1, 4, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 8, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'zlatdf: IJOB=5, tie-breaking branch with zero RHS', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var Z;

	Z = toComplex([ 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0 ]);
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	zgetc2( 2, Z, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 0.0, 0.0, 0.0, 0.0 ]);
	out = zlatdf( 5, 2, Z, 1, 2, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assert.ok( Math.abs( rv[ 0 ] ) + Math.abs( rv[ 1 ] ) + Math.abs( rv[ 2 ] ) + Math.abs( rv[ 3 ] ) > 0, 'rhs should be non-zero after tie-breaking' ); // eslint-disable-line max-len
	assert.ok( out.rdsum > 0.0, 'rdsum should be positive' );
});

test( 'zlatdf: IJOB=5, 4x4 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var rv;
	var tc;
	var Z;

	tc = ijob5_4x4;
	Z = toComplex([
		5.0,
		1.0,
		7.0,
		0.0,
		6.0,
		-1.0,
		5.0,
		0.5,
		7.0,
		-2.0,
		10.0,
		1.0,
		8.0,
		0.5,
		7.0,
		-1.0,
		6.0,
		0.5,
		8.0,
		-1.0,
		10.0,
		2.0,
		9.0,
		1.0,
		5.0,
		-1.0,
		7.0,
		0.5,
		9.0,
		-0.5,
		10.0,
		3.0
	]);
	IPIV = new Int32Array( 4 );
	JPIV = new Int32Array( 4 );
	zgetc2( 4, Z, 1, 4, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = toComplex([ 1.0, -0.5, -1.0, 1.0, 2.0, 0.0, -0.5, 0.5 ]);
	out = zlatdf( 5, 4, Z, 1, 4, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	rv = reinterpret( RHS, 0 );
	assertArrayClose( rv, 0, 1, tc.rhs, 8, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});
