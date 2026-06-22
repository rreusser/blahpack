/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgetc2 from './../../dgetc2/lib/base.js';
import dlatdf from './../lib/ndarray.js';

// FIXTURES //

import ijob1_2x2 from './fixtures/ijob1_2x2.json' with { type: 'json' };
import ijob2_2x2 from './fixtures/ijob2_2x2.json' with { type: 'json' };
import ijob1_3x3 from './fixtures/ijob1_3x3.json' with { type: 'json' };
import ijob2_3x3 from './fixtures/ijob2_3x3.json' with { type: 'json' };
import ijob1_4x4 from './fixtures/ijob1_4x4.json' with { type: 'json' };
import ijob2_4x4 from './fixtures/ijob2_4x4.json' with { type: 'json' };

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

// TESTS //

test( 'dlatdf: IJOB=1, 2x2 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob1_2x2;
	Z = new Float64Array( [ 4.0, 2.0, 3.0, 1.0 ] );
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	dgetc2( 2, Z, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, 1.0 ] );
	out = dlatdf( 1, 2, Z, 1, 2, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 2, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'dlatdf: IJOB=2, 2x2 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob2_2x2;
	Z = new Float64Array( [ 4.0, 2.0, 3.0, 1.0 ] );
	IPIV = new Int32Array( 2 );
	JPIV = new Int32Array( 2 );
	dgetc2( 2, Z, 1, 2, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, 1.0 ] );
	out = dlatdf( 2, 2, Z, 1, 2, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 2, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'dlatdf: IJOB=1, 3x3 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob1_3x3;
	Z = new Float64Array([
		5.0,
		7.0,
		6.0,
		7.0,
		10.0,
		8.0,
		6.0,
		8.0,
		10.0
	]);
	IPIV = new Int32Array( 3 );
	JPIV = new Int32Array( 3 );
	dgetc2( 3, Z, 1, 3, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, -1.0, 0.5 ] );
	out = dlatdf( 1, 3, Z, 1, 3, 0, RHS, 1, 0, 1.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 3, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'dlatdf: IJOB=2, 3x3 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob2_3x3;
	Z = new Float64Array([
		5.0,
		7.0,
		6.0,
		7.0,
		10.0,
		8.0,
		6.0,
		8.0,
		10.0
	]);
	IPIV = new Int32Array( 3 );
	JPIV = new Int32Array( 3 );
	dgetc2( 3, Z, 1, 3, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, -1.0, 0.5 ] );
	out = dlatdf( 2, 3, Z, 1, 3, 0, RHS, 1, 0, 1.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 3, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'dlatdf: IJOB=1, 4x4 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob1_4x4;
	Z = new Float64Array([
		5.0,
		7.0,
		6.0,
		5.0,
		7.0,
		10.0,
		8.0,
		7.0,
		6.0,
		8.0,
		10.0,
		9.0,
		5.0,
		7.0,
		9.0,
		10.0
	]);
	IPIV = new Int32Array( 4 );
	JPIV = new Int32Array( 4 );
	dgetc2( 4, Z, 1, 4, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, -1.0, 2.0, -0.5 ] );
	out = dlatdf( 1, 4, Z, 1, 4, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 4, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});

test( 'dlatdf: IJOB=2, 4x4 system', function t() {
	var IPIV;
	var JPIV;
	var RHS;
	var out;
	var tc;
	var Z;

	tc = ijob2_4x4;
	Z = new Float64Array([
		5.0,
		7.0,
		6.0,
		5.0,
		7.0,
		10.0,
		8.0,
		7.0,
		6.0,
		8.0,
		10.0,
		9.0,
		5.0,
		7.0,
		9.0,
		10.0
	]);
	IPIV = new Int32Array( 4 );
	JPIV = new Int32Array( 4 );
	dgetc2( 4, Z, 1, 4, 0, IPIV, 1, 0, JPIV, 1, 0 );
	RHS = new Float64Array( [ 1.0, -1.0, 2.0, -0.5 ] );
	out = dlatdf( 2, 4, Z, 1, 4, 0, RHS, 1, 0, 0.0, 1.0, IPIV, 1, 0, JPIV, 1, 0 );
	assertArrayClose( RHS, 0, 1, tc.rhs, 4, 1e-12, 'rhs' );
	assertClose( out.rdsum, tc.rdsum, 1e-12, 'rdsum' );
	assertClose( out.rdscal, tc.rdscal, 1e-12, 'rdscal' );
});
