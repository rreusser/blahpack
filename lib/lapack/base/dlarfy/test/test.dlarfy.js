
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarfy from './../lib/dlarfy.js';


// TESTS //

test( 'dlarfy is a function', function t() {
	assert.strictEqual( typeof dlarfy, 'function', 'is a function' );
});

test( 'dlarfy has expected arity', function t() {
	assert.strictEqual( dlarfy.length, 10, 'has expected arity' );
});

test( 'dlarfy throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlarfy( 'invalid', 'upper', 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfy throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		dlarfy( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dlarfy throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlarfy( 'row-major', 'upper', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
