
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dhgeqz from './../lib/dhgeqz.js';


// TESTS //

test( 'dhgeqz is a function', function t() {
	assert.strictEqual( typeof dhgeqz, 'function', 'is a function' );
});

test( 'dhgeqz has expected arity', function t() {
	assert.strictEqual( dhgeqz.length, 24, 'has expected arity' );
});

test( 'dhgeqz throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dhgeqz( 'invalid', 'no-transpose', 'no-transpose', 'no-transpose', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dhgeqz throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dhgeqz( 'row-major', 'no-transpose', 'no-transpose', 'no-transpose', -1, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2 );
	}, RangeError );
});
