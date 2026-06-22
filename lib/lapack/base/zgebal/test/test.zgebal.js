/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgebal from './../lib/zgebal.js';


// TESTS //

test( 'zgebal is a function', function t() {
	assert.strictEqual( typeof zgebal, 'function', 'is a function' );
});

test( 'zgebal has expected arity', function t() {
	assert.strictEqual( zgebal.length, 6, 'has expected arity' );
});

test( 'zgebal throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgebal( 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
