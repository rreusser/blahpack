/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zlabrd from './../lib/zlabrd.js';


// TESTS //

test( 'zlabrd is a function', function t() {
	assert.strictEqual( typeof zlabrd, 'function', 'is a function' );
});

test( 'zlabrd has expected arity', function t() {
	assert.strictEqual( zlabrd.length, 18, 'has expected arity' );
});

test( 'zlabrd throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlabrd( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, TypeError );
});

test( 'zlabrd throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zlabrd( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});

test( 'zlabrd throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlabrd( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2 );
	}, RangeError );
});
