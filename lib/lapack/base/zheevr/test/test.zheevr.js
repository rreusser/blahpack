/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zheevr from './../lib/zheevr.js';


// TESTS //

test( 'zheevr is a function', function t() {
	assert.strictEqual( typeof zheevr, 'function', 'is a function' );
});

test( 'zheevr has expected arity', function t() {
	assert.strictEqual( zheevr.length, 27, 'has expected arity' );
});

test( 'zheevr throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zheevr( 2, 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zheevr throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zheevr( 2, 2, 'upper', -1, new Float64Array( 4 ), 2, 2, 2, 2, 2, 2, 2, 2, 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
