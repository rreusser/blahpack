/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zggrqf from './../lib/zggrqf.js';


// TESTS //

test( 'zggrqf is a function', function t() {
	assert.strictEqual( typeof zggrqf, 'function', 'is a function' );
});

test( 'zggrqf has expected arity', function t() {
	assert.strictEqual( zggrqf.length, 14, 'has expected arity' );
});

test( 'zggrqf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zggrqf( -1, 2, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zggrqf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zggrqf( new Float64Array( 4 ), 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});
