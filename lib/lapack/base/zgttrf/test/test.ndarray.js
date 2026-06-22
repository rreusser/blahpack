/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgttrf from './../lib/ndarray.js';

// FIXTURES //

import basic_4 from './fixtures/basic_4.json' with { type: 'json' };
import pivot_4 from './fixtures/pivot_4.json' with { type: 'json' };
import n1 from './fixtures/n1.json' with { type: 'json' };
import n2_nopivot from './fixtures/n2_nopivot.json' with { type: 'json' };
import n2_pivot from './fixtures/n2_pivot.json' with { type: 'json' };

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
* ToF64.
*
* @private
* @param {*} cArr - cArr
* @returns {*} result
*/
function toF64( cArr ) {
	return Array.prototype.slice.call( reinterpret( cArr, 0 ) );
}

// TESTS //

test( 'zgttrf: basic 4x4, no pivoting (diag dominant)', function t() {
	var IPIV;
	var info;
	var DU2;
	var tc;
	var DL;
	var DU;
	var D;
	var i;

	tc = basic_4;
	DL = new Complex128Array( new Float64Array( [ 1.0, 0.0, 1.0, 0.5, 0.5, 0.0 ] ) ); // eslint-disable-line max-len
	D = new Complex128Array( new Float64Array( [ 4.0, 1.0, 5.0, -1.0, 6.0, 0.0, 3.0, 2.0 ] ) ); // eslint-disable-line max-len
	DU = new Complex128Array( new Float64Array( [ 2.0, 0.0, 1.0, -1.0, 0.5, 0.5 ] ) ); // eslint-disable-line max-len
	DU2 = new Complex128Array( 2 );
	IPIV = new Int32Array( 4 );
	info = zgttrf( 4, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( DL ), tc.DL, 1e-14, 'DL' );
	assertArrayClose( toF64( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toF64( DU ), tc.DU, 1e-14, 'DU' );
	assertArrayClose( toF64( DU2 ), tc.DU2, 1e-14, 'DU2' );
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgttrf: 4x4 with pivoting (small diag, large subdiag)', function t() {
	var IPIV;
	var info;
	var DU2;
	var tc;
	var DL;
	var DU;
	var D;
	var i;

	tc = pivot_4;
	DL = new Complex128Array( new Float64Array( [ 10.0, 5.0, 8.0, 0.0, 7.0, -3.0 ] ) ); // eslint-disable-line max-len
	D = new Complex128Array( new Float64Array( [ 0.1, 0.0, 0.2, 0.1, 0.3, 0.0, 0.4, -0.1 ] ) ); // eslint-disable-line max-len
	DU = new Complex128Array( new Float64Array( [ 1.0, 1.0, 2.0, 0.0, 3.0, -1.0 ] ) ); // eslint-disable-line max-len
	DU2 = new Complex128Array( 2 );
	IPIV = new Int32Array( 4 );
	info = zgttrf( 4, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( DL ), tc.DL, 1e-14, 'DL' );
	assertArrayClose( toF64( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toF64( DU ), tc.DU, 1e-14, 'DU' );
	assertArrayClose( toF64( DU2 ), tc.DU2, 1e-14, 'DU2' );
	for ( i = 0; i < 4; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgttrf: N=1', function t() {
	var IPIV;
	var info;
	var DU2;
	var tc;
	var DL;
	var DU;
	var D;

	tc = n1;
	DL = new Complex128Array( 1 );
	D = new Complex128Array( new Float64Array( [ 3.0, 2.0 ] ) );
	DU = new Complex128Array( 1 );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zgttrf( 1, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( D ), tc.D, 1e-14, 'D' );
	assert.strictEqual( IPIV[ 0 ], tc.ipiv[ 0 ] - 1, 'ipiv[0]' );
});

test( 'zgttrf: N=2, no pivot', function t() {
	var IPIV;
	var info;
	var DU2;
	var tc;
	var DL;
	var DU;
	var D;
	var i;

	tc = n2_nopivot;
	DL = new Complex128Array( new Float64Array( [ 3.0, 1.0 ] ) );
	D = new Complex128Array( new Float64Array( [ 5.0, -1.0, 4.0, 2.0 ] ) );
	DU = new Complex128Array( new Float64Array( [ 2.0, 0.0 ] ) );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( 2 );
	info = zgttrf( 2, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( DL ), tc.DL, 1e-14, 'DL' );
	assertArrayClose( toF64( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toF64( DU ), tc.DU, 1e-14, 'DU' );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgttrf: N=2, with pivot', function t() {
	var IPIV;
	var info;
	var DU2;
	var tc;
	var DL;
	var DU;
	var D;
	var i;

	tc = n2_pivot;
	DL = new Complex128Array( new Float64Array( [ 10.0, 5.0 ] ) );
	D = new Complex128Array( new Float64Array( [ 0.1, 0.0, 3.0, 0.0 ] ) );
	DU = new Complex128Array( new Float64Array( [ 1.0, 0.0 ] ) );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( 2 );
	info = zgttrf( 2, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( toF64( DL ), tc.DL, 1e-14, 'DL' );
	assertArrayClose( toF64( D ), tc.D, 1e-14, 'D' );
	assertArrayClose( toF64( DU ), tc.DU, 1e-14, 'DU' );
	for ( i = 0; i < 2; i++ ) {
		assert.strictEqual( IPIV[ i ], tc.ipiv[ i ] - 1, 'ipiv[' + i + ']' );
	}
});

test( 'zgttrf: N=0', function t() {
	var IPIV;
	var info;
	var DU2;
	var DL;
	var DU;
	var D;

	DL = new Complex128Array( 1 );
	D = new Complex128Array( 1 );
	DU = new Complex128Array( 1 );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( 1 );
	info = zgttrf( 0, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.strictEqual( info, 0, 'info' );
});

test( 'zgttrf: singular matrix returns info > 0', function t() {
	var IPIV;
	var info;
	var DU2;
	var DL;
	var DU;
	var D;

	DL = new Complex128Array( new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] ) );
	D = new Complex128Array( new Float64Array( [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ] ) ); // eslint-disable-line max-len
	DU = new Complex128Array( new Float64Array( [ 0.0, 0.0, 0.0, 0.0 ] ) );
	DU2 = new Complex128Array( 1 );
	IPIV = new Int32Array( 3 );
	info = zgttrf( 3, DL, 1, 0, D, 1, 0, DU, 1, 0, DU2, 1, 0, IPIV, 1, 0 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});
