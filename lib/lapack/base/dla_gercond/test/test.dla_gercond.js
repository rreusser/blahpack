/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, camelcase */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gercond from './../lib/dla_gercond.js';


// TESTS //

test( 'dla_gercond is a function', function t() {
	assert.strictEqual( typeof dla_gercond, 'function', 'is a function' );
});

test( 'dla_gercond has expected arity', function t() {
	assert.strictEqual( dla_gercond.length, 18, 'has expected arity' );
});

test( 'dla_gercond throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_gercond( 'invalid', 'no-transpose', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dla_gercond throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		dla_gercond( 'row-major', 'invalid', 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, TypeError );
});

test( 'dla_gercond throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_gercond( 'row-major', 'no-transpose', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, 2 );
	}, RangeError );
});
