/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgetc2 from './../lib/zgetc2.js';


// TESTS //

test( 'zgetc2 is a function', function t() {
	assert.strictEqual( typeof zgetc2, 'function', 'is a function' );
});

test( 'zgetc2 has expected arity', function t() {
	assert.strictEqual( zgetc2.length, 7, 'has expected arity' );
});

test( 'zgetc2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgetc2( -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
