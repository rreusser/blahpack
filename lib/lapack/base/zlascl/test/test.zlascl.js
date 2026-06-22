/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlascl from './../lib/zlascl.js';


// TESTS //

test( 'zlascl is a function', function t() {
	assert.strictEqual( typeof zlascl, 'function', 'is a function' );
});

test( 'zlascl has expected arity', function t() {
	assert.strictEqual( zlascl.length, 10, 'has expected arity' );
});

test( 'zlascl throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlascl( 'invalid', 2, 2, 2, 2, 2, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlascl throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlascl( 'row-major', 2, 2, 2, 2, 2, -1, new Float64Array( 4 ), new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlascl throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlascl( 'row-major', 2, 2, 2, 2, 2, new Float64Array( 4 ), -1, new Float64Array( 4 ), 2 );
	}, RangeError );
});
