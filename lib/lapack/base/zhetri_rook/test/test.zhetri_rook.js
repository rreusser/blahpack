/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zhetriRook from './../lib/zhetri_rook.js';


// TESTS //

test( 'zhetri_rook is a function', function t() {
	assert.strictEqual( typeof zhetriRook, 'function', 'is a function' );
});

test( 'zhetri_rook has expected arity', function t() {
	assert.strictEqual( zhetriRook.length, 8, 'has expected arity' );
});

test( 'zhetri_rook throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetriRook( 'invalid', 'upper', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zhetri_rook throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetriRook( 'row-major', 'invalid', 2, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, TypeError );
});

test( 'zhetri_rook throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetriRook( 'row-major', 'upper', -1, new Complex128Array( 4 ), 2, new Int32Array( 2 ), 1, new Complex128Array( 2 ) );
	}, RangeError );
});

test( 'zhetri_rook throws RangeError for too small LDA', function t() {
	assert.throws( function throws() {
		zhetriRook( 'column-major', 'upper', 3, new Complex128Array( 9 ), 2, new Int32Array( 3 ), 1, new Complex128Array( 3 ) );
	}, RangeError );
});

test( 'zhetri_rook quick-returns for N=0', function t() {
	var info = zhetriRook( 'column-major', 'upper', 0, new Complex128Array( 0 ), 1, new Int32Array( 0 ), 1, new Complex128Array( 0 ) );
	assert.equal( info, 0, 'info' );
});
