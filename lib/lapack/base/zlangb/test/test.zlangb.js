/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlangb from './../lib/zlangb.js';


// TESTS //

test( 'zlangb is a function', function t() {
	assert.strictEqual( typeof zlangb, 'function', 'is a function' );
});

test( 'zlangb has expected arity', function t() {
	assert.strictEqual( zlangb.length, 8, 'has expected arity' );
});

test( 'zlangb throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		zlangb( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zlangb throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlangb( 'max', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
