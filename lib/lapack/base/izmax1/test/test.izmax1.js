/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import izmax1 from './../lib/izmax1.js';


// TESTS //

test( 'izmax1 is a function', function t() {
	assert.strictEqual( typeof izmax1, 'function', 'is a function' );
});

test( 'izmax1 has expected arity', function t() {
	assert.strictEqual( izmax1.length, 3, 'has expected arity' );
});

test( 'izmax1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		izmax1( -1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
