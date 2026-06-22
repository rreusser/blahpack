/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dgesv from './../lib/dgesv.js';


// FUNCTIONS //

/**
* Asserts that two arrays are element-wise approximately equal.
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


// TESTS //

test( 'dgesv is a function', function t() {
	assert.strictEqual( typeof dgesv, 'function', 'is a function' );
});

test( 'dgesv has expected arity', function t() {
	assert.strictEqual( dgesv.length, 9, 'has expected arity' );
});

test( 'dgesv throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgesv( 'invalid', 2, 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, TypeError );
});

test( 'dgesv throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgesv( 'row-major', -1, 1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dgesv throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		dgesv( 'row-major', 2, -1, new Float64Array( 4 ), 2, new Int32Array( 2 ), 1, new Float64Array( 2 ), 2 );
	}, RangeError );
});

test( 'dgesv solves a 2x2 system (row-major)', function t() {
	var IPIV = new Int32Array( 2 );
	var info;
	var A;
	var B;

	// A = [[1, 2], [3, 4]], nrhs=2, X1=[1,2] X2=[3,4], B=A*X row-major:
	A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
	B = new Float64Array( [ 5.0, 11.0, 11.0, 25.0 ] );
	info = dgesv( 'row-major', 2, 2, A, 2, IPIV, 1, B, 2 );
	assert.strictEqual( info, 0, 'info is 0' );
	assertClose( B[ 0 ], 1.0, 1e-14, 'x[0,0]' );
	assertClose( B[ 1 ], 3.0, 1e-14, 'x[0,1]' );
	assertClose( B[ 2 ], 2.0, 1e-14, 'x[1,0]' );
	assertClose( B[ 3 ], 4.0, 1e-14, 'x[1,1]' );
});

test( 'dgesv solves a 2x2 system (column-major)', function t() {
	var IPIV = new Int32Array( 2 );
	var info;
	var A;
	var B;

	// A = [[1, 2], [3, 4]] col-major = [1, 3, 2, 4], B = [5, 11], X = [1, 2]:
	A = new Float64Array( [ 1.0, 3.0, 2.0, 4.0 ] );
	B = new Float64Array( [ 5.0, 11.0 ] );
	info = dgesv( 'column-major', 2, 1, A, 2, IPIV, 1, B, 2 );
	assert.strictEqual( info, 0, 'info is 0' );
	assertClose( B[ 0 ], 1.0, 1e-14, 'x[0]' );
	assertClose( B[ 1 ], 2.0, 1e-14, 'x[1]' );
});

test( 'dgesv returns info > 0 for singular matrix', function t() {
	var IPIV = new Int32Array( 2 );
	var info;
	var A;
	var B;

	// Singular matrix: A = [[1, 2], [2, 4]]:
	A = new Float64Array( [ 1.0, 2.0, 2.0, 4.0 ] );
	B = new Float64Array( [ 1.0, 2.0 ] );
	info = dgesv( 'row-major', 2, 1, A, 2, IPIV, 1, B, 2 );
	assert.ok( info > 0, 'info > 0 for singular matrix' );
});
