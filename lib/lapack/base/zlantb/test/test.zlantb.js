/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlantb from './../lib/zlantb.js';


// TESTS //

test( 'zlantb is a function', function t() {
	assert.strictEqual( typeof zlantb, 'function', 'is a function' );
});

test( 'zlantb has expected arity', function t() {
	assert.strictEqual( zlantb.length, 9, 'has expected arity' );
});

test( 'zlantb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlantb( 'invalid', 'upper', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlantb throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zlantb( 'max', 'invalid', 'non-unit', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlantb throws TypeError for invalid diag', function t() {
	assert.throws( function throws() {
		zlantb( 'max', 'upper', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlantb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlantb( 'max', 'upper', 'non-unit', -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zlantb throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlantb( 'max', 'upper', 'non-unit', new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
