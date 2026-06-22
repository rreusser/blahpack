/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dzsum1 from './../lib/dzsum1.js';


// TESTS //

test( 'dzsum1 is a function', function t() {
	assert.strictEqual( typeof dzsum1, 'function', 'is a function' );
});

test( 'dzsum1 has expected arity', function t() {
	assert.strictEqual( dzsum1.length, 3, 'has expected arity' );
});

test( 'dzsum1 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dzsum1( -1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
