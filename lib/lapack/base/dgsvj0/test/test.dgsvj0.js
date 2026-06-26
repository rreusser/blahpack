
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgsvj0 from './../lib/dgsvj0.js';


// TESTS //

test( 'dgsvj0 is a function', function t() {
	assert.strictEqual( typeof dgsvj0, 'function', 'is a function' );
});

test( 'dgsvj0 has expected arity', function t() {
	assert.strictEqual( dgsvj0.length, 20, 'has expected arity' );
});

test( 'dgsvj0 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dgsvj0( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dgsvj0 throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		dgsvj0( 'row-major', 2, -1, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});

test( 'dgsvj0 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dgsvj0( 'row-major', 2, 2, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), 2, 2, 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
