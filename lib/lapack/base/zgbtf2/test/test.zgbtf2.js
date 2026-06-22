/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbtf2 from './../lib/zgbtf2.js';


// TESTS //

test( 'zgbtf2 is a function', function t() {
	assert.strictEqual( typeof zgbtf2, 'function', 'is a function' );
});

test( 'zgbtf2 has expected arity', function t() {
	assert.strictEqual( zgbtf2.length, 9, 'has expected arity' );
});

test( 'zgbtf2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgbtf2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgbtf2 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgbtf2( 'row-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgbtf2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbtf2( 'row-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
