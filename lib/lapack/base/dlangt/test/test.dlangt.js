/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlangt from './../lib/dlangt.js';


// TESTS //

test( 'dlangt is a function', function t() {
	assert.strictEqual( typeof dlangt, 'function', 'is a function' );
});

test( 'dlangt has expected arity', function t() {
	assert.strictEqual( dlangt.length, 8, 'has expected arity' );
});

test( 'dlangt throws TypeError for invalid norm', function t() {
	assert.throws( function throws() {
		dlangt( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'dlangt throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlangt( 'max', -1, new Float64Array( 4 ), 1, 2, 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
