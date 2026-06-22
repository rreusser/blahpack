/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import zhetrs3 from './../lib/zhetrs_3.js';


// TESTS //

test( 'zhetrs3 is a function', function t() {
	assert.strictEqual( typeof zhetrs3, 'function', 'is a function' );
});

test( 'zhetrs3 has expected arity', function t() {
	assert.strictEqual( zhetrs3.length, 12, 'has expected arity' );
});

test( 'zhetrs3 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhetrs3( 'invalid', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs3 throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhetrs3( 'row-major', 'invalid', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, TypeError );
});

test( 'zhetrs3 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhetrs3( 'row-major', 'upper', -1, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zhetrs3 throws RangeError for negative nrhs', function t() {
	assert.throws( function throws() {
		zhetrs3( 'row-major', 'upper', 2, -1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zhetrs3 throws RangeError for LDA < N', function t() {
	assert.throws( function throws() {
		zhetrs3( 'row-major', 'upper', 2, 1, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 2 );
	}, RangeError );
});

test( 'zhetrs3 throws RangeError for LDB < N', function t() {
	assert.throws( function throws() {
		zhetrs3( 'row-major', 'upper', 2, 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Int32Array( 2 ), 1, new Complex128Array( 2 ), 1 );
	}, RangeError );
});
