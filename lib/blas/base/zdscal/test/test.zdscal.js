/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zdscal from './../lib/zdscal.js';


// TESTS //

test( 'zdscal is a function', function t() {
	assert.strictEqual( typeof zdscal, 'function', 'is a function' );
});

test( 'zdscal has expected arity', function t() {
	assert.strictEqual( zdscal.length, 4, 'has expected arity' );
});

test( 'zdscal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zdscal( -1, 2, 2, 1 );
	}, RangeError );
});
