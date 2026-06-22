/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlahr2 from './../lib/zlahr2.js';


// TESTS //

test( 'zlahr2 is a function', function t() {
	assert.strictEqual( typeof zlahr2, 'function', 'is a function' );
});

test( 'zlahr2 has expected arity', function t() {
	assert.strictEqual( zlahr2.length, 18, 'has expected arity' );
});

test( 'zlahr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlahr2( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, 1, 2, 2, 1, 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 1, 2 );
	}, RangeError );
});

test( 'zlahr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zlahr2( new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 1, 1, 2, 2, 1, 2, new Float64Array( 4 ), 1, 1, 2, new Float64Array( 4 ), 1, 1, 2 );
	}, RangeError );
});
