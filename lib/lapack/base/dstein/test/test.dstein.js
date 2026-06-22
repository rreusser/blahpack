/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dstein from './../lib/dstein.js';


// TESTS //

test( 'dstein is a function', function t() {
	assert.strictEqual( typeof dstein, 'function', 'is a function' );
});

test( 'dstein has expected arity', function t() {
	assert.strictEqual( dstein.length, 20, 'has expected arity' );
});

test( 'dstein throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dstein( -1, 2, 1, 2, 1, new Float64Array( 4 ), 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'dstein throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dstein( new Float64Array( 4 ), 2, 1, 2, 1, -1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1 );
	}, RangeError );
});
