/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgeru from './../lib/zgeru.js';


// TESTS //

test( 'zgeru is a function', function t() {
	assert.strictEqual( typeof zgeru, 'function', 'is a function' );
});

test( 'zgeru has expected arity', function t() {
	assert.strictEqual( zgeru.length, 10, 'has expected arity' );
});

test( 'zgeru throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgeru( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zgeru throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgeru( 'row-major', -1, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zgeru throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgeru( 'row-major', new Float64Array( 4 ), -1, 2, 2, 1, 2, 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
