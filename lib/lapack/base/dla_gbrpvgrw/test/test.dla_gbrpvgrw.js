/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dla_gbrpvgrw from './../lib/dla_gbrpvgrw.js';


// TESTS //

test( 'dla_gbrpvgrw is a function', function t() {
	assert.strictEqual( typeof dla_gbrpvgrw, 'function', 'is a function' );
});

test( 'dla_gbrpvgrw has expected arity', function t() {
	assert.strictEqual( dla_gbrpvgrw.length, 9, 'has expected arity' );
});

test( 'dla_gbrpvgrw throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dla_gbrpvgrw( 'invalid', new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'dla_gbrpvgrw throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dla_gbrpvgrw( 'row-major', -1, 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
