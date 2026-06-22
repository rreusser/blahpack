/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrsen from './../lib/ztrsen.js';


// TESTS //

test( 'ztrsen is a function', function t() {
	assert.strictEqual( typeof ztrsen, 'function', 'is a function' );
});

test( 'ztrsen has expected arity', function t() {
	assert.strictEqual( ztrsen.length, 17, 'has expected arity' );
});

test( 'ztrsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		ztrsen( 2, 2, new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'ztrsen throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		ztrsen( 2, 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, -1, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
