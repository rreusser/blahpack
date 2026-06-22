/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zsytriRook from './../lib/zsytri_rook.js';


// TESTS //

test( 'zsytri_rook is a function', function t() {
	assert.strictEqual( typeof zsytriRook, 'function', 'is a function' );
});

test( 'zsytri_rook has expected arity', function t() {
	assert.strictEqual( zsytriRook.length, 8, 'has expected arity' );
});

test( 'zsytri_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zsytriRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zsytri_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zsytriRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zsytri_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zsytriRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, RangeError );
});

test( 'zsytri_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		zsytriRook( 'column-major', 'upper', 3, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'zsytri_rook quick-returns for N=0', function t() {
	var info = zsytriRook( 'column-major', 'upper', 0, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1, new Complex128Array( 0 ) );
	assert.equal( info, 0, 'info' );
});
