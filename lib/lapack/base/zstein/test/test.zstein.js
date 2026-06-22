/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zstein from './../lib/zstein.js';


// TESTS //

test( 'zstein is a function', function t() {
	assert.strictEqual( typeof zstein, 'function', 'is a function' );
});

test( 'zstein has expected arity', function t() {
	assert.strictEqual( zstein.length, 20, 'has expected arity' );
});

test( 'zstein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zstein( -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zstein throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zstein( new Float64Array( 4 ), 2, 1, 2, 1, -1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
