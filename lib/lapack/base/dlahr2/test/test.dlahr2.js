/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlahr2 from './../lib/dlahr2.js';


// TESTS //

test( 'dlahr2 is a function', function t() {
	assert.strictEqual( typeof dlahr2, 'function', 'is a function' );
});

test( 'dlahr2 has expected arity', function t() {
	assert.strictEqual( dlahr2.length, 14, 'has expected arity' );
});

test( 'dlahr2 throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dlahr2( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 1, 2 );
	}, TypeError );
});

test( 'dlahr2 throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dlahr2( 'row-major', -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 1, 2 );
	}, RangeError );
});

test( 'dlahr2 throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		dlahr2( 'row-major', new Float64Array( 4 ), -1, 2, new Float64Array( 4 ), 2, 2, 1, 2, 1, 2, 2, 1, 2 );
	}, RangeError );
});
