/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zgbtrf from './../lib/zgbtrf.js';


// TESTS //

test( 'zgbtrf is a function', function t() {
	assert.strictEqual( typeof zgbtrf, 'function', 'is a function' );
});

test( 'zgbtrf has expected arity', function t() {
	assert.strictEqual( zgbtrf.length, 9, 'has expected arity' );
});

test( 'zgbtrf throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zgbtrf( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, TypeError );
});

test( 'zgbtrf throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zgbtrf( 'row-major', -1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});

test( 'zgbtrf throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zgbtrf( 'row-major', new Float64Array( 4 ), -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1 );
	}, RangeError );
});
