/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlaqps from './../lib/zlaqps.js';


// TESTS //

test( 'zlaqps is a function', function t() {
	assert.strictEqual( typeof zlaqps, 'function', 'is a function' );
});

test( 'zlaqps has expected arity', function t() {
	assert.strictEqual( zlaqps.length, 19, 'has expected arity' );
});

test( 'zlaqps throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaqps( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlaqps throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlaqps( 'row-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlaqps throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaqps( 'row-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
