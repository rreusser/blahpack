/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbequ from './../lib/zgbequ.js';


// TESTS //

test( 'zgbequ is a function', function t() {
	assert.strictEqual( typeof zgbequ, 'function', 'is a function' );
});

test( 'zgbequ has expected arity', function t() {
	assert.strictEqual( zgbequ.length, 10, 'has expected arity' );
});

test( 'zgbequ throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgbequ( -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1 );
	}, RangeError );
});

test( 'zgbequ throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbequ( new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1 );
	}, RangeError );
});
